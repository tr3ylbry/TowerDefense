// Diagnostic startup trace and bounded GPU texture-creation counters.
// Observes browser APIs only; it never changes simulation, money, clocks, or map rules.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const label = process.argv[2];
if (!/^[a-z0-9-]+$/.test(label ?? ""))
  throw Error("Pass a simple report label.");
const output = new URL(
  "../../reports/expedition-0.5/performance/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const constrained of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    await page.addInitScript(() => {
      window.__diagnostic05 = {
        readyMs: null,
        webgl: {
          created: 0,
          deleted: 0,
          active: 0,
          uploadCalls: 0,
          uploadDispatchMs: 0,
        },
        decode: { calls: 0, wallMs: 0 },
      };
      const textures = new Set();
      for (const prototype of [
        window.WebGLRenderingContext?.prototype,
        window.WebGL2RenderingContext?.prototype,
      ].filter(Boolean)) {
        const create = prototype.createTexture,
          remove = prototype.deleteTexture,
          upload = prototype.texImage2D;
        prototype.createTexture = function (...args) {
          const texture = create.apply(this, args);
          const counts = window.__diagnostic05.webgl;
          if (texture && !textures.has(texture)) {
            textures.add(texture);
            counts.created++;
            counts.active = textures.size;
          }
          return texture;
        };
        prototype.deleteTexture = function (texture) {
          if (textures.delete(texture)) {
            window.__diagnostic05.webgl.deleted++;
            window.__diagnostic05.webgl.active = textures.size;
          }
          return remove.call(this, texture);
        };
        prototype.texImage2D = function (...args) {
          const start = performance.now();
          try {
            return upload.apply(this, args);
          } finally {
            const counts = window.__diagnostic05.webgl;
            counts.uploadCalls++;
            counts.uploadDispatchMs += performance.now() - start;
          }
        };
      }
      const originalDecode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = async function (...args) {
        const start = performance.now();
        try {
          return await originalDecode.apply(this, args);
        } finally {
          window.__diagnostic05.decode.calls++;
          window.__diagnostic05.decode.wallMs += performance.now() - start;
        }
      };
      new MutationObserver(() => {
        const start = document.querySelector("#start");
        if (
          window.__diagnostic05.readyMs === null &&
          start &&
          !start.disabled &&
          /Begin mission/.test(start.textContent)
        )
          window.__diagnostic05.readyMs = performance.now();
      }).observe(document, {
        subtree: true,
        attributes: true,
        childList: true,
      });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    if (constrained) {
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: 200000,
        uploadThroughput: 75000,
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    }
    const trace = [];
    cdp.on("Tracing.dataCollected", ({ value }) => trace.push(...value));
    await cdp.send("Tracing.start", {
      categories:
        "devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline",
      options: "record-as-much-as-possible",
    });
    await page.goto(process.env.AVA_PERF_URL ?? "http://127.0.0.1:4174/");
    await page.waitForFunction(() => window.__diagnostic05.readyMs !== null);
    const completed = new Promise((resolve) =>
      cdp.once("Tracing.tracingComplete", resolve),
    );
    await cdp.send("Tracing.end");
    await completed;
    const ready = await page.evaluate(() =>
      structuredClone(window.__diagnostic05),
    );
    const events = trace.filter((x) => x.ph === "X" && x.dur > 0);
    const names = new Map();
    for (const event of events) {
      const row = names.get(event.name) ?? {
        name: event.name,
        count: 0,
        totalMs: 0,
        maxMs: 0,
      };
      row.count++;
      row.totalMs += event.dur / 1000;
      row.maxMs = Math.max(row.maxMs, event.dur / 1000);
      names.set(event.name, row);
    }
    const diagnostic = {
      condition: constrained ? "constrained" : "local-control",
      ready,
      traceEvents: trace.length,
      traceDurationGroups: [...names.values()].sort(
        (a, b) => b.totalMs - a.totalMs,
      ),
      traceNotes:
        "Diagnostic run separate from three startup samples. Totals overlap/nest and span renderer/compositor threads; not exclusive wall-time shares. WebGL upload duration is synchronous JS dispatch, not GPU completion. Decode wrapper only counts explicit HTMLImageElement.decode; browser/Phaser implicit decodes appear in trace when exposed.",
      retention: [],
    };
    const sample = async (operation) => {
      await page.waitForLoadState("networkidle");
      const heap = await cdp.send("Runtime.getHeapUsage");
      diagnostic.retention.push({
        operation,
        heapUsedBytes: heap.usedSize,
        canvases: await page.locator("canvas").count(),
        counters: await page.evaluate(() =>
          structuredClone(window.__diagnostic05.webgl),
        ),
      });
    };
    await sample("initial-ready");
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const map of ["bridge", "nest", "canyon"]) {
        await page.locator("#map-open").click();
        await page.locator(`[data-map="${map}"]`).click();
        await page.locator("#asset-dialog").waitFor({ state: "hidden" });
      }
      await page.locator("#art-toggle").click();
      await page.locator("#asset-dialog").waitFor({ state: "hidden" });
      await page.locator("#art-toggle").click();
      await page.locator("#asset-dialog").waitFor({ state: "hidden" });
      await sample(`all-maps-and-style-cycle-${cycle + 1}`);
    }
    results.push(diagnostic);
    console.log(
      `${label} ${diagnostic.condition}: trace ${trace.length} events, ${ready.readyMs.toFixed(1)}ms, ready ${ready.webgl.created} textures, retained ${diagnostic.retention.at(-1).counters.active}`,
    );
    await writeFile(
      new URL(`profile-${label}.json`, output),
      JSON.stringify(
        { label, complete: false, diagnostics: results },
        null,
        2,
      ) + "\n",
    );
    await context.close();
  }
  await writeFile(
    new URL(`profile-${label}.json`, output),
    JSON.stringify({ label, complete: true, diagnostics: results }, null, 2) +
      "\n",
  );
} finally {
  await browser.close();
}
