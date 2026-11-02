// Render-only fixture, not a gameplay or physical-device benchmark.
import { chromium } from "@playwright/test";
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const browser = await chromium.launch();
const observations = [],
  decodes = [];
const percentile = (a, p) =>
  [...a].sort((a, b) => a - b)[
    Math.min(a.length - 1, Math.floor(a.length * p))
  ];
try {
  for (let sample = 0; sample < 3; sample++)
    for (const mode of ["before", "after"]) {
      const page = await browser.newPage({
        viewport: { width: 1080, height: 660 },
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        `http://127.0.0.1:4173/tests/fixtures/sprinter-density.html?mode=${mode}`,
      );
      await page.waitForFunction(() => window.densityMetrics?.ready);
      await page.waitForTimeout(12000);
      const m = await page.evaluate(() => window.densityMetrics);
      observations.push({
        mode,
        sample,
        count: m.count,
        displayObjects: m.displayObjects,
        textureCount: m.textureCount,
        atlasInitMs: m.atlasInitMs,
        spriteInitMs: m.spriteInitMs,
        frames: m.frames.length,
        medianFrameMs: percentile(m.frames, 0.5),
        p95FrameMs: percentile(m.frames, 0.95),
        p95PoseCpuMs: percentile(m.cpu, 0.95),
        over33ms: m.frames.filter((t) => t > 33.3).length,
        errors,
      });
      await page.close();
    }
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/tests/fixtures/animation-lab.html");
  for (let sample = 0; sample < 6; sample++)
    for (const name of ["sprinter.webp", "sprinter-animation.webp"]) {
      const measurement = await page.evaluate(async (name) => {
        const blob = await (await fetch("/art/expedition/" + name)).blob();
        const url = URL.createObjectURL(blob);
        const image = new Image(),
          start = performance.now();
        image.src = url;
        await image.decode();
        const decodeMs = performance.now() - start;
        const width = image.naturalWidth,
          height = image.naturalHeight;
        URL.revokeObjectURL(url);
        return { decodeMs, width, height, bytes: blob.size };
      }, name);
      decodes.push({ sample, name, ...measurement });
    }
  const sourceSha256 = {};
  for (const file of [
    "tests/fixtures/sprinter-density.html",
    "src/game/alien-animation.ts",
    "src/battlefield.ts",
  ])
    sourceSha256[file] = createHash("sha256")
      .update(await readFile(new URL("../../" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL(
      "../../reports/expedition-0.9/performance/animation.json",
      import.meta.url,
    ),
    JSON.stringify(
      {
        browser: browser.version(),
        method:
          "Serial alternating headless desktop Chromium, no throttling. Fifty render-only Sprinters, two-second warmup then ten-second sample. One Phaser Sprite per creature. Not a simulation, human session, physical-phone test, VRAM or total-memory measurement. Decode times exclude fetch and include blob-backed Image.decode initialization; six repeats per image.",
        observations,
        decodes,
        sourceSha256,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ observations, decodes }, null, 2));
} finally {
  await browser.close();
}
