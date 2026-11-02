// Matched cold delivery/readiness and a bounded warm campaign asset probe.
// Browser API instrumentation only; no simulation state or clock edits.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const output = new URL(
  "../../reports/expedition-1.0/performance/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const beforeURL = process.env.AVA_BEFORE_URL ?? "http://127.0.0.1:4174/";
const afterURL = process.env.AVA_AFTER_URL ?? "http://127.0.0.1:4175/";
const browser = await chromium.launch({
  channel: process.env.AVA_PROFILE_CHANNEL || undefined,
});
const results = [];
const ids = [
  "first-contact",
  "canyon-escalation",
  "broken-ground",
  "bridge-under-siege",
  "into-the-nest",
  "heart-of-the-swarm",
];
try {
  for (const constrained of [false, true])
    for (let sample = 0; sample < 3; sample++)
      for (const [variant, url] of [
        ["before", beforeURL],
        ["after", afterURL],
      ]) {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 900 },
        });
        const page = await context.newPage();
        page.setDefaultTimeout(120000);
        await page.addInitScript(() => {
          window.__readiness09 = null;
          new MutationObserver(() => {
            const start = document.querySelector("#start");
            if (
              window.__readiness09 === null &&
              start &&
              !start.disabled &&
              /Begin mission/.test(start.textContent)
            )
              window.__readiness09 = performance.now();
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
        await page.goto(url);
        await page.waitForFunction(() => window.__readiness09 !== null);
        const data = await page.evaluate(() => ({
          readyMs: window.__readiness09,
          resources: performance.getEntriesByType("resource").map((r) => ({
            path: new URL(r.name).pathname,
            transferSize: r.transferSize,
            encodedBodySize: r.encodedBodySize,
          })),
        }));
        const images = data.resources.filter((r) =>
          /\.(webp|png)$/.test(r.path),
        );
        const result = {
          variant,
          constrained,
          sample,
          ...data,
          imageCount: new Set(images.map((r) => r.path)).size,
          // CSS portraits and Phaser may report the same file twice; count each body once.
          imageEncodedBytes: [
            ...new Map(images.map((r) => [r.path, r])).values(),
          ].reduce((n, r) => n + r.encodedBodySize, 0),
          totalTransferBytes: data.resources.reduce(
            (n, r) => n + r.transferSize,
            0,
          ),
          navigationTransferBytes: await page.evaluate(
            () => performance.getEntriesByType("navigation")[0].transferSize,
          ),
        };
        results.push(result);
        await context.close();
      }
  await writeFile(
    new URL("startup.json", output),
    JSON.stringify(
      {
        browser: browser.version(),
        conditions: {
          host: "Apple M5 / macOS, headless installed Chrome (AVA_PROFILE_CHANNEL=chrome), serial fresh contexts; alternating frozen 0.9 / 1.0 production builds",
          normal: "No throttling",
          constrained:
            "4× CPU; 150 ms latency; 200000 B/s download, 75000 B/s upload",
          readiness:
            "MutationObserver of actual enabled Begin mission, performance.now from navigation",
        },
        results,
      },
      null,
      2,
    ) + "\n",
  );
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  await page.addInitScript((ids) => {
    localStorage.setItem(
      "ava-campaign",
      JSON.stringify({
        version: 1,
        best: Object.fromEntries(
          ids.map((id) => [
            id,
            { stars: 3, shields: 3, duration: 100, kills: 33 },
          ]),
        ),
      }),
    );
    const textures = new Set();
    window.__textures09 = { created: 0, deleted: 0, active: 0 };
    for (const prototype of [
      window.WebGLRenderingContext?.prototype,
      window.WebGL2RenderingContext?.prototype,
    ].filter(Boolean)) {
      const create = prototype.createTexture,
        remove = prototype.deleteTexture;
      prototype.createTexture = function (...args) {
        const texture = create.apply(this, args);
        if (texture && !textures.has(texture)) {
          textures.add(texture);
          window.__textures09.created++;
          window.__textures09.active = textures.size;
        }
        return texture;
      };
      prototype.deleteTexture = function (texture) {
        if (textures.delete(texture)) {
          window.__textures09.deleted++;
          window.__textures09.active = textures.size;
        }
        return remove.call(this, texture);
      };
    }
  }, ids);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const images = [];
  page.on("request", (r) => {
    if (/\/art\/.*\.(png|webp)$/.test(r.url()))
      images.push(new URL(r.url()).pathname);
  });
  await page.goto(afterURL);
  await page.locator("#start").waitFor({ state: "visible" });
  await page.waitForFunction(() => !document.querySelector("#start").disabled);
  const observations = [];
  async function capture(label) {
    observations.push({
      label,
      textures: await page.evaluate(() => ({ ...window.__textures09 })),
      uniqueImages: new Set(images).size,
      canvases: await page.locator("canvas").count(),
    });
  }
  async function open() {
    if (
      (await page.locator("#map-open").innerText()).includes("Mission control")
    )
      await page.locator("#map-open").click();
    else await page.locator("#campaign-nav").click();
  }
  async function select(id) {
    await page.locator(`[data-review="${id}"]`).click();
    await page.locator("#campaign-launch").click();
    await page.waitForFunction(
      () =>
        !document.querySelector("#asset-dialog").open &&
        !document.querySelector("#start").disabled,
    );
  }
  await capture("initial-standalone");
  await open();
  await capture("board-preview-only");
  await select(ids[1]);
  await capture("same-environment");
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const id of ids) {
      await open();
      await select(id);
    }
    await capture(`expedition-six-mission-cycle-${cycle + 1}`);
  }
  await page.locator("#art-toggle").click();
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("original-art"),
  );
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const id of ids) {
      await open();
      await select(id);
    }
    await capture(`original-six-mission-cycle-${cycle + 1}`);
  }
  await page.locator("#art-toggle").click();
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("original-art"),
  );
  await capture("return-to-expedition");
  await writeFile(
    new URL("cache.json", output),
    JSON.stringify(
      {
        browser: browser.version(),
        method:
          "All-unlocked validated storage fixture only for navigation, not victory evidence. 36 ready-state mission selections through public controls, three cycles per style. Texture handle counts do not measure GPU memory or prove no leaks.",
        observations,
        errors,
        images: [...new Set(images)],
      },
      null,
      2,
    ) + "\n",
  );
  await context.close();
  const sourceSha256 = {};
  for (const directory of ["src/game", "src/campaign"])
    for (const file of await readdir(
      new URL(`../../${directory}/`, import.meta.url),
    )) {
      const path = `${directory}/${file}`;
      sourceSha256[path] = createHash("sha256")
        .update(await readFile(new URL(`../../${path}`, import.meta.url)))
        .digest("hex");
    }
  for (const path of [
    "src/main.ts",
    "src/icons.ts",
    "src/guidance.ts",
    "src/style.css",
    "src/battlefield.ts",
    "src/assets.ts",
    "package.json",
    "package-lock.json",
  ])
    sourceSha256[path] = createHash("sha256")
      .update(await readFile(new URL(`../../${path}`, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL("source-sha256.json", output),
    JSON.stringify(sourceSha256, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        startup: results.map((r) => ({
          variant: r.variant,
          constrained: r.constrained,
          readyMs: r.readyMs,
          imageBytes: r.imageEncodedBytes,
          transfer: r.totalTransferBytes + r.navigationTransferBytes,
        })),
        cache: observations,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
