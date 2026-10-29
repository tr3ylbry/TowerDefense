import { describe, expect, it } from "vitest";
import { makeSpawns, MAPS, STEP } from "../src/game/content";
import type { MapKind, Spawn } from "../src/game/content";
import { Simulation } from "../src/game/simulation";
import { earlyWaveReward, spawnWarnings } from "../src/game/waves";

function afterFirstEntries(map: MapKind = "canyon") {
  const game = new Simulation(3352019, map);
  game.start();
  game.advance(
    makeSpawns(3352019, map)
      .filter((spawn) => spawn.wave === 1)
      .at(-1)!.at,
  );
  game.drainEvents();
  return game;
}

describe("early-wave command", () => {
  it.each([
    [-1, 0],
    [0, 0],
    [0.95, 0],
    [1, 2],
    [4.99, 8],
    [20, 40],
    [1000, 40],
    [NaN, 0],
    [Infinity, 0],
  ])("rewards %s seconds saved with %s credits", (seconds, reward) => {
    expect(earlyWaveReward(seconds)).toBe(reward);
  });

  it("keeps opening preparation and current spawn entries protected", () => {
    const game = new Simulation();
    const ready = game.snapshot();
    expect(game.launchNextWave().ok).toBe(false);
    expect(game.snapshot()).toEqual(ready);
    game.start();
    expect(game.launchNextWave().ok).toBe(false);
    game.advance(7);
    expect(game.snapshot().wave).toBe(1);
    expect(game.snapshot().nextWave?.canLaunch).toBe(false);
    const entering = game.snapshot();
    expect(game.launchNextWave().ok).toBe(false);
    expect(game.snapshot()).toEqual(entering);
  });

  it.each(["canyon", "bridge", "nest"] as MapKind[])(
    "moves %s's next wave to a three-second lead and awards only once",
    (map) => {
      const game = afterFirstEntries(map);
      const before = game.snapshot();
      expect(before.nextWave?.canLaunch).toBe(true);
      const saved = before.nextWave!.startAt - before.elapsed - 3;
      expect(game.launchNextWave().ok).toBe(true);
      const called = game.snapshot();
      expect(called.credits).toBe(before.credits + earlyWaveReward(saved));
      expect(called.nextWave?.startAt).toBeCloseTo(before.elapsed + 3);
      expect(called.nextWave?.reward).toBe(0);
      expect(called.earlyLaunches).toBe(1);
      expect(called.pendingSpawns).toBe(before.pendingSpawns);
      expect(called.wave).toBe(1);
      expect(game.launchNextWave().ok).toBe(false);
      expect(game.snapshot()).toEqual(called);
      expect(
        game.drainEvents().filter((event) => event.type === "wave-called"),
      ).toHaveLength(1);
    },
  );

  it("preserves lane order, spawn spacing, and later wave spacing", () => {
    const game = afterFirstEntries();
    const old = makeSpawns(3352019);
    const before = game.snapshot();
    const shift = before.nextWave!.secondsSaved;
    game.launchNextWave();
    game.advance(3 - STEP);
    expect(game.snapshot().wave).toBe(1);
    game.advance(STEP);
    expect(game.snapshot().wave).toBe(2);
    const originalFirst = old.find((spawn) => spawn.wave === 2)!;
    expect(game.snapshot().enemies.at(-1)).toMatchObject({
      row: originalFirst.row,
      kind: originalFirst.kind,
    });
    expect(game.snapshot().nextWave?.startAt).toBeCloseTo(
      MAPS.canyon.waves[2].start - shift,
    );
    game.advance(1.8 - STEP);
    expect(game.snapshot().pendingSpawns).toBe(before.pendingSpawns - 1);
    game.advance(STEP);
    expect(game.snapshot().pendingSpawns).toBe(before.pendingSpawns - 2);
    const second = old.filter((spawn) => spawn.wave === 2)[1];
    expect(game.snapshot().enemies.at(-1)).toMatchObject({
      row: second.row,
      kind: second.kind,
    });
  });

  it("rejects a nearly due wave without collecting a fractional bonus", () => {
    const game = afterFirstEntries();
    game.advance(9.1);
    expect(game.snapshot().nextWave?.secondsSaved).toBeCloseTo(0.9);
    const before = game.snapshot();
    expect(before.nextWave?.canLaunch).toBe(false);
    expect(game.launchNextWave().ok).toBe(false);
    expect(game.snapshot()).toEqual(before);
  });

  it("freezes a called schedule and rejects rewards while paused", () => {
    const game = afterFirstEntries();
    game.launchNextWave();
    game.advance(1);
    game.pause();
    const paused = game.snapshot();
    game.advance(100);
    expect(game.launchNextWave().ok).toBe(false);
    expect(game.snapshot()).toEqual(paused);
    game.resume();
    game.advance(2);
    expect(game.snapshot().wave).toBe(2);
  });

  it("matches across frame sizes and 1×/2× clocks after the same command", () => {
    const normal = afterFirstEntries();
    const fast = afterFirstEntries();
    normal.launchNextWave();
    fast.launchNextWave();
    fast.setSpeed(2);
    for (let frame = 0; frame < 240; frame++) normal.advance(1 / 60);
    fast.advance(2);
    expect(fast.snapshot()).toEqual({ ...normal.snapshot(), speed: 2 });
  });

  it("rebuilds the original schedule, warnings, and eligibility on restart and destination change", () => {
    const game = afterFirstEntries();
    game.launchNextWave();
    game.advance(2);
    game.restart();
    expect(game.snapshot()).toEqual(new Simulation().snapshot());
    expect(game.drainEvents()).toEqual([]);
    game.chooseMap("nest");
    expect(game.snapshot()).toEqual(new Simulation(3352019, "nest").snapshot());
  });

  it("has no bonus after the final wave begins or a mission ends", () => {
    const game = new Simulation();
    game.start();
    for (
      let tick = 0;
      tick < 2400 && game.snapshot().phase === "playing";
      tick++
    ) {
      for (let row = 0; row < 6; row++)
        for (const [col, kind] of [
          [0, "astro"],
          [1, "tars"],
        ] as const)
          if (
            !game
              .snapshot()
              .towers.some((tower) => tower.row === row && tower.col === col)
          )
            game.place(kind, row, col);
      if (game.snapshot().nextWave?.canLaunch) game.launchNextWave();
      game.advance(STEP);
      game.drainEvents();
      if (game.snapshot().wave === 4) {
        const before = game.snapshot();
        expect(before.nextWave).toBeNull();
        expect(game.launchNextWave().ok).toBe(false);
        expect(game.snapshot()).toEqual(before);
      }
    }
    expect(["won", "lost"]).toContain(game.snapshot().phase);
    expect(game.snapshot().earlyLaunches).toBe(3);
    const ended = game.snapshot();
    expect(game.launchNextWave().ok).toBe(false);
    expect(game.snapshot()).toEqual(ended);
  });
});

