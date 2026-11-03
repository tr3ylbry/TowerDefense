// Production-bundled render fixture. Serial, 2s warm-up +10s sample, 50 units.
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const out = new URL(
  "../../reports/expedition-1.1/performance/",
  import.meta.url,
);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
    channel: process.env.AVA_PROFILE_CHANNEL || undefined,
  }),
  observations = [],
  decodes = [];
const roster = true;
const percentile = (xs, p) =>
  [...xs].sort((a, b) => a - b)[
    Math.min(xs.length - 1, Math.floor(xs.length * p))
  ];
try {
  for (const group of (roster ? ["roster"] : ["sprinter", "gargantua", "mixed"]))
    for (let sample = 0; sample < 3; sample++)
      for (const variant of ["before", "after"]) {
        const page = await browser.newPage({
            viewport: { width: 1080, height: 660 },
          }),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(
          `${variant === "before" ? "http://127.0.0.1:4176" : "http://127.0.0.1:4178"}/tests/fixtures/aliens-density.html?group=${group}&variant=after`,
        );
        await page.waitForFunction(() => window.densityMetrics?.ready);
        await page.waitForTimeout(12000);
        const m = await page.evaluate(() => window.densityMetrics);
        observations.push({
          group,
          variant,
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
          rawFrames: m.frames,
          rawCpu: m.cpu,
          errors,
        });
        if ((group === "mixed" || group === "roster") && sample === 2 && variant === "after")
          await page.screenshot({
            path: fileURLToPath(new URL(roster ? "../visual/dense-50-roster.png" : "../visual/dense-50-mixed.png", out)),
          });
        await page.close();
      }
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4175/");
  for (const variant of ["before", "after"]) {
  await page.goto(variant === "before" ? "http://127.0.0.1:4174/" : "http://127.0.0.1:4175/");
  for (let sample = 0; sample < 6; sample++)
    for (const name of [
      "ranger.webp",
      "sprinter-animation.webp",
      "money-tree.webp",
      "gargantua-animation.webp",
      ...(roster ? ["scout-animation.webp", "grunt-animation.webp", "manhunter-animation.webp", "tank-animation.webp"] : []),
    ]) {
      const result = await page.evaluate(async ({name,base}) => {
        const blob = await (await fetch(base + "/art/expedition/" + name)).blob(),
          url = URL.createObjectURL(blob),
          image = new Image(),
          start = performance.now();
        image.src = url;
        await image.decode();
        const result = {
          decodeMs: performance.now() - start,
          width: image.naturalWidth,
          height: image.naturalHeight,
          bytes: blob.size,
        };
        URL.revokeObjectURL(url);
        return result;
      }, {name,base:variant === "before" ? "http://127.0.0.1:4174" : "http://127.0.0.1:4175"});
      decodes.push({ variant, sample, name, ...result });
    }
  }
  const hashes = {};
  for (const file of [
    "tests/fixtures/aliens-density.html",
    "src/game/alien-animation.ts",
    "src/battlefield.ts",
    "public/art/expedition/sprinter-animation.webp",
    "public/art/expedition/gargantua-animation.webp",
    ...(roster ? ["public/art/expedition/scout-animation.webp", "public/art/expedition/grunt-animation.webp", "public/art/expedition/manhunter-animation.webp", "public/art/expedition/tank-animation.webp"] : []),
  ])
    hashes[file] = createHash("sha256")
      .update(await readFile(new URL("../../" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL(roster ? "roster-animation.json" : "animation.json", out),
    JSON.stringify(
      {
        browser: browser.version(),
        method:
          "Production-bundled fixture, serial alternating frozen b0ece92 1.0 / current1.1. Both explicitly choose the six-atlas presentation (variant=after); do not use the fixture historical0.9/static path. All6 atlases and pose selector are byte-identical. 50 world-size aliens in the indicated group. No combat, collision, health bars or device claim. Raw Scene update intervals include scheduling; CPU timing has ~0.1ms resolution. Decode excludes fetch, includes blob initialization. Texture parse is synchronous hook, excludes deferred GPU work.",
        comparisonScope: roster ? "Six-kind50-sprite roster fixture in both production builds; no simulation or combat. Separate actual combat recording/regression evidence remains distinct." : "Two-pilot fixture",
        sourceSha256: hashes,
        observations,
        decodes,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify(observations.map(({ rawFrames, rawCpu, ...rest }) => rest)),
  );
} finally {
  await browser.close();
}
