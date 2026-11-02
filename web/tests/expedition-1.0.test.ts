import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  ALIEN_ANIMATIONS,
  alienPose,
  attackContact,
  isAnimatedAlien,
} from "../src/game/alien-animation";
import { ENEMIES } from "../src/game/content";
import { Simulation } from "../src/game/simulation";
import sprinter from "../art-source/expedition-1.0/sprinter-conversion.json";
import gargantua from "../art-source/expedition-1.0/gargantua-conversion.json";

import scout from "../art-source/expedition-1.0/scout-conversion.json";

import grunt from "../art-source/expedition-1.0/grunt-conversion.json";

import manhunter from "../art-source/expedition-1.0/manhunter-conversion.json";

import tank from "../art-source/expedition-1.0/tank-conversion.json";

const moving = { id: 3, x: 8, previousX: 8.02, attacking: false, cooldown: 0 };
const records = { scout, grunt, sprinter, manhunter, tank, gargantua };
for (const kind of ["scout", "grunt", "sprinter", "manhunter", "tank", "gargantua"] as const) {
  const firstIdle = kind === "sprinter" ? 24 : 16;
  const firstAttack = firstIdle + 8;
  describe(`${kind} presentation contract`, () => {
    it("selects walk, idle and authoritative contact without mutating the enemy", () => {
      const enemy = Object.freeze({ ...moving });
      expect(alienPose(kind, enemy, 0, 1, false).state).toBe("walk");
      expect(alienPose(kind, { ...enemy, previousX: 8 }, 0, 1, false)).toEqual({
        state: "idle",
        frame: firstIdle,
      });
      expect(
        alienPose(
          kind,
          { ...enemy, attacking: true, cooldown: ENEMIES[kind].cooldown },
          0,
          0,
          false,
        ),
      ).toEqual({ state: "attack", frame: firstAttack });
      expect(enemy).toEqual(moving);
    });
    it("locks interpolation to character stride and ignores unrelated elapsed time", () => {
      const stride = records[kind].settings.strideWorldPixels / 100;
      const pose = alienPose(kind, moving, 0, 0.5, false);
      expect(
        alienPose(
          kind,
          { ...moving, x: 8 - stride, previousX: 8.02 - stride },
          33,
          0.5,
          false,
        ),
      ).toEqual(pose);
      expect(alienPose(kind, moving, 900, 0.5, false)).toEqual(pose);
      expect(alienPose(kind, moving, 0, -9, false)).toEqual(
        alienPose(kind, moving, 0, 0, false),
      );
      expect(alienPose(kind, moving, 0, 9, false)).toEqual(
        alienPose(kind, moving, 0, 1, false),
      );
    });
    it("never wraps anticipation into contact before the next damage tick", () => {
      const e = { ...moving, attacking: true, cooldown: 0 };
      expect(alienPose(kind, e, 0, 1, false).frame).toBe(firstAttack + 15);
      expect(attackContact(kind, 0, 1)).toBe(0);
      expect(attackContact(kind, ENEMIES[kind].cooldown, 0)).toBe(1);
      expect(attackContact(kind, ENEMIES[kind].cooldown - 0.2, 0)).toBe(0);
    });
    it("uses stable meaningful reduced-motion poses for all states", () => {
      for (const e of [
        moving,
        { ...moving, previousX: 8 },
        { ...moving, attacking: true },
      ])
        expect(alienPose(kind, e, 0, 0, true)).toEqual(
          alienPose(kind, { ...e, cooldown: 0.1 }, 30, 1, true),
        );
    });
    it("has contiguous registered poses, intact alpha, reviewed grounding and matching encoded hash", () => {
      const record = records[kind];
      const sheet = ALIEN_ANIMATIONS[kind];
      expect(record.frames).toBe(sheet.frames);
      expect(record.sequences).toEqual({
        walk: [0, firstIdle],
        idle: [firstIdle, 8],
        attack: [firstAttack, 16],
      });
      expect(record.frame.width).toBe(sheet.frameWidth);
      expect(record.frame.height).toBe(sheet.frameHeight);
      expect(record.frame.ground / sheet.frameHeight).toBeCloseTo(sheet.foot);
      expect(record.alphaExactAfterEncoding).toBe(true);
      expect(record.frameAlphaBounds).toHaveLength(sheet.frames);
      for (const [left, top, right, bottom] of record.frameAlphaBounds) {
        expect(left).toBeGreaterThan(0);
        expect(top).toBeGreaterThan(0);
        expect(right).toBeLessThan(sheet.frameWidth);
        expect(Math.abs(bottom - record.frame.ground)).toBeLessThanOrEqual(2);
      }
      for (const [file, input] of Object.entries(record.inputs)) {
        const source = readFileSync(new URL(`../${file}`, import.meta.url));
        expect(source.length).toBe(input.bytes);
        expect(createHash("sha256").update(source).digest("hex")).toBe(
          input.sha256,
        );
      }
      const bytes = readFileSync(
        new URL(`../${record.production.file}`, import.meta.url),
      );
      expect(bytes.length).toBe(record.production.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        record.production.sha256,
      );
      expect(sheet.fps).toBe(0);
    });
  });
}
it("covers every illustrated alien with an articulated atlas", () => {
  expect(isAnimatedAlien("gargantua")).toBe(true);
  expect(isAnimatedAlien("sprinter")).toBe(true);
  for (const kind of ["scout", "grunt", "tank", "manhunter"] as const)
    expect(isAnimatedAlien(kind)).toBe(true);
});
it("shows Gargantua contact on a real damage event and freezes it on pause", () => {
  const game = new Simulation();
  game.start();
  let found = false;
  for (let tick = 0; tick < 2500; tick++) {
    const before = game.snapshot();
    if (before.nextWave?.canLaunch) game.launchNextWave();
    for (let row = 0; row < 6; row++) {
      if (
        !before.towers.some((t) => t.row === row && t.col === 7) &&
        game.snapshot().credits >= 35
      )
        game.place("wall", row, 7);
    }
    game.advance(0.05);
    const state = game.snapshot(),
      events = game.drainEvents();
    const enemy = state.enemies.find(
      (e) =>
        e.kind === "gargantua" &&
        e.attacking &&
        Math.abs(e.cooldown - 1.2) < 1e-8,
    );
    if (!enemy) continue;
    expect(
      events.some(
        (e) =>
          e.type === "defender-hit" && e.row === enemy.row && e.amount === 100,
      ),
    ).toBe(true);
    expect(alienPose("gargantua", enemy, state.elapsed, 0, false).frame).toBe(
      24,
    );
    game.pause();
    const paused = game.snapshot();
    game.advance(10);
    expect(game.snapshot()).toEqual(paused);
    found = true;
    break;
  }
  expect(found).toBe(true);
});
