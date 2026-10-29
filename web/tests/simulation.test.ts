import { describe, expect, it } from "vitest";
import {
  AMMO,
  COLS,
  ENEMIES,
  isBlocked,
  makeSpawns,
  MAPS,
  ROWS,
  TOWERS,
} from "../src/game/content";
import type { MapKind, TowerKind } from "../src/game/content";
import { damageAgainstArmor, Simulation } from "../src/game/simulation";

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
    expect(earliestWin).toBeGreaterThan(makeSpawns(3352019).at(-1)!.at);
  });

  it("creates reproducible but distinct seeded lanes", () => {
    expect(makeSpawns(335)).toEqual(makeSpawns(335));
    expect(makeSpawns(335)).not.toEqual(makeSpawns(336));
    expect(makeSpawns(335).filter((spawn) => spawn.wave === 4)).toHaveLength(
      10,
    );
  });
});

describe("complete original roster", () => {
  it("contains all nine defenders and all six aliens in every mission", () => {
    expect(Object.keys(TOWERS)).toHaveLength(9);
    expect(Object.keys(ENEMIES)).toHaveLength(6);
    for (const map of Object.keys(MAPS) as MapKind[]) {
      const spawns = makeSpawns(3352019, map);
      expect(new Set(spawns.map((spawn) => spawn.kind))).toEqual(
        new Set(Object.keys(ENEMIES)),
      );
      expect(spawns.every((spawn) => spawn.row >= 0 && spawn.row < ROWS)).toBe(
        true,
      );
    }
  });

  it.each(Object.keys(TOWERS) as TowerKind[])(
    "deploys %s at its own cost and health",
    (kind) => {
      const game = new Simulation();
      game.start();
      if (TOWERS[kind].cost > 230) game.advance(5);
      const before = game.snapshot().credits;
      expect(game.place(kind, 0, 0).ok).toBe(true);
      expect(game.snapshot().credits).toBe(before - TOWERS[kind].cost);
      expect(game.snapshot().towers[0]).toMatchObject({
        kind,
        health: TOWERS[kind].health,
      });
      expect(game.remove(0, 0).ok).toBe(true);
      expect(game.snapshot().credits).toBe(
        before - TOWERS[kind].cost + Math.floor(TOWERS[kind].cost * 0.4),
      );
    },
  );

  it.each([
    "astro",
    "zeus",
    "explosive",
    "startrell",
    "tars",
    "falcon",
  ] as TowerKind[])("fires %s's original ammunition and volley", (kind) => {
    const game = new Simulation();
    game.start();
    if (TOWERS[kind].cost > 230) game.advance(5);
    const row = makeSpawns(3352019)[0].row;
    game.place(kind, row, 0);
    game.advance(7 + TOWERS[kind].windup - game.snapshot().elapsed);
    const shots = game.snapshot().projectiles;
    expect(shots.map((shot) => shot.ammo)).toEqual(TOWERS[kind].ammo);
    expect(
      shots.every(
        (shot) => shot.row === row && shot.damage === TOWERS[kind].damage,
      ),
    ).toBe(true);
    expect(new Set(shots.map((shot) => shot.offset)).size).toBe(shots.length);
    const before = shots.map((shot) => shot.x);
    game.advance(0.05);
    game.snapshot().projectiles.forEach((shot, i) => {
      expect(shot.x - before[i]).toBeCloseTo(AMMO[shot.ammo].speed * 0.05);
    });
    game.pause();
    const paused = game.snapshot();
    game.advance(20);
    expect(game.snapshot()).toEqual(paused);
  });

  it("pays Money Trees only on their own clock, and stops after salvage", () => {
    const game = new Simulation();
    game.start();
    game.place("tree", 0, 0);
    game.advance(7.95);
    expect(game.snapshot().credits).toBe(110);
    game.pause();
    game.advance(60);
    game.resume();
    expect(game.snapshot().credits).toBe(110);
    game.advance(0.05);
    expect(game.snapshot().credits).toBe(170);
    game.remove(0, 0);
    game.advance(8);
    expect(game.snapshot().credits).toBe(290); // 60 refund and two outpost payments; no tree payment.
  });
});

