import { describe, expect, it } from "vitest";
import { sprinterPose } from "../src/game/alien-animation";
import { ENEMIES, makeMissionSpawns } from "../src/game/content";
import { HARD_FIRST_CONTACT } from "../src/game/challenges";
import { MISSIONS } from "../src/game/missions";
import { Simulation } from "../src/game/simulation";
import { validateContent } from "../src/game/validate-content";
import { CompletionRecorder, emptyProgress } from "../src/campaign/progress";
import { playCampaign } from "./helpers/campaign-policy";

const enemy = { id: 1, x: 8, previousX: 8.02, attacking: false, cooldown: 0 };
describe("simulation-driven Sprinter poses", () => {
  it("selects articulated locomotion only when positions actually differ", () => {
    expect(sprinterPose(enemy, 1, 0, false).state).toBe("walk");
    expect(sprinterPose({ ...enemy, previousX: 8 }, 1, 0, false).state).toBe(
      "idle",
    );
    expect(sprinterPose({ ...enemy, attacking: true }, 1, 0, false).state).toBe(
      "attack",
    );
  });
  it("locks walk phase to distance, including interpolation and complete strides", () => {
    const first = sprinterPose(enemy, 1, 0.5, false);
    expect(
      sprinterPose(
        { ...enemy, x: enemy.x - 0.48, previousX: enemy.previousX - 0.48 },
        50,
        0.5,
        false,
      ),
    ).toEqual(first);
    expect(sprinterPose(enemy, 200, 0.5, false)).toEqual(first);
    expect(sprinterPose(enemy, 1, 0, false).frame).not.toBe(
      sprinterPose({ ...enemy, x: 7.9 }, 1, 1, false).frame,
    );
  });
  it("shows contact on the actual cooldown reset, followed by recovery and anticipation", () => {
    const attack = {
      ...enemy,
      attacking: true,
      cooldown: ENEMIES.sprinter.cooldown,
    };
    expect(sprinterPose(attack, 0, 0, false).frame).toBe(32);
    expect(
      sprinterPose({ ...attack, cooldown: 0.375 }, 0, 0, false).frame,
    ).toBe(40);
    expect(sprinterPose({ ...attack, cooldown: 0 }, 0, 1, false).frame).toBe(
      47,
    );
  });
  it.each([false, true])(
    "reduced motion uses stable meaningful state poses (attack %s)",
    (attacking) => {
      const a = { ...enemy, attacking };
      expect(sprinterPose(a, 0, 0, true)).toEqual(
        sprinterPose({ ...a, x: 6, cooldown: 0.5 }, 20, 1, true),
      );
    },
  );
  it("keeps idle restrained, distinct, looping and static when motion is reduced", () => {
    const idle = { ...enemy, previousX: enemy.x };
    expect(sprinterPose(idle, 0, 0, false).frame).toBe(24);
    expect(sprinterPose(idle, 1.2, 0, false).frame).toBe(28);
    expect(sprinterPose(idle, 2.4, 0, false).frame).toBe(24);
    expect(sprinterPose(idle, 1.2, 0, true).frame).toBe(24);
  });
  it("follows an actual Sprinter's damage tick and freezes on pause", () => {
    const game = new Simulation();
    game.start();
    for (let row = 0; row < 6; row++)
      expect(game.place("wall", row, 7).ok).toBe(true);
    let contact = false;
    for (let i = 0; i < 1200; i++) {
      game.advance(0.05);
      const s = game.snapshot(),
        events = game.drainEvents();
      const sprinter = s.enemies.find(
        (e) =>
          e.kind === "sprinter" &&
          e.attacking &&
          Math.abs(e.cooldown - 0.75) < 1e-8,
      );
      if (!sprinter) continue;
      expect(
        events.some((e) => e.type === "defender-hit" && e.row === sprinter.row),
      ).toBe(true);
      const pose = sprinterPose(
        sprinter,
        s.elapsed,
        game.interpolationAlpha(),
        false,
      );
      expect(pose.frame).toBe(32);
      game.pause();
      game.advance(4);
      expect(game.snapshot().enemies).toEqual(s.enemies);
      expect(
        sprinterPose(
          game.snapshot().enemies.find((e) => e.id === sprinter.id)!,
          game.snapshot().elapsed,
          game.interpolationAlpha(),
          false,
        ),
      ).toEqual(pose);
      contact = true;
      break;
    }
    expect(contact).toBe(true);
  });
});

