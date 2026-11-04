import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import manifest from "../public/art/manifest.json";
import provenance from "../art-source/release-clearance/projectiles.json";
import legacy from "../reports/expedition-1.1/assessment/publication-assets.json";
import { assetsFor } from "../src/assets";
import { EXPEDITION_PROJECTILES } from "../src/game/projectile-art";
import { releaseFiles, releaseManifest } from "../scripts/release/assets";

describe("Expedition-only distribution boundary", () => {
  it("excludes every retained school raster and all 38 unused historical output rasters", () => {
    const included = new Set(releaseFiles());
    for (const row of legacy.assets.filter(row => row.status === "unresolved" || row.unnecessaryToCurrentPlayerBuild))
      expect(included.has(row.file.replace(/^public\//, "")), row.file).toBe(false);
    expect(included.size).toBe(releaseFiles().length);
    expect(releaseManifest.backgrounds).toEqual([]);
    expect(releaseManifest.sprites).toEqual([]);
    expect(releaseManifest.images).toEqual(Object.values(EXPEDITION_PROJECTILES));
  });
  it.each(["canyon", "bridge", "nest"] as const)("includes every required %s Expedition asset without legacy fallback", map => {
    const plan = assetsFor(releaseManifest, map, "expedition");
    for (const asset of [...plan.images, ...plan.sprites]) {
      expect(releaseFiles()).toContain(`art/${asset.file}`);
      expect(readFileSync(new URL(`../public/art/${asset.file}`, import.meta.url)).length).toBeGreaterThan(0);
    }
    expect(plan.sprites).toHaveLength(6);
    expect(plan.sprites.reduce((n, x) => n + x.frames, 0)).toBe(248);
    expect(() => assetsFor(releaseManifest, map, "original")).toThrow("Missing environment");
    expect(assetsFor(manifest, map, "original").sprites.length).toBeGreaterThan(20);
  });
  it("registers five small source-authored transparent SVGs without remote/active content", () => {
    for (const asset of provenance.assets) {
      const bytes = readFileSync(new URL(`../${asset.file}`, import.meta.url));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
      expect(bytes.length).toBe(asset.bytes);
      const svg = bytes.toString();
      expect(svg).toContain('viewBox="0 0 54 54"');
      expect(svg).not.toMatch(/<script|<image|<foreignObject|href=|url\(|onload=|<filter/i);
      expect(manifest.images).toContainEqual(EXPEDITION_PROJECTILES[asset.kind as keyof typeof EXPEDITION_PROJECTILES]);
    }
    expect(provenance.assets).toHaveLength(5);
  });
});