describe("three original destinations", () => {
  it.each(["canyon", "bridge", "nest"] as MapKind[])(
    "enforces %s terrain without charging or blocking aliens",
    (map) => {
      const game = new Simulation(3352019, map);
      game.start();
      const bank = game.snapshot().credits;
      let blocked = 0;
      for (let row = 0; row < ROWS; row++)
        for (let col = 0; col < COLS; col++)
          if (isBlocked(map, row, col)) {
            expect(game.place("astro", row, col)).toMatchObject({
              ok: false,
              message: expect.stringContaining("Acid pool"),
            });
            blocked++;
          }
      expect(blocked).toBe(map === "canyon" ? 0 : map === "bridge" ? 12 : 16);
      expect(game.snapshot().credits).toBe(bank);
      game.advance(180);
      expect(game.snapshot().phase).toBe("lost");
    },
  );

  it("changes maps only before a mission and preserves the chosen map on restart", () => {
    const game = new Simulation();
    expect(game.chooseMap("bridge").ok).toBe(true);
    game.start();
    game.place("tree", 0, 0);
    game.advance(20);
    game.pause();
    const before = game.snapshot();
    expect(game.chooseMap("nest").ok).toBe(false);
    expect(game.snapshot()).toEqual(before);
    game.restart();
    expect(game.snapshot()).toEqual(
      new Simulation(3352019, "bridge").snapshot(),
    );
    expect(game.drainEvents()).toEqual([]);
    expect(game.chooseMap("nest").ok).toBe(true);
    expect(game.snapshot().map).toBe("nest");
    expect(game.snapshot().pendingSpawns).toBe(
      makeSpawns(3352019, "nest").length,
    );
    expect(game.chooseMap("invalid" as MapKind).ok).toBe(false);
  });

  it.each(["canyon", "bridge", "nest"] as MapKind[])(
    "can win all waves on %s using only earned credits",
    (map) => {
      const game = new Simulation(3352019, map);
      game.start();
      // Cover every lane, then add rapid fire and heavy support on the next legal cells.
      const formation: TowerKind[] = ["astro", "startrell", "zeus", "falcon"];
      for (let step = 0; step < 7000; step++) {
        for (let rank = 0; rank < formation.length; rank++)
          for (let row = 0; row < ROWS; row++) {
            const cols = Array.from({ length: COLS }, (_, col) => col).filter(
              (col) => !isBlocked(map, row, col),
            );
            const col = cols[rank];
            if (
              !game
                .snapshot()
                .towers.some((tower) => tower.row === row && tower.col === col)
            )
              game.place(formation[rank], row, col);
          }
        game.advance(0.05);
        game.drainEvents();
        if (game.snapshot().phase !== "playing") break;
      }
      expect(game.snapshot().phase).toBe("won");
      expect(game.snapshot().integrity).toBeGreaterThan(0);
      expect(game.snapshot().wave).toBe(MAPS[map].waves.length);
      expect(game.snapshot().pendingSpawns).toBe(0);
      expect(game.snapshot().kills).toBe(makeSpawns(3352019, map).length);
      expect(game.snapshot().elapsed).toBeGreaterThan(
        makeSpawns(3352019, map).at(-1)!.at,
      );
    },
  );
});

describe("cluster damage", () => {
  it.each(["explosive", "zeus", "astro"] as TowerKind[])(
    "resolves %s hits against a real group held by an asteroid",
    (kind) => {
      const game = new Simulation();
      const row = makeSpawns(3352019)[0].row;
      game.start();
      game.place("wall", row, 8);
      for (let tick = 0; tick < 1100; tick++) {
        const wall = game.snapshot().towers.find((tower) => tower.row === row);
        if (wall && wall.health < 200) game.remove(row, 8);
        if (!game.snapshot().towers.some((tower) => tower.row === row))
          game.place("wall", row, 8);
        for (let lane = 0; lane < ROWS; lane++)
          if (
            lane !== row &&
            !game.snapshot().towers.some((tower) => tower.row === lane)
          )
            game.place("astro", lane, 0);
        game.advance(0.05);
        game.drainEvents();
      }
      const group = game
        .snapshot()
        .enemies.filter((enemy) => enemy.row === row);
      expect(game.snapshot().phase).toBe("playing");
      expect(group.length).toBeGreaterThanOrEqual(2);
      expect(group.every((enemy) => enemy.attacking)).toBe(true);
      game.place(kind, row, 7);
      game.advance(0.4);
      const after = game.snapshot().enemies;
      const damaged = group.filter((before) => {
        const enemy = after.find((enemy) => enemy.id === before.id);
        return enemy && before.health - enemy.health === TOWERS[kind].damage;
      });
      expect(damaged).toHaveLength(kind === "astro" ? 1 : group.length);
    },
  );
});

