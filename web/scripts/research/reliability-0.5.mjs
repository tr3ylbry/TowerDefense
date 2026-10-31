// Repeatable production-build investigation. All play uses public controls.
// Usage: node scripts/research/reliability-0.5.mjs before /absolute/frozen/dist
import { chromium } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const label = process.argv[2];
const buildDir = process.argv[3];
if (!/^[a-z0-9-]+$/.test(label ?? "") || !path.isAbsolute(buildDir ?? ""))
  throw Error(
    "Pass a simple label and absolute frozen production build directory.",
  );
const baseURL = process.env.AVA_PERF_URL ?? "http://127.0.0.1:4174/";
const output = new URL(
  "../../reports/expedition-0.5/performance/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
async function hashes(dir, prefix = "") {
  const result = {};
  for (const file of (await readdir(dir, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const relative = prefix + file.name;
    if (file.isDirectory())
      Object.assign(
        result,
        await hashes(path.join(dir, file.name), relative + "/"),
      );
    else if (file.isFile()) {
      const body = await readFile(path.join(dir, file.name));
      result[relative] = {
        bytes: body.length,
        sha256: createHash("sha256").update(body).digest("hex"),
      };
    }
  }
  return result;
}
const browser = await chromium.launch({ headless: true });
const report = {
  label,
  sourceCommitAtCapture: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  sourceStatusAtCapture: execFileSync("git", ["status", "--short"], {
    encoding: "utf8",
  }).trim(),
  measuredAtUTC: new Date().toISOString(),
  baseURL,
  buildDir,
  frozenFiles: await hashes(buildDir),
  browserVersion: browser.version(),
  host: {
    platform: os.platform(),
    arch: os.arch(),
    cpu: os.cpus()[0]?.model,
    node: process.version,
  },
  conditions: [],
  complete: false,
  limitations:
    "Local production preview; headless desktop Chromium; network/CPU emulation, not physical hardware. No forced GC, GPU/native heap accounting, native Safari or remote hosting. Resource/trace instrumentation adds overhead. RAF samples include public-control automation. Trace sums can overlap and are not exclusive wall-time attribution.",
};
const save = () =>
  writeFile(
    new URL(`${label}.json`, output),
    JSON.stringify(report, null, 2) + "\n",
  );
let activePage;
try {
  for (const constrained of [false, true]) {
    const condition = {
      name: constrained ? "constrained" : "local-control",
      network: constrained
        ? {
            latencyMs: 150,
            downloadBytesPerSec: 200000,
            uploadBytesPerSec: 75000,
          }
        : null,
      cpuRate: constrained ? 4 : 1,
      startups: [],
      transitions: [],
      combat: null,
    };
    report.conditions.push(condition);
    for (let run = 0; run < 3; run++) {
      console.log(`${label}: ${condition.name} startup ${run + 1}/3`);
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });
      const page = await context.newPage();
      activePage = page;
      page.setDefaultTimeout(120000);
      const errors = [],
        pending = [],
        images = new Map();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        const url = new URL(response.url());
        if (
          url.protocol === "http:" &&
          /^\/art\/.+\.(png|webp|avif)$/.test(url.pathname)
        )
          pending.push(
            response
              .body()
              .then((body) => images.set(url.pathname, body.length))
              .catch(() => {}),
          );
      });
      await page.addInitScript(() => {
        window.__perf05 = {
          playable: null,
          longTasks: [],
          frames: { last: 0, gaps: [] },
        };
        new PerformanceObserver((list) => {
          window.__perf05.longTasks.push(
            ...list
              .getEntries()
              .map((x) => ({ start: x.startTime, duration: x.duration })),
          );
        }).observe({ type: "longtask", buffered: true });
        const check = () => {
          const start = document.querySelector("#start");
          if (
            window.__perf05.playable === null &&
            start &&
            !start.disabled &&
            /Begin mission/.test(start.textContent)
          )
            window.__perf05.playable = performance.now();
        };
        new MutationObserver(check).observe(document, {
          childList: true,
          attributes: true,
          subtree: true,
        });
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Performance.enable");
      if (constrained) {
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: 200000,
          uploadThroughput: 75000,
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      await page.goto(baseURL);
      await page.waitForFunction(() => window.__perf05.playable !== null);
      const metrics = await cdp.send("Performance.getMetrics");
      const startup = await page.evaluate(() => {
        const ready = window.__perf05.playable;
        const resources = performance
          .getEntriesByType("resource")
          .filter((x) => x.responseEnd <= ready)
          .map((x) => ({
            path: new URL(x.name).pathname,
            initiator: x.initiatorType,
            startMs: x.startTime,
            responseStartMs: x.responseStart,
            endMs: x.responseEnd,
            transferBytes: x.transferSize,
            encodedBodyBytes: x.encodedBodySize,
            decodedBodyBytes: x.decodedBodySize,
          }))
          .filter((x) => !x.path.startsWith("/blob:"));
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          firstPlayableMs: ready,
          navigation: {
            responseEndMs: navigation.responseEnd,
            domInteractiveMs: navigation.domInteractive,
            loadEndMs: navigation.loadEventEnd,
            transferBytes: navigation.transferSize,
            encodedBodyBytes: navigation.encodedBodySize,
          },
          resources,
          longTasks: window.__perf05.longTasks.filter((x) => x.start <= ready),
          resourceGroups: Object.fromEntries(
            ["javascript", "images", "other"].map((group) => {
              const rows = resources.filter((x) =>
                group === "javascript"
                  ? /\.js$/.test(x.path)
                  : group === "images"
                    ? /\.(png|webp|avif)$/.test(x.path)
                    : !/\.(js|png|webp|avif)$/.test(x.path),
              );
              return [
                group,
                {
                  requests: rows.length,
                  transferBytes: rows.reduce((s, x) => s + x.transferBytes, 0),
                  encodedBodyBytes: rows.reduce(
                    (s, x) => s + x.encodedBodyBytes,
                    0,
                  ),
                  lastEndMs: Math.max(0, ...rows.map((x) => x.endMs)),
                },
              ];
            }),
          ),
        };
      });
      startup.cdpMetrics = Object.fromEntries(
        metrics.metrics
          .filter((x) =>
            [
              "TaskDuration",
              "ScriptDuration",
              "LayoutDuration",
              "RecalcStyleDuration",
              "JSHeapUsedSize",
              "Nodes",
              "Documents",
            ].includes(x.name),
          )
          .map((x) => [x.name, x.value]),
      );
      await page.waitForLoadState("networkidle");
      await Promise.all(pending);
      startup.initialImages = images.size;
      startup.initialImagePayload = [...images.values()].reduce(
        (a, b) => a + b,
        0,
      );
      startup.errors = [...errors];
      condition.startups.push(startup);
      console.log(
        `${condition.name}: ready ${Math.round(startup.firstPlayableMs)}ms; images ${startup.initialImages}/${startup.initialImagePayload}B; TaskDuration ${startup.cdpMetrics.TaskDuration}s`,
      );
      await save();
      if (run === 0 && process.env.AVA_PERF_STARTUP_ONLY !== "1") {
        await page.locator("#start").click();
        await page
          .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
          .click();
        await page.locator("#pause").click();
        const bank = await page.locator("#credits").innerText();
        for (const style of [
          "original",
          "expedition",
          "original",
          "expedition",
        ]) {
          const before = images.size,
            started = Date.now();
          await page.locator("#art-toggle").click();
          await page.locator("#asset-dialog").waitFor({ state: "hidden" });
          await page.waitForLoadState("networkidle");
          await Promise.all(pending);
          condition.transitions.push({
            style,
            wallMs: Date.now() - started,
            newUniqueImages: images.size - before,
            creditsPreserved:
              bank === (await page.locator("#credits").innerText()),
          });
        }
        for (const map of ["bridge", "nest", "canyon", "nest"]) {
          await page.locator("#map-open").click();
          const before = images.size,
            started = Date.now();
          await page.locator(`[data-map="${map}"]`).click();
          await page.locator("#asset-dialog").waitFor({ state: "hidden" });
          await page.waitForLoadState("networkidle");
          await Promise.all(pending);
          condition.transitions.push({
            map,
            wallMs: Date.now() - started,
            newUniqueImages: images.size - before,
            readyCredits: await page.locator("#credits").innerText(),
          });
        }
        await page.locator("#start").click();
        await page.locator("#speed").click();
        await page.evaluate(() => {
          function sample(t) {
            if (!window.__perf05?.sampling) return;
            const s = window.__perf05.frames;
            const late =
              Number(document.querySelector("#wave-number")?.textContent) >=
                3 &&
              document.querySelector("#status")?.textContent ===
                "Mission in progress";
            if (late && s.last) s.gaps.push(t - s.last);
            s.last = late ? t : 0;
            requestAnimationFrame(sample);
          }
          window.__perf05.sampling = true;
          requestAnimationFrame(sample);
        });
        const desired = [
          { kind: "bush", row: 1 },
          { kind: "bush", row: 2 },
          ...["astro", "zeus", "wall"].flatMap((kind) =>
            Array.from({ length: 6 }, (_, i) => ({ kind, row: i + 1 })),
          ),
        ];
        const cost = { bush: 60, astro: 50, zeus: 125, wall: 35 };
        let purchased = 0,
          captured = false;
        const combatStart = Date.now();
        while (
          Date.now() - combatStart < 115000 &&
          (await page.locator("#status").innerText()) === "Mission in progress"
        ) {
          const slot = desired[purchased];
          if (
            slot &&
            Number(await page.locator("#credits").innerText()) >=
              cost[slot.kind]
          ) {
            await page.locator(`[data-tower="${slot.kind}"]`).click();
            const cells = page.getByRole("gridcell", {
              name: new RegExp(`^Lane ${slot.row}, tile .*empty$`),
            });
            await (slot.kind === "wall" ? cells.last() : cells.first()).click();
            purchased++;
          }
          if (
            !captured &&
            (await page.locator("#wave-number").innerText()) === "4"
          ) {
            await page.screenshot({
              path: fileURLToPath(
                new URL(`combat-${label}-${condition.name}.png`, output),
              ),
            });
            captured = true;
          }
          await page.waitForTimeout(120);
        }
        const gaps = await page.evaluate(() => {
          window.__perf05.sampling = false;
          return window.__perf05.frames.gaps;
        });
        gaps.sort((a, b) => a - b);
        const quant = (q) =>
          gaps.length
            ? Math.round(gaps[Math.floor((gaps.length - 1) * q)] * 10) / 10
            : null;
        const heap = await cdp.send("Runtime.getHeapUsage");
        condition.combat = {
          purchased,
          wallMs: Date.now() - combatStart,
          phase: await page.locator("#status").innerText(),
          lateWaveFrameSamples: gaps.length,
          medianFrameGapMs: quant(0.5),
          p95FrameGapMs: quant(0.95),
          gapsOver50ms: gaps.filter((x) => x > 50).length,
          frameGapsMs: gaps,
          jsHeapUsedBytes: heap.usedSize,
        };
        for (let i = 0; i < 5; i++) {
          await page.locator("#restart").click();
          await page.locator("#restart-confirm").click();
          await page.locator("#start").click();
        }
        await page.locator("#pause").click();
        const after = await cdp.send("Runtime.getHeapUsage");
        Object.assign(condition.combat, {
          jsHeapAfterFiveRestartsBytes: after.usedSize,
          canvasesAfterFiveRestarts: await page.locator("canvas").count(),
          errors,
        });
        console.log(
          `${condition.name}: ${condition.combat.phase}, ${gaps.length} samples, p95 ${quant(0.95)}ms`,
        );
        await save();
      }
      await context.close();
    }
  }
  report.complete = true;
  await save();
} catch (error) {
  report.failure = String(error);
  if (activePage && !activePage.isClosed())
    await activePage
      .screenshot({
        path: fileURLToPath(new URL(`failed-${label}.png`, output)),
      })
      .catch(() => {});
  await save();
  throw error;
} finally {
  await browser.close();
}
