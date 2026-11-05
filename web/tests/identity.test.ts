import { describe, it, expect } from "vitest";
import { TOWERS, ENEMIES, AMMO } from "../src/game/content";
import { MISSIONS } from "../src/game/missions";
import { HARD_FIRST_CONTACT } from "../src/game/challenges";

describe("Augie public identity with compatible robot gameplay", () => {
  it("preserves every robot combat value and internal asset identifier", () => {
    expect(TOWERS.tars).toEqual({
      name: "Augie", role: "Armor piercing",
      description: "Precision armor-piercing rounds ignore Tank plating.",
      cost: 100, health: 450, damage: 48, cooldown: 0.95, windup: 0.15,
      armorPierce: 1, income: 0, incomeInterval: 6, sprite: "tars", ammo: ["tars"], splashRadius: 0,
    });
    expect(AMMO.tars).toEqual({ sprite: "projectile-tars-ammo", speed: 8, color: 0xbadce8 });
  });
  it("uses Augie in Normal and Hard armor guidance without a historical public identity", () => {
    expect(ENEMIES.tank.description).toContain("Augie ignores it");
    expect(MISSIONS["first-contact"].tactics).toContain("Augie");
    expect(JSON.stringify(MISSIONS)).toContain("Augie ignores Tank plating");
    expect(HARD_FIRST_CONTACT[1].briefing).toContain("Augie ignores plating");
    expect(JSON.stringify({ TOWERS, ENEMIES, MISSIONS, HARD_FIRST_CONTACT })).not.toMatch(/\bTARS\b/);
  });
});