describe("First Contact Hard prototype", () => {
  it("passes the same authored-content validator as Normal missions", () => {
    expect(() =>
      validateContent({
        ...MISSIONS,
        "first-contact": {
          ...MISSIONS["first-contact"],
          waves: HARD_FIRST_CONTACT,
        },
      }),
    ).not.toThrow();
  });
  it("preserves an existing Normal best result after a stronger Hard win", () => {
    const { game } = playCampaign(
      "first-contact",
      3352019,
      "armor",
      "automatic",
      "hard",
    );
    const progress = emptyProgress();
    progress.best["first-contact"] = {
      stars: 2,
      shields: 2,
      duration: 123,
      kills: 33,
    };
    const before = JSON.stringify(progress);
    expect(new CompletionRecorder().observe(game, progress)).toBeNull();
    expect(JSON.stringify(progress)).toBe(before);
  });
  it("defaults to Normal, opts in only while ready and resets on mission selection", () => {
    const game = new Simulation();
    expect(game.difficulty).toBe("normal");
    expect(game.chooseDifficulty("hard").ok).toBe(true);
    expect(game.waves).toBe(HARD_FIRST_CONTACT);
    game.start();
    expect(game.chooseDifficulty("normal").ok).toBe(false);
    game.restart();
    expect(game.difficulty).toBe("hard");
    expect(game.snapshot().speed).toBe(1);
    game.chooseMission("broken-ground");
    expect(game.difficulty).toBe("normal");
    expect(game.chooseDifficulty("hard").ok).toBe(false);
    game.chooseMission("first-contact");
    expect(game.waves).toBe(MISSIONS["first-contact"].waves);
  });
  it("keeps the original budget, opening, wave start times and alien statistics", () => {
    const normal = new Simulation(),
      hard = new Simulation();
    hard.chooseDifficulty("hard");
    expect(hard.snapshot()).toEqual(normal.snapshot());
    expect(hard.waves.map((w) => w.start)).toEqual(
      normal.waves.map((w) => w.start),
    );
    const a = makeMissionSpawns(3352019, "first-contact", HARD_FIRST_CONTACT);
    expect(a).toEqual(
      makeMissionSpawns(3352019, "first-contact", HARD_FIRST_CONTACT),
    );
    expect(a.slice(0, 6)).toEqual(
      makeMissionSpawns(3352019, "first-contact").slice(0, 6),
    );
    expect(a.filter((e) => e.kind === "tank")).toHaveLength(7);
    expect(a.every((e, i) => !i || e.at >= a[i - 1].at)).toBe(true);
    hard.start();
    for (let i = 0; i < 620; i++) hard.advance(0.05);
    for (const e of hard.snapshot().enemies)
      expect(e.health).toBe(ENEMIES[e.kind].health);
  });
  it("keeps early calls, authoritative warnings, pause and speed independent", () => {
    const game = new Simulation();
    game.chooseDifficulty("hard");
    game.start();
    game.advance(17);
    const before = game.snapshot(),
      next = before.nextWave!;
    expect(next.canLaunch).toBe(true);
    expect(next.enemies.filter((e) => e === "sprinter")).toHaveLength(4);
    expect(game.launchNextWave().ok).toBe(true);
    expect(game.snapshot().credits).toBe(before.credits + next.reward);
    game.advance(2);
    expect(game.snapshot().incoming.length).toBeGreaterThan(0);
    game.pause();
    const paused = game.snapshot();
    game.setSpeed(2);
    game.advance(1);
    expect(game.snapshot().elapsed).toBe(paused.elapsed);
    game.resume();
    game.advance(1);
    expect(game.snapshot().elapsed).toBeCloseTo(paused.elapsed + 2, 6);
    expect(game.difficulty).toBe("hard");
  });
  it.each(["armor", "economy", "mixed", "reactive", "splash"] as const)(
    "supports a real earned-credit %s victory without awarding Normal stars",
    (policy) => {
      const { game, state } = playCampaign(
        "first-contact",
        3352019,
        policy,
        "automatic",
        "hard",
      );
      expect(state.phase).toBe("won");
      const progress = emptyProgress();
      expect(new CompletionRecorder().observe(game, progress)).toBeNull();
      expect(progress.best).toEqual({});
      expect(state.credits).toBe(
        230 +
          state.economy.supply +
          state.economy.growth +
          state.economy.bounties +
          state.economy.calls +
          state.economy.salvage -
          state.economy.spent,
      );
      game.restart();
      game.chooseMission("first-contact");
      expect(game.difficulty).toBe("normal");
    },
  );
  it("can lose, restart and leave the challenge without changing saved progress", () => {
    const game = new Simulation();
    game.chooseDifficulty("hard");
    game.start();
    game.advance(200);
    expect(game.snapshot().phase).toBe("lost");
    const progress = emptyProgress();
    expect(new CompletionRecorder().observe(game, progress)).toBeNull();
    game.restart();
    game.chooseMap("bridge");
    expect(game.difficulty).toBe("normal");
    expect(game.snapshot().credits).toBe(230);
    expect(progress.best).toEqual({});
  });
});
