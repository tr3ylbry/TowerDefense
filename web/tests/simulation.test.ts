import { describe, expect, it } from "vitest";
import { COLS, makeSpawns, ROWS } from "../src/game/content";
import { Simulation } from "../src/game/simulation";

describe("mission lifecycle", () => {
  it("does not advance or accept deployment before start", () => {
    const game = new Simulation();
    game.advance(50);
    expect(game.snapshot().elapsed).toBe(0);
    expect(game.place("astro", 0, 0).ok).toBe(false);
  });

  it("freezes all state while paused and does not deposit income on resume", () => {
    const game = new Simulation();
    game.start();
    game.place("bush", 0, 0);
    game.advance(6);
    game.pause();
    const paused = game.snapshot();
    game.advance(60);
    expect(game.snapshot()).toEqual(paused);
    game.resume();
    expect(game.snapshot().credits).toBe(paused.credits);
    game.advance(0.05);
    expect(game.snapshot().credits).toBe(paused.credits);
  });

  it("preserves partial income timing across pauses", () => {
    const game = new Simulation();
    game.start();
    game.advance(4.9);
    const credits = game.snapshot().credits;
    game.pause();
    game.advance(20);
    game.resume();
    game.advance(0.05);
    expect(game.snapshot().credits).toBe(credits);
    game.advance(0.05);
    expect(game.snapshot().credits).toBe(credits + 30);
  });

  it("stops generating income immediately after salvage", () => {
    const game = new Simulation();
    game.start();
    game.place("bush", 0, 0);
    game.advance(6);
    expect(game.snapshot().credits).toBe(225);
    expect(game.remove(0, 0).ok).toBe(true);
    const bank = game.snapshot().credits;
    game.advance(6);
    expect(game.snapshot().credits).toBe(bank + 30);
  });

  it("validates coordinates and occupancy without charging invalid placements", () => {
    const game = new Simulation();
    game.start();
    const bank = game.snapshot().credits;
    for (const [row, col] of [
      [-1, 0],
      [ROWS, 0],
      [0, COLS],
      [0, -1],
      [0.2, 0],
      [NaN, 0],
    ])
      expect(game.place("astro", row, col).ok).toBe(false);
    expect(game.snapshot().credits).toBe(bank);
    expect(game.place("astro", 0, 0).ok).toBe(true);
    expect(game.place("astro", 0, 0).ok).toBe(false);
    expect(game.snapshot().credits).toBe(bank - 50);
  });

  it("refuses unaffordable units and cannot create negative credits", () => {
    const game = new Simulation();
    game.start();
    game.place("zeus", 0, 0);
    expect(game.place("zeus", 1, 0).ok).toBe(false);
    expect(game.snapshot().credits).toBe(105);
  });

  it("runs at the same simulation speed across frame sizes", () => {
    const small = new Simulation();
    const large = new Simulation();
    small.start();
    large.start();
    for (let i = 0; i < 600; i++) small.advance(1 / 60);
    large.advance(10);
    expect(small.snapshot()).toEqual(large.snapshot());
  });

  it("doubles game time consistently, including scheduled spawning", () => {
    const normal = new Simulation();
    const fast = new Simulation();
    normal.start();
    fast.start();
    normal.advance(14);
    fast.setSpeed(2);
    fast.advance(7);
    expect(fast.snapshot()).toEqual({ ...normal.snapshot(), speed: 2 });
  });

  it("loses when undefended aliens breach all shields and stays finished", () => {
    const game = new Simulation();
    game.start();
    game.advance(180);
    expect(game.snapshot().phase).toBe("lost");
    expect(game.snapshot().integrity).toBe(0);
    const finished = game.snapshot();
    game.advance(40);
    game.resume();
    game.start();
    expect(game.snapshot()).toEqual(finished);
  });

  it("restarts with no leftover entities, currency, time, or pending events", () => {
    const game = new Simulation();
    game.start();
    game.place("astro", 0, 0);
    game.advance(20);
    game.restart();
    expect(game.snapshot()).toEqual(new Simulation().snapshot());
    expect(game.drainEvents()).toEqual([]);
  });

  it("returns snapshots that cannot mutate internal game state", () => {
    const game = new Simulation();
    game.start();
    game.place("astro", 0, 0);
    game.snapshot().towers[0].health = 0;
    expect(game.snapshot().towers[0].health).toBe(260);
  });

  it("can complete all four waves with a viable defense and only wins after every spawn", () => {
    const game = new Simulation();
    game.start();
    let earliestWin = Infinity;
    for (let i = 0; i < 4400; i++) {
      const state = game.snapshot();
      // A deliberately simple strategy: one shooter per lane, then another, then heavy support.
      for (const col of [1, 2, 3, 4])
        for (let row = 0; row < ROWS; row++) {
          const current = game.snapshot();
          if (
            !current.towers.some(
              (tower) => tower.row === row && tower.col === col,
            )
          )
            game.place(col >= 3 ? "zeus" : "astro", row, col);
        }
      game.advance(0.05);
      game.drainEvents();
      if (state.phase === "won") {
        earliestWin = state.elapsed;
        break;
      }
      if (state.phase === "lost") break;
    }
    expect(game.snapshot().phase).toBe("won");
    expect(game.snapshot().wave).toBe(4);
    expect(game.snapshot().pendingSpawns).toBe(0);
    expect(earliestWin).toBeGreaterThan(117);
  });

  it("creates reproducible but distinct seeded lanes", () => {
    expect(makeSpawns(335)).toEqual(makeSpawns(335));
    expect(makeSpawns(335)).not.toEqual(makeSpawns(336));
    expect(makeSpawns(335).filter((spawn) => spawn.wave === 4)).toHaveLength(
      10,
    );
  });
});
