import { describe, it, expect } from "vitest";
import manifest from "../public/art/manifest.json";
import { assetsFor } from "../src/assets";
import { ENEMIES, TOWERS } from "../src/game/content";
import { EXPEDITION_ENEMIES, EXPEDITION_TOWERS } from "../src/game/art";
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
    for (const kind of ["astro", "tars"] as const) {
      expect(keys).toContain(EXPEDITION_TOWERS[kind]!.key);
      expect(keys).not.toContain(`${TOWERS[kind].sprite}-idle`);
    }
    expect(new Set(keys).size).toBe(keys.length);
  });
  it.each(["bridge", "nest"] as const)(
    "loads only the %s environment plus its acid texture",
    (map) => {
      const plan = assetsFor(manifest, map, "expedition");
      expect(plan.images.map((x) => x.key)).toContain(
        map === "bridge" ? "stage-two" : "stage-three",
      );
      expect(plan.images.map((x) => x.key)).toContain("acid-pool");
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
      assetsFor({ ...manifest, backgrounds: [] }, "bridge", "expedition"),
    ).toThrow("Missing environment");
    expect(() =>
      assetsFor({ ...manifest, sprites: [] }, "canyon", "original"),
    ).toThrow("Missing animation");
  });
});
