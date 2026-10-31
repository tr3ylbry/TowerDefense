import { describe, it, expect } from "vitest";
import { Simulation } from "../src/game/simulation";
import type { Enemy, Snapshot, Tower } from "../src/game/simulation";
import {
  canAimForward,
  canReachForward,
  MUZZLE_OFFSET,
  HIT_RADIUS,
} from "../src/game/combat";
import {
  laneThreats,
  placementWarning,
  threatAdvice,
} from "../src/game/threats";
import { coverage } from "../src/guidance";
import { makeSpawns, MAPS } from "../src/game/content";
const gun = (col: number, kind: Tower["kind"] = "astro", row = 0): Tower => ({
  id: col + row * 9,
  kind,
  row,
  col,
  health: 260,
  cooldown: 0,
  incomeClock: 0,
  windup: 0,
  lastHitAt: -1000,
});
const alien = (x: number, row = 0, id = 100): Enemy => ({
  id,
  kind: "scout",
  row,
  x,
  previousX: x,
  health: 100,
  cooldown: 0,
  attacking: false,
});
function state(towers: Tower[], enemies: Enemy[]): Snapshot {
  return { ...new Simulation().snapshot(), phase: "playing", towers, enemies };
}
describe("directional threat feedback", () => {
  it("distinguishes aim from fresh-projectile reach at the exact gates", () => {
    expect(canAimForward(0, 0.2)).toBe(false);
    expect(canAimForward(0, 0.21)).toBe(true);
    expect(canReachForward(0, 0.21)).toBe(false);
    expect(canReachForward(0, 0.49)).toBe(false);
    expect(canReachForward(0, MUZZLE_OFFSET - HIT_RADIUS)).toBe(true);
  });
  it("classifies the nearest live threat even when a farther target can be shot", () => {
    const s = state([gun(4)], [alien(8), alien(2, 0, 101)]);
    expect(laneThreats(s)[0]).toMatchObject({
      passed: true,
      engaged: false,
      rescueCol: 0,
      enemy: { id: 101 },
    });
    expect(coverage(s)).toContain("Past guns: L1");
    expect(threatAdvice(laneThreats(s)[0])).toContain("tile 1 can engage");
  });
  it("clears passed coverage when a healthy gun to the left can engage", () => {
    const s = state([gun(4), gun(0)], [alien(2)]);
    expect(laneThreats(s)[0].passed).toBe(false);
    expect(coverage(s)).not.toContain("Past guns");
  });
  it("excludes dead units, income and barriers and respects occupied rescue cells", () => {
    const s = state(
      [gun(0, "wall"), { ...gun(0), health: 0 }, gun(5)],
      [alien(2), { ...alien(1, 0, 101), health: 0 }],
    );
    expect(laneThreats(s)[0]).toMatchObject({
      passed: true,
      rescueCol: 1,
      enemy: { id: 100 },
    });
    expect(laneThreats(state([gun(0, "bush")], [alien(2)]))[0]).toMatchObject({
      armed: false,
      passed: false,
      engaged: false,
    });
  });
  it("respects acid and explains when no empty forward-fire tile remains", () => {
    const s = {
      ...state([gun(4), gun(0, "bush")], [alien(2.4)]),
      map: "nest" as const,
    };
    expect(laneThreats(s)[0].rescueCol).toBeNull();
    expect(threatAdvice(laneThreats(s)[0])).toContain("no empty firing tile");
    expect(laneThreats(state([gun(0)], [alien(0.13)]))[0].rescueCol).toBeNull();
  });
  it("warns about a legal future-use placement without warning for walls or other lanes", () => {
    const s = state([], [alien(3)]);
    expect(placementWarning("tars", s, 0, 4)).toContain(
      "Deployment is still allowed",
    );
    for (const kind of ["wall", "bush"] as const)
      expect(placementWarning(kind, s, 0, 4)).toBeNull();
    expect(placementWarning("astro", s, 0, 0)).toBeNull();
    expect(placementWarning("astro", s, 1, 4)).toBeNull();
  });
  it("freezes warning state during pause and clears it for reset/outcomes", () => {
    const s = state([gun(4)], [alien(2)]);
    expect(laneThreats({ ...s, phase: "paused" })).toEqual(laneThreats(s));
    for (const phase of ["ready", "won", "lost"] as const)
      expect(laneThreats({ ...s, phase })).toEqual([]);
  });
  it("reproduces late placement with public actions, preserves direction, and permits rescue", () => {
    const game = new Simulation();
    game.start();
    game.advance(22);
    const row = game.snapshot().enemies[0].row;
    for (let r = 0; r < 6; r++) expect(game.place("astro", r, 8).ok).toBe(true);
    game.drainEvents();
    game.advance(0.5);
    expect(game.drainEvents().filter((e) => e.type === "shot")).toHaveLength(0);
    expect(laneThreats(game.snapshot()).filter((t) => t.passed)).toHaveLength(
      6,
    );
    expect(game.place("astro", row, 0).ok).toBe(true);
    game.advance(2);
    expect(
      game.drainEvents().some((e) => e.type === "hit" && e.row === row),
    ).toBe(true);
    expect(
      laneThreats(game.snapshot()).find((t) => t.row === row)?.passed,
    ).not.toBe(true);
  });
});
describe("Nest paired relays", () => {
  it("preserves original acid coordinates, final enemy multiset and total count", () => {
    expect(MAPS.nest.blocked).toEqual([
      [1, 3, 6],
      [1, 4, 7],
      [1, 2, 5],
      [1, 4],
      [1, 3, 6],
      [1, 4],
    ]);
    expect(makeSpawns(3352019, "nest")).toHaveLength(38);
    const old = [
      "gargantua",
      "tank",
      "sprinter",
      "manhunter",
      "grunt",
      "gargantua",
      "sprinter",
      "tank",
      "manhunter",
      "grunt",
      "sprinter",
      "manhunter",
    ].sort();
    expect([...MAPS.nest.waves[3].enemies].sort()).toEqual(old);
  });
  it("changes only late Nest spacing into reproducible paired three-lane groups", () => {
    for (const map of ["canyon", "bridge", "nest"] as const)
      for (let w = 1; w <= 4; w++) {
        const entries = makeSpawns(3352019, map).filter((s) => s.wave === w);
        if (map === "nest" && w >= 3) {
          expect(entries[0].row).toBe(entries[1].row);
          expect(entries[1].at - entries[0].at).toBeCloseTo(0.6);
          expect(entries[6].at - entries[5].at).toBeCloseTo(6.6);
          expect(new Set(entries.slice(0, 6).map((s) => s.row)).size).toBe(3);
          expect(
            entries
              .slice(6)
              .every((s) => !entries.slice(0, 6).some((a) => a.row === s.row)),
          ).toBe(true);
        } else
          for (let i = 1; i < entries.length; i++)
            expect(entries[i].at - entries[i - 1].at).toBeCloseTo(1.8);
      }
    expect(makeSpawns(9, "nest")).toEqual(makeSpawns(9, "nest"));
    expect(makeSpawns(10, "nest")).not.toEqual(makeSpawns(9, "nest"));
  });
});
