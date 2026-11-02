// Production-bundled render fixture. Serial, 2s warm-up +10s sample, 50 units.
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const out = new URL(
  "../../reports/expedition-1.0/performance/",
  import.meta.url,
);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
    channel: process.env.AVA_PROFILE_CHANNEL || undefined,
  }),
  observations = [],
  decodes = [];
const percentile = (xs, p) =>
  [...xs].sort((a, b) => a - b)[
    Math.min(xs.length - 1, Math.floor(xs.length * p))
  ];
try {
  for (const group of ["sprinter", "gargantua", "mixed"])
    for (let sample = 0; sample < 3; sample++)
      for (const variant of ["before", "after"]) {
        const page = await browser.newPage({
            viewport: { width: 1080, height: 660 },
          }),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(
          `http://127.0.0.1:4176/tests/fixtures/aliens-density.html?group=${group}&variant=${variant}`,
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
        if (group === "mixed" && sample === 2 && variant === "after")
          await page.screenshot({
            path: fileURLToPath(new URL("../visual/dense-50-mixed.png", out)),
          });
        await page.close();
      }
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4175/");
  for (let sample = 0; sample < 6; sample++)
    for (const name of [
      "sprinter.webp",
      "sprinter-animation.webp",
      "gargantua.webp",
      "gargantua-animation.webp",
    ]) {
      const result = await page.evaluate(async (name) => {
        const blob = await (await fetch("/art/expedition/" + name)).blob(),
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
      }, name);
      decodes.push({ sample, name, ...result });
    }
  const hashes = {};
  for (const file of [
    "tests/fixtures/aliens-density.html",
    "src/game/alien-animation.ts",
    "src/battlefield.ts",
    "public/art/expedition/sprinter-animation.webp",
    "public/art/expedition/gargantua-animation.webp",
  ])
    hashes[file] = createHash("sha256")
      .update(await readFile(new URL("../../" + file, import.meta.url)))
      .digest("hex");
  await writeFile(
    new URL("animation.json", out),
    JSON.stringify(
      {
        browser: browser.version(),
        method:
          "Production-bundled fixture, serial alternating 0.9/1.0 presentation; same current pure pose selector (Sprinter selection unchanged), retained 0.9 atlas/procedural Gargantua vs new atlases. 50 world-size Sprinters, Gargantuas and mixed groups. No combat, collision, health bars or device claim. Raw Scene update intervals include scheduling; CPU timing has ~0.1ms resolution. Decode excludes fetch, includes blob initialization. Texture parse is synchronous hook, excludes deferred GPU work.",
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