describe("schedule-driven spawn warnings", () => {
  it("shows the five-second boundary, excludes spawned entries, and summarizes severity per lane", () => {
    const schedule: Spawn[] = [
      { at: 8, row: 0, kind: "scout", wave: 1 },
      { at: 10, row: 0, kind: "tank", wave: 1 },
      { at: 11, row: 1, kind: "grunt", wave: 1 },
      { at: 12, row: 0, kind: "gargantua", wave: 1 },
      { at: 12.05, row: 2, kind: "tank", wave: 1 },
    ];
    expect(spawnWarnings(schedule, 1, 7)).toEqual([
      {
        row: 0,
        in: 3,
        count: 2,
        threat: "heavy",
        kinds: ["tank", "gargantua"],
      },
      { row: 1, in: 4, count: 1, threat: "standard", kinds: ["grunt"] },
    ]);
    expect(spawnWarnings(schedule, 2, 5)).toEqual([]);
  });

  it("uses the rescheduled arrivals immediately after a call", () => {
    const game = afterFirstEntries();
    expect(game.snapshot().incoming).toEqual([]);
    game.launchNextWave();
    const warnings = game.snapshot().incoming;
    const expected = makeSpawns(3352019)
      .filter((spawn) => spawn.wave === 2)
      .slice(0, 2);
    expect(warnings.map((warning) => warning.row).sort()).toEqual(
      expected.map((spawn) => spawn.row).sort(),
    );
    expect(Math.min(...warnings.map((warning) => warning.in))).toBe(3);
    warnings[0].kinds.length = 0;
    expect(
      game.snapshot().incoming.every((warning) => warning.kinds.length > 0),
    ).toBe(true);
  });
});
