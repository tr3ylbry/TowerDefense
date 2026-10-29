// Repeatable local browser measurements through normal player controls.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
const label = process.argv[2] ?? "current";
if (!/^[a-z0-9-]+$/.test(label)) throw Error("Use a simple report label.");
const output = fileURLToPath(
  new URL("../../reports/expedition-0.3/performance/", import.meta.url),
);
const browser = await chromium.launch({ headless: true });
const reports = [],
  transitions = [];
try {
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    const images = new Map(),
      pending = [];
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        !["http:", "https:"].includes(url.protocol) ||
        !/^\/art\/.+\.(png|webp)$/.test(url.pathname)
      )
        return;
      pending.push(
        response
          .body()
          .then((body) =>
            images.set(new URL(response.url()).pathname, {
              bytes: body.length,
            }),
          )
          .catch(() => {}),
      );
    });
    const started = performance.now();
    await page.goto("http://127.0.0.1:4173/");
    await page
      .getByRole("button", { name: "Begin mission", exact: true })
      .waitFor({ state: "visible" });
    await page.locator("#start").waitFor({ state: "visible" });
    if (!(await page.locator("#start").isEnabled()))
      throw Error("Mission not playable.");
    const firstPlayableMs = performance.now() - started;
    await page.waitForLoadState("networkidle");
    await Promise.all(pending);
    reports.push({
      run,
      firstPlayableMs: Math.round(firstPlayableMs),
      initialImages: images.size,
      initialImageBytes: [...images.values()].reduce((s, x) => s + x.bytes, 0),
      initialFiles: [...images.keys()].sort(),
    });
    if (run === 0) {
      for (const map of ["bridge", "nest", "canyon"]) {
        const before = new Set(images.keys());
        await page.locator("#map-open").click();
        await page.locator(`[data-map="${map}"]`).click();
        await page.locator("#asset-dialog").waitFor({ state: "hidden" });
        await page.waitForLoadState("networkidle");
        await Promise.all(pending);
        const added = [...images.keys()].filter((key) => !before.has(key));
        transitions.push({
          map,
          newFiles: added,
          newImageBytes: added.reduce(
            (sum, key) => sum + images.get(key).bytes,
            0,
          ),
        });
      }
    }
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page.locator("#speed").click();
  await page.evaluate(() => {
    window.frameGaps = [];
    let last = 0;
    function frame(time) {
      if (last) window.frameGaps.push(time - last);
      last = time;
      window.frameObserver = requestAnimationFrame(frame);
    }
    window.frameObserver = requestAnimationFrame(frame);
  });
  const plan = [
    { kind: "bush", row: 1 },
    { kind: "bush", row: 2 },
    ...["astro", "tars"].flatMap((kind) =>
      Array.from({ length: 6 }, (_, row) => ({ kind, row: row + 1 })),
    ),
  ];
  let next = 0;
  const started = performance.now();
  while (performance.now() - started < 45000) {
    if (next < plan.length) {
      const { kind, row } = plan[next];
      const card = page.locator(`[data-tower="${kind}"]`);
      if (!(await card.getAttribute("class")).includes("unaffordable")) {
        await card.click();
        await page
          .getByRole("gridcell", {
            name: new RegExp(`^Lane ${row}, tile .*empty$`),
          })
          .first()
          .click();
        next++;
      }
    }
    await page.waitForTimeout(100);
  }
  const gaps = await page.evaluate(() => {
    cancelAnimationFrame(window.frameObserver);
    return window.frameGaps;
  });
  gaps.sort((a, b) => a - b);
  const session = await context.newCDPSession(page);
  await session.send("Performance.enable");
  const metrics = await session.send("Performance.getMetrics");
  const combat = {
    wallWindowMs: 45000,
    purchased: next,
    frameSamples: gaps.length,
    medianFrameMs: +gaps[Math.floor(gaps.length * 0.5)].toFixed(2),
    p95FrameMs: +gaps[Math.floor(gaps.length * 0.95)].toFixed(2),
    gapsOver50ms: gaps.filter((x) => x > 50).length,
    jsHeapUsed: metrics.metrics.find((x) => x.name === "JSHeapUsedSize")?.value,
    status: await page.locator("#status").innerText(),
    errors,
  };
  // Repeat lifecycle operations; these must not create another canvas or leave broken controls.
  for (let restart = 0; restart < 5; restart++) {
    await page.locator("#restart").click();
    await page.locator("#restart-confirm").click();
    await page
      .getByRole("button", { name: "Begin mission", exact: true })
      .click();
  }
  combat.canvasesAfterFiveRestarts = await page.locator("canvas").count();
  await context.close();
  await mkdir(output, { recursive: true });
  const result = {
    label,
    engine: "Playwright Chromium",
    conditions:
      "Local macOS ARM64, headless, 1280x800, no network/CPU throttling; cold browser contexts. Frame sampling includes controller overhead. This is not a physical-phone FPS claim. Byte counts are decoded HTTP image payloads, excluding JS/CSS/manifest.",
    startup: reports,
    transitions,
    combat,
  };
  await writeFile(
    `${output}${label}.json`,
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      { label, startup: reports.map(({ initialFiles, ...r }) => r), combat },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
