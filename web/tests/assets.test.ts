import { describe, it, expect } from "vitest";
import manifest from "../public/art/manifest.json";
import { assetsFor } from "../src/assets";
import { ENEMIES, TOWERS } from "../src/game/content";
import {
  EXPEDITION_ENEMIES,
  EXPEDITION_TOWERS,
  EXPEDITION_ENVIRONMENTS,
} from "../src/game/art";
import { readFileSync } from "node:fs";
import derivatives from "../art-source/expedition-0.5/derivatives.json";
describe("mission asset plans", () => {
  it("starts with one environment and the full illustrated alien roster, without comparison sheets", () => {
    const plan = assetsFor(manifest, "canyon", "expedition");
    const keys = [...plan.images, ...plan.sprites].map((x) => x.key);
    expect(keys).toContain("expedition-canyon");
    expect(keys).not.toContain("stage-one");
    expect(keys).not.toContain("stage-two");
    expect(keys).not.toContain("stage-three");
    expect(keys).not.toContain("acid-pool");
    for (const kind of Object.keys(ENEMIES) as (keyof typeof ENEMIES)[]) {
      expect(keys).toContain(EXPEDITION_ENEMIES[kind]!.key);
      expect(keys).not.toContain(`${ENEMIES[kind].sprite}-walk`);
    }
    for (const kind of Object.keys(TOWERS) as (keyof typeof TOWERS)[]) {
      expect(keys).toContain(EXPEDITION_TOWERS[kind]!.key);
      expect(keys).not.toContain(`${TOWERS[kind].sprite}-idle`);
    }
    expect(plan.sprites.map((x) => x.key)).toEqual([
      "expedition-sprinter-animation",
      "expedition-gargantua-animation",
    ]);
    expect(plan.sprites[0]).toMatchObject({
      frameWidth: 160,
      frameHeight: 120,
      frames: 48,
      fps: 0,
    });
    expect(new Set(keys).size).toBe(keys.length);
  });
  it.each(["bridge", "nest"] as const)(
    "loads only the %s environment plus its acid texture",
    (map) => {
      const plan = assetsFor(manifest, map, "expedition");
      expect(plan.images.map((x) => x.key)).toContain(
        EXPEDITION_ENVIRONMENTS[map].key,
      );
      expect(plan.images.map((x) => x.key)).toContain("expedition-acid-pool");
      expect(plan.images.map((x) => x.key)).not.toContain("expedition-canyon");
    },
  );
  it("restores original animations for every character when comparison is requested", () => {
    const plan = assetsFor(manifest, "canyon", "original");
    expect(plan.images.map((x) => x.key)).toContain("stage-one");
    expect(plan.images.some((x) => x.key.startsWith("expedition-"))).toBe(
      false,
    );
    for (const unit of Object.values(TOWERS))
      expect(plan.sprites.map((x) => x.key)).toContain(`${unit.sprite}-idle`);
    for (const unit of Object.values(ENEMIES))
      for (const action of ["walk", "attack", "die"])
        expect(plan.sprites.map((x) => x.key)).toContain(
          `${unit.sprite}-${action}`,
        );
  });
  it("rejects missing required files before switching a mission", () => {
    expect(() =>
      assetsFor({ ...manifest, images: [] }, "canyon", "expedition"),
    ).toThrow("Missing image");
    expect(() =>
      assetsFor({ ...manifest, backgrounds: [] }, "bridge", "original"),
    ).toThrow("Missing environment");
    expect(() =>
      assetsFor({ ...manifest, sprites: [] }, "canyon", "original"),
    ).toThrow("Missing animation");
  });
  it("registers the full illustrated roster with proportionate bounds and alpha-derived feet", () => {
    expect(Object.keys(EXPEDITION_TOWERS).sort()).toEqual(
      Object.keys(TOWERS).sort(),
    );
    expect(Object.keys(EXPEDITION_ENEMIES).sort()).toEqual(
      Object.keys(ENEMIES).sort(),
    );
    for (const art of [
      ...Object.values(EXPEDITION_TOWERS),
      ...Object.values(EXPEDITION_ENEMIES),
    ]) {
      const record = derivatives.assets.find(
        (x) => x.file === `public/art/${art.file}`,
      )!;
      expect(record).toBeDefined();
      expect(record.alphaExactAfterResampling).toBe(true);
      expect(art.width / art.height).toBeCloseTo(
        record.size[0] / record.size[1],
        8,
      );
      expect(art.foot).toBeCloseTo(record.foot!, 8);
      const bytes = readFileSync(
        new URL(`../public/art/${art.file}`, import.meta.url),
      );
      expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
    }
  });
  it.each(["canyon", "bridge", "nest"] as const)(
    "keeps %s comparison scenery separate from the Expedition map",
    (map) => {
      const plan = assetsFor(manifest, map, "expedition");
      const keys = plan.images.map((x) => x.key);
      for (const other of Object.keys(
        EXPEDITION_ENVIRONMENTS,
      ) as (keyof typeof EXPEDITION_ENVIRONMENTS)[])
        expect(keys.includes(EXPEDITION_ENVIRONMENTS[other].key)).toBe(
          other === map,
        );
      const original = assetsFor(manifest, map, "original");
      expect(original.images.map((x) => x.key)).toContain(
        map === "canyon"
          ? "stage-one"
          : map === "bridge"
            ? "stage-two"
            : "stage-three",
      );
    },
  );
});
