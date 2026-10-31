// Controlled network/CPU emulation through ordinary game controls; no game-state edits.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const baseURL = "http://127.0.0.1:4174/";
const browser = await chromium.launch({ headless: true });
const output = new URL(
  "../../reports/expedition-0.4/performance/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const report = {
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  measuredAtUTC: new Date().toISOString(),
  browserVersion: browser.version(),
  complete: false,
  host: {
    platform: os.platform(),
    arch: os.arch(),
    cpu: os.cpus()[0]?.model,
    node: process.version,
  },
  conditions: [],
  limitations:
    "Local production-build preview, headless Chromium, emulated network/CPU; not a physical-phone, native Safari, remote-hosting, controlled-GC, GPU-memory, or worst-case FPS claim.",
};
let activePage, activeRun;
try {
  for (const constrained of [false, true]) {
    const result = {
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
      combat: null,
      transitions: [],
    };
    for (let run = 0; run < 3; run++) {
      activeRun = `${result.name}-${run}`;
      console.log(`Starting ${activeRun}`);
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });
      const page = await context.newPage();
      activePage = page;
      page.setDefaultTimeout(120000);
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
      const images = new Map(),
        pending = [],
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        const u = new URL(r.url());
        if (
          u.protocol === "http:" &&
          /^\/art\/.+\.(png|webp)$/.test(u.pathname)
        )
          pending.push(
            r
              .body()
              .then((b) => images.set(u.pathname, b.length))
              .catch(() => {}),
          );
      });
      const started = Date.now();
      await page.goto(baseURL);
      await page
        .getByRole("button", { name: "Begin mission", exact: true })
        .waitFor();
      if (!(await page.locator("#start").isEnabled())) throw Error("Not ready");
      const firstPlayableMs = Date.now() - started;
      await page.waitForLoadState("networkidle");
      await Promise.all(pending);
      result.startups.push({
        run,
        firstPlayableMs,
        initialImages: images.size,
        initialImagePayload: [...images.values()].reduce((a, b) => a + b, 0),
      });
      console.log(`${activeRun}: playable in ${firstPlayableMs}ms`);
      if (run === 0) {
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
            t = Date.now();
          await page.locator("#art-toggle").click();
          await page.locator("#asset-dialog").waitFor({ state: "hidden" });
          await page.waitForLoadState("networkidle");
          await Promise.all(pending);
          result.transitions.push({
            style,
            wallMs: Date.now() - t,
            newUniqueImages: images.size - before,
            creditsPreserved:
              (await page.locator("#credits").innerText()) === bank,
          });
        }
        await page.locator("#map-open").click();
        const before = images.size,
          t = Date.now();
        await page.locator('[data-map="nest"]').click();
        await page.locator("#asset-dialog").waitFor({ state: "hidden" });
        await page.waitForLoadState("networkidle");
        await Promise.all(pending);
        result.transitions.push({
          map: "nest",
          wallMs: Date.now() - t,
          newUniqueImages: images.size - before,
          readyCredits: await page.locator("#credits").innerText(),
        });
        await page.locator("#start").click();
        await page.locator("#speed").click();
        await page.evaluate(() => {
          window.__frames04 = { last: 0, gaps: [] };
          function sample(t) {
            const s = window.__frames04;
            if (!s) return;
            const late =
              Number(document.querySelector("#wave-number")?.textContent) >=
                3 &&
              document.querySelector("#status")?.textContent ===
                "Mission in progress";
            if (late && s.last) s.gaps.push(t - s.last);
            s.last = late ? t : 0;
            requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        });
        const desired = [
          { kind: "bush", row: 1 },
          { kind: "bush", row: 2 },
          ...Array.from({ length: 6 }, (_, i) => ({
            kind: "astro",
            row: i + 1,
          })),
          ...Array.from({ length: 6 }, (_, i) => ({
            kind: "zeus",
            row: i + 1,
          })),
          ...Array.from({ length: 6 }, (_, i) => ({
            kind: "wall",
            row: i + 1,
          })),
        ];
        const cost = { bush: 60, astro: 50, zeus: 125, wall: 35 };
        let purchased = 0;
        let captured = false;
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
              path: fileURLToPath(new URL(`combat-${result.name}.png`, output)),
            });
            captured = true;
          }
          await page.waitForTimeout(120);
        }
        const gaps = await page.evaluate(() => {
          const g = window.__frames04.gaps;
          delete window.__frames04;
          return g;
        });
        gaps.sort((a, b) => a - b);
        const quant = (q) =>
          gaps.length
            ? Math.round(gaps[Math.floor((gaps.length - 1) * q)] * 10) / 10
            : null;
        const heap = await cdp.send("Runtime.getHeapUsage");
        const phase = await page.locator("#status").innerText();
        const combatWallMs = Date.now() - combatStart;
        for (let i = 0; i < 5; i++) {
          await page.locator("#restart").click();
          await page.locator("#restart-confirm").click();
          await page.locator("#start").click();
        }
        await page.locator("#pause").click();
        const afterRestarts = await cdp.send("Runtime.getHeapUsage");
        result.combat = {
          purchased,
          wallMs: combatWallMs,
          phase,
          lateWaveFrameSamples: gaps.length,
          medianFrameGapMs: quant(0.5),
          p95FrameGapMs: quant(0.95),
          gapsOver50ms: gaps.filter((x) => x > 50).length,
          jsHeapUsedBytes: heap.usedSize,
          jsHeapAfterFiveRestartsBytes: afterRestarts.usedSize,
          canvasesAfterFiveRestarts: await page.locator("canvas").count(),
          errors,
        };
        console.log(
          `${result.name}: ${phase}, ${gaps.length} late-wave samples`,
        );
      }
      await context.close();
    }
    report.conditions.push(result);
    await writeFile(
      new URL("reliability.json", output),
      JSON.stringify(report, null, 2) + "\n",
    );
  }
  report.complete = true;
  await mkdir(output, { recursive: true });
  await writeFile(
    new URL("reliability.json", output),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({
      path: fileURLToPath(new URL("failed-attempt.png", output)),
    });
    await writeFile(
      new URL("failed-attempt.json", output),
      JSON.stringify(
        {
          run: activeRun,
          error: String(error),
          body: await activePage.locator("body").innerText(),
        },
        null,
        2,
      ),
    );
  }
  throw error;
} finally {
  await browser.close();
}
