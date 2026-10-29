import { it, expect } from "vitest";
import { Simulation } from "../src/game/simulation";
import { STEP, TOWERS } from "../src/game/content";
import { coverage, crewDetails } from "../src/guidance";
it("accounts for supply, growth, purchases and exact salvage without changing currency rules", () => {
  const game = new Simulation();
  game.start();
  game.place("bush", 0, 0);
  game.advance(6);
  game.remove(0, 0);
  expect(game.snapshot().economy).toMatchObject({
    supply: 30,
    growth: 25,
    spent: 60,
    purchases: 1,
    salvage: 24,
    losses: 0,
  });
  const state = game.snapshot(),
    e = state.economy;
  expect(state.credits).toBe(
    230 + e.supply + e.growth + e.bounties + e.calls + e.salvage - e.spent,
  );
  game.pause();
  const paused = game.snapshot();
  game.advance(100);
  expect(game.snapshot()).toEqual(paused);
  game.restart();
  expect(game.snapshot().economy).toEqual(new Simulation().snapshot().economy);
});
it("conserves all sources through early calls, combat, casualties and completion", () => {
  const game = new Simulation();
  game.start();
  for (
    let tick = 0;
    tick < 6000 && game.snapshot().phase === "playing";
    tick++
  ) {
    const state = game.snapshot();
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 2; col++)
        if (!state.towers.some((x) => x.row === row && x.col === col))
          game.place("astro", row, col);
    if (state.nextWave?.canLaunch) game.launchNextWave();
    game.advance(STEP);
    game.drainEvents();
    const now = game.snapshot(),
      e = now.economy;
    expect(now.credits).toBe(
      230 + e.supply + e.growth + e.bounties + e.calls + e.salvage - e.spent,
    );
  }
  const e = game.snapshot().economy;
  expect(e.calls).toBeGreaterThan(0);
  expect(e.bounties).toBeGreaterThan(0);
  expect(e.losses).toBeGreaterThan(0);
  e.spent = 999999;
  expect(game.snapshot().economy.spent).not.toBe(999999);
  game.restart();
  game.chooseMap("nest");
  expect(game.snapshot().economy).toEqual(
    new Simulation(3352019, "nest").snapshot().economy,
  );
});
it("counts only firing defenders as coverage and previews actual refunds and payback", () => {
  const game = new Simulation();
  game.start();
  game.place("bush", 0, 0);
  game.place("wall", 1, 0);
  expect(coverage(game.snapshot())).toContain("0/6 lanes firing");
  game.place("astro", 2, 0);
  expect(coverage(game.snapshot())).toContain("1/6");
  expect(
    crewDetails("salvage", game.snapshot(), { row: 1, col: 0 })[2],
  ).toContain("Refund 14 credits");
  expect(crewDetails("tree", game.snapshot(), null)[2]).toContain(
    "Gross payback 24s",
  );
  expect(crewDetails("tars", game.snapshot(), null)[2]).toContain(
    "100% plating bypass",
  );
  expect(crewDetails("falcon", game.snapshot(), null)[2]).toContain(
    `Need ${TOWERS.falcon.cost - game.snapshot().credits} more`,
  );
  game.advance(2);
  expect(crewDetails("bush", game.snapshot(), { row: 0, col: 0 })[2]).toContain(
    "Next +25 in 4s",
  );
});