describe("combat presentation clock", () => {
  it("interpolates without changing rules, and holds its position while paused", () => {
    const game = new Simulation();
    game.start();
    game.advance(7.075);
    const before = game.snapshot();
    expect(game.interpolationAlpha()).toBeCloseTo(0.5);
    expect(before.enemies[0].previousX).toBeGreaterThan(before.enemies[0].x);
    game.advance(0.01);
    expect(game.snapshot()).toEqual(before);
    expect(game.interpolationAlpha()).toBeCloseTo(0.7);
    game.pause();
    const alpha = game.interpolationAlpha();
    game.advance(3);
    expect(game.interpolationAlpha()).toBe(alpha);
    game.restart();
    expect(game.interpolationAlpha()).toBe(0);
  });

  it.each([
    "astro",
    "startrell",
    "tars",
    "zeus",
    "explosive",
    "falcon",
  ] as TowerKind[])("releases %s once after a pausable wind-up", (kind) => {
    const game = new Simulation();
    game.start();
    game.advance(5);
    game.place(kind, makeSpawns(3352019)[0].row, 0);
    game.drainEvents();
    game.advance(2);
    const aim = game.drainEvents().filter((event) => event.type === "aim");
    expect(aim).toHaveLength(1);
    expect(game.snapshot().projectiles).toHaveLength(0);
    game.pause();
    const paused = game.snapshot();
    game.advance(5);
    expect(game.snapshot()).toEqual(paused);
    game.resume();
    game.advance(TOWERS[kind].windup);
    expect(
      game.drainEvents().filter((event) => event.type === "shot"),
    ).toHaveLength(1);
    expect(game.snapshot().projectiles).toHaveLength(TOWERS[kind].ammo.length);
    game.advance(0.05);
    expect(
      game.drainEvents().filter((event) => event.type === "shot"),
    ).toHaveLength(0);
    expect(game.snapshot().projectiles).toHaveLength(TOWERS[kind].ammo.length);
  });

  it("cancels a pending shot when its defender is salvaged", () => {
    const game = new Simulation();
    game.start();
    const row = makeSpawns(3352019)[0].row;
    game.place("zeus", row, 0);
    game.advance(7);
    expect(game.snapshot().towers[0].windup).toBeGreaterThan(0);
    game.remove(row, 0);
    game.drainEvents();
    game.advance(1);
    expect(game.snapshot().projectiles).toHaveLength(0);
    expect(game.drainEvents().some((event) => event.type === "shot")).toBe(
      false,
    );
  });
});

describe("armor counters", () => {
  it("preserves ordinary damage on unarmored enemies and gives specialists different plating penetration", () => {
    expect(damageAgainstArmor(26, 0, 0)).toBe(26);
    expect(
      damageAgainstArmor(
        TOWERS.astro.damage,
        ENEMIES.tank.armor,
        TOWERS.astro.armorPierce,
      ),
    ).toBeCloseTo(5.2);
    expect(
      damageAgainstArmor(
        TOWERS.tars.damage,
        ENEMIES.tank.armor,
        TOWERS.tars.armorPierce,
      ),
    ).toBe(48);
    expect(
      damageAgainstArmor(
        TOWERS.zeus.damage,
        ENEMIES.tank.armor,
        TOWERS.zeus.armorPierce,
      ),
    ).toBeCloseTo(46.8);
    expect(
      damageAgainstArmor(
        TOWERS.explosive.damage,
        ENEMIES.tank.armor,
        TOWERS.explosive.armorPierce,
      ),
    ).toBeCloseTo(23.4);
  });
});

it("applies plating to actual impacts and reports the damage against the primary target", () => {
  const game = new Simulation();
  const tankSpawn = makeSpawns(3352019).find((spawn) => spawn.kind === "tank")!;
  const observed = new Set<TowerKind>();
  game.start();
  for (let tick = 0; tick < 1600; tick++) {
    for (let row = 0; row < ROWS; row++)
      if (
        !game
          .snapshot()
          .towers.some((tower) => tower.row === row && tower.col === 0)
      )
        game.place("astro", row, 0);
    if (game.snapshot().elapsed >= tankSpawn.at - 1) {
      if (
        !game
          .snapshot()
          .towers.some(
            (tower) => tower.row === tankSpawn.row && tower.col === 8,
          )
      )
        game.place("wall", tankSpawn.row, 8);
      if (
        !game
          .snapshot()
          .towers.some(
            (tower) => tower.row === tankSpawn.row && tower.col === 7,
          )
      )
        game.place("tars", tankSpawn.row, 7);
    }
    const before = game.snapshot();
    game.advance(0.05);
    const impacts = game
      .drainEvents()
      .filter((event) => event.type === "hit" && event.armored);
    for (const hit of impacts) {
      observed.add(hit.kind!);
      expect(hit.amount).toBeCloseTo(hit.kind === "tars" ? 48 : 5.2);
      const targetBefore = before.enemies.find(
        (enemy) => enemy.id === hit.entityId,
      );
      const targetAfter = game
        .snapshot()
        .enemies.find((enemy) => enemy.id === hit.entityId);
      if (targetBefore && targetAfter) {
        const total = impacts
          .filter((event) => event.entityId === hit.entityId)
          .reduce((sum, event) => sum + event.amount!, 0);
        expect(targetBefore.health - targetAfter.health).toBeCloseTo(total);
      }
    }
    if (observed.has("astro") && observed.has("tars")) break;
  }
  expect(observed).toEqual(new Set(["astro", "tars"]));
});
