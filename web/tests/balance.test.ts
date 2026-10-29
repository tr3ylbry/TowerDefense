import { describe, expect, it } from "vitest";
import { COLS, ROWS, TOWERS, isBlocked } from "../src/game/content";
import type { MapKind, TowerKind } from "../src/game/content";
import { Simulation } from "../src/game/simulation";

/** A repeatable balance guard, not a substitute for human playtesting. */
function playFormation(
  map: MapKind,
  seed: number,
  formation: TowerKind[],
  replace = true,
  early = false,
) {
  const game = new Simulation(seed, map);
  const deployed = new Set<string>();
  const columns = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => col).filter(
      (col) => !isBlocked(map, row, col),
    ),
  );
  game.start();
  for (let tick = 0; tick < 8000; tick++) {
    const state = game.snapshot();
    if (state.phase !== "playing") return state;
    let bank = state.credits;
    const occupied = new Set(
      state.towers.map((tower) => `${tower.row}:${tower.col}`),
    );
    for (let rank = 0; rank < formation.length; rank++)
      for (let row = 0; row < ROWS; row++) {
        const col = columns[row][rank];
        const cell = `${row}:${col}`;
        const kind = formation[rank];
        if (
          occupied.has(cell) ||
          (!replace && deployed.has(cell)) ||
          bank < TOWERS[kind].cost
        )
          continue;
        if (game.place(kind, row, col).ok) {
          bank -= TOWERS[kind].cost;
          deployed.add(cell);
        }
      }
    if (early && state.enemies.length === 0 && state.nextWave?.canLaunch)
      game.launchNextWave();
    game.advance(0.05);
    game.drainEvents();
  }
  return game.snapshot();
}

describe("Canyon tactical balance", () => {
  it("requires more than the old twelve-Astro deployment with no further intervention", () => {
    for (let seed = 3352019; seed < 3352031; seed++) {
      expect(
        playFormation("canyon", seed, ["astro", "astro"], false).phase,
      ).toBe("lost");
    }
  });

  it.each(["canyon", "bridge", "nest"] as MapKind[])(
    "supports piercing, plasma, and income strategies on %s across twelve seeds",
    (map) => {
      for (const formation of [
        ["astro", "tars"],
        ["astro", "zeus"],
        ["bush", "astro", "tars"],
      ] as TowerKind[][])
        for (let seed = 3352019; seed < 3352031; seed++) {
          const state = playFormation(map, seed, formation);
          expect(
            state.phase,
            `${map}: ${formation.join("/")} seed ${seed}`,
          ).toBe("won");
          expect(state.integrity).toBeGreaterThan(0);
          expect(state.pendingSpawns).toBe(0);
        }
    },
  );
});

describe("optional clear-field wave calls", () => {
  it.each(["canyon", "bridge", "nest"] as MapKind[])(
    "keeps %s viable across twelve seeds while shortening specialist missions",
    (map) => {
      for (let seed = 3352019; seed < 3352031; seed++) {
        const ordinary = playFormation(map, seed, ["astro", "tars"]);
        const called = playFormation(map, seed, ["astro", "tars"], true, true);
        expect(called.phase, `${map} seed ${seed}`).toBe("won");
        expect(called.integrity).toBeGreaterThan(0);
        expect(called.earlyLaunches).toBeGreaterThan(0);
        expect(called.elapsed).toBeLessThan(ordinary.elapsed);
        expect(called.pendingSpawns).toBe(0);
      }
    },
  );
});
