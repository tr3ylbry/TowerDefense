import { describe, expect, it } from "vitest";
import { makeMissionSpawns, makeSpawns, MAPS } from "../src/game/content";
import { ENVIRONMENTS } from "../src/game/environments";
import {
  CAMPAIGN_ORDER,
  MISSIONS,
  STANDALONE_MISSIONS,
} from "../src/game/missions";
import type { MissionId, MissionDefinition } from "../src/game/missions";
import { validateContent } from "../src/game/validate-content";
import { Simulation } from "../src/game/simulation";
import {
  campaignSummary,
  CompletionRecorder,
  emptyProgress,
  isUnlocked,
  rating,
} from "../src/campaign/progress";
import {
  CampaignSave,
  decodeSave,
  RECOVERY_KEY,
  SAVE_KEY,
} from "../src/campaign/save";
import { playCampaign } from "./helpers/campaign-policy";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
};
const best = (stars: 1 | 2 | 3) => ({
  stars,
  shields: stars,
  duration: 100,
  kills: 33,
});

describe("campaign content and single-engine schedules", () => {
  it("validates the six authored missions and shared terrain", () => {
    expect(() => validateContent()).not.toThrow();
    expect(CAMPAIGN_ORDER).toHaveLength(6);
    expect(new Set(CAMPAIGN_ORDER).size).toBe(6);
    expect(ENVIRONMENTS.bridge.blocked.flat()).toHaveLength(12);
    expect(ENVIRONMENTS.nest.blocked.flat()).toHaveLength(16);
    for (const map of ["canyon", "bridge", "nest"] as const) {
      expect(MAPS[map].blocked).toBe(ENVIRONMENTS[map].blocked);
      expect(MAPS[map].waves).toBe(MISSIONS[STANDALONE_MISSIONS[map]].waves);
      for (const seed of [0, 1, 3352019, 4294967295])
        expect(makeMissionSpawns(seed, STANDALONE_MISSIONS[map])).toEqual(
          makeSpawns(seed, map),
        );
    }
  });
  it.each(CAMPAIGN_ORDER)(
    "%s is reproducible, sorted and covers legal lanes",
    (id) => {
      for (const seed of [0, 1, 3352019, 4294967295]) {
        const schedule = makeMissionSpawns(seed, id);
        expect(schedule).toEqual(makeMissionSpawns(seed, id));
        expect(schedule.length).toBe(
          MISSIONS[id].waves.reduce((n, w) => n + w.enemies.length, 0),
        );
        expect(
          schedule.every(
            (s, i) =>
              s.row >= 0 && s.row < 6 && (!i || s.at >= schedule[i - 1].at),
          ),
        ).toBe(true);
      }
      expect(makeMissionSpawns(1, id)).not.toEqual(makeMissionSpawns(2, id));
    },
  );
  it.each([
    ["environment", "missing"],
    ["order", 2],
    ["seed", NaN],
    ["id", "other"],
    ["prerequisite", "heart-of-the-swarm"],
    ["briefing", ""],
  ])("rejects invalid %s", (key, value) => {
    const missions = structuredClone(MISSIONS) as Record<
      string,
      MissionDefinition
    >;
    Object.assign(missions["first-contact"], { [key]: value });
    expect(() => validateContent(missions)).toThrow(/Invalid mission content/);
  });
  it.each(["enemy", "entry count", "offset", "lane", "overlap", "empty"])(
    "rejects malformed %s",
    (kind) => {
      const missions = structuredClone(MISSIONS) as Record<
        string,
        MissionDefinition
      >;
      const waves = structuredClone(missions["first-contact"].waves) as any[];
      if (kind === "enemy") waves[0].enemies[0] = "unsupported";
      if (kind === "entry count") waves[0].entries = [];
      if (kind === "offset")
        waves[0].entries = waves[0].enemies.map(() => ({
          offset: -1,
          laneSlot: 0,
        }));
      if (kind === "lane")
        waves[0].entries = waves[0].enemies.map(() => ({
          offset: 0,
          laneSlot: 6,
        }));
      if (kind === "overlap") waves[1].start = 8;
      if (kind === "empty") waves.length = 0;
      missions["first-contact"].waves = waves;
      expect(() => validateContent(missions)).toThrow();
    },
  );
  it("rejects impossible and duplicate terrain coordinates", () => {
    for (const cells of [[9], [-1], [1, 1], [0.2]]) {
      const environments = structuredClone(ENVIRONMENTS) as any;
      environments.bridge.blocked[0] = cells;
      expect(() => validateContent(MISSIONS, environments)).toThrow(
        /terrain coordinate/,
      );
    }
  });
  it("requires explicit restart for active mission selection and restores selected wave content", () => {
    const game = new Simulation();
    game.chooseMission("canyon-escalation");
    game.start();
    game.advance(20);
    expect(game.chooseMission("heart-of-the-swarm").ok).toBe(false);
    const attempt = game.attemptId;
    game.restart();
    expect(game.attemptId).toBe(attempt + 1);
    expect(game.snapshot().mission).toBe("canyon-escalation");
    expect(game.snapshot().pendingSpawns).toBe(42);
    expect(game.snapshot().nextWave?.title).toBe("Wide horizon");
    expect(game.chooseMission("missing" as MissionId).ok).toBe(false);
    expect(game.chooseMap("bridge").ok).toBe(true);
    expect(game.snapshot().mission).toBe("broken-ground");
  });
});

describe("authoritative completion and progression", () => {
  it.each([1, 2, 3] as const)(
    "awards %i stars only for a victory with that many shields",
    (integrity) => {
      expect(rating({ phase: "won", integrity })).toBe(integrity);
      for (const phase of ["ready", "playing", "paused", "lost"] as const)
        expect(rating({ phase, integrity })).toBe(0);
    },
  );
  it("rejects invalid shield ratings", () => {
    for (const integrity of [0, 4, -1, NaN, 1.5])
      expect(rating({ phase: "won", integrity })).toBe(0);
  });
  it("starts with only mission 01 unlocked; later recovered wins remain replayable", () => {
    const progress = emptyProgress();
    expect(CAMPAIGN_ORDER.filter((id) => isUnlocked(progress, id))).toEqual([
      "first-contact",
    ]);
    progress.best["into-the-nest"] = best(2);
    expect(isUnlocked(progress, "into-the-nest")).toBe(true);
    expect(isUnlocked(progress, "heart-of-the-swarm")).toBe(true);
    expect(isUnlocked(progress, "broken-ground")).toBe(false);
  });
  it("records once, improves stars, preserves best metadata, and ignores losses", () => {
    const { game } = playCampaign("first-contact", 3352019, "armor");
    const progress = emptyProgress(),
      recorder = new CompletionRecorder();
    expect(recorder.observe(new Simulation(), progress)).toBeNull();
    progress.best["first-contact"] = best(1);
    expect(recorder.observe(game, progress)?.previous).toBe(1);
    const saved = structuredClone(progress);
    expect(recorder.observe(game, progress)?.stars).toBe(3);
    expect(progress).toEqual(saved);
    const reset = emptyProgress();
    recorder.observe(game, reset);
    expect(reset).toEqual(emptyProgress());
    expect(isUnlocked(progress, "canyon-escalation")).toBe(true);
    const loss = new Simulation();
    loss.start();
    loss.advance(300);
    expect(recorder.observe(loss, progress)).toBeNull();
    expect(progress).toEqual(saved);
    const replay = playCampaign("first-contact", 3352019, "armor").game;
    // New sessions use their own recorder, never an unbounded global attempt history.
    const second = new CompletionRecorder();
    expect(second.observe(replay, progress)?.previous).toBe(3);
    expect(progress).toEqual(saved);
  });
  it("preserves a three-star best after an authoritative two-shield replay win", () => {
    const game = new Simulation();
    const omitted = makeSpawns(3352019, "canyon")[0].row;
    game.start();
    for (
      let tick = 0;
      tick < 12000 && game.snapshot().phase === "playing";
      tick++
    ) {
      for (const [col, kind] of (["astro", "tars"] as const).entries()) {
        for (let row = 0; row < 6; row++) {
          const state = game.snapshot();
          if (state.integrity === 3 && row === omitted) continue;
          if (!state.towers.some((t) => t.row === row && t.col === col))
            game.place(kind, row, col);
        }
      }
      game.advance(0.05);
      game.drainEvents();
    }
    expect(game.snapshot()).toMatchObject({ phase: "won", integrity: 2 });
    const progress = emptyProgress();
    progress.best["first-contact"] = best(3);
    const before = structuredClone(progress);
    expect(new CompletionRecorder().observe(game, progress)).toEqual({
      mission: "first-contact",
      stars: 2,
      previous: 3,
      best: 3,
    });
    expect(progress).toEqual(before);
  });
  it("does not record a locked mission win", () => {
    const { game } = playCampaign("heart-of-the-swarm", 3352019, "mixed");
    const progress = emptyProgress();
    expect(new CompletionRecorder().observe(game, progress)).toBeNull();
    expect(progress.best).toEqual({});
  });
  it("completes the whole chapter with the same engine and unlock chain", () => {
    const progress = emptyProgress();
    for (const id of CAMPAIGN_ORDER) {
      expect(isUnlocked(progress, id)).toBe(true);
      const { game, state } = playCampaign(id, 3352019, "mixed");
      expect(state.phase, id).toBe("won");
      expect(
        new CompletionRecorder().observe(game, progress)?.stars,
      ).toBeGreaterThan(0);
    }
    expect(campaignSummary(progress)).toEqual({
      completed: 6,
      stars: 18,
      next: null,
    });
  });
});

describe("isolated versioned saves", () => {
  it("round trips validated progress and resets only campaign keys", () => {
    const storage = memoryStorage();
    storage.setItem("ava-reduced-motion", "true");
    storage.setItem("other-app", "untouched");
    const save = new CampaignSave(() => storage);
    save.progress.best["first-contact"] = best(3);
    save.save();
    expect(new CampaignSave(() => storage).progress).toEqual(save.progress);
    save.reset();
    expect(save.progress).toEqual(emptyProgress());
    expect([...storage.data]).toEqual([
      ["ava-reduced-motion", "true"],
      ["other-app", "untouched"],
    ]);
  });
  it("retains valid wins from partly corrupt data and backs up the original before overwriting", () => {
    const storage = memoryStorage();
    const raw = JSON.stringify({
      version: 1,
      best: {
        "first-contact": best(2),
        "broken-ground": { stars: 3, shields: 100, duration: "bad", kills: -1 },
        missing: best(3),
        "canyon-escalation": { stars: 4 },
      },
    });
    storage.setItem(SAVE_KEY, raw);
    const save = new CampaignSave(() => storage);
    expect(save.progress.best).toEqual({
      "first-contact": best(2),
      "broken-ground": { stars: 3, shields: 3, duration: null, kills: null },
    });
    expect(save.warning).toContain("Recovered");
    expect(storage.getItem(RECOVERY_KEY)).toBe(raw);
    save.save();
    expect(decodeSave(storage.getItem(SAVE_KEY)!).recovered).toBe(false);
  });
  it.each([
    "{not json",
    "null",
    "[]",
    '{"version":1}',
    '{"version":1,"best":[]}',
  ])("handles malformed %s without crashing", (raw) => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, raw);
    const save = new CampaignSave(() => storage);
    expect(save.progress).toEqual(emptyProgress());
    expect(save.warning).not.toBe("");
  });
  it.each([0, 2, 99])(
    "preserves unsupported version %i until explicit reset",
    (version) => {
      const storage = memoryStorage();
      const raw = JSON.stringify({
        version,
        best: { "first-contact": best(3) },
      });
      storage.setItem(SAVE_KEY, raw);
      const save = new CampaignSave(() => storage);
      save.progress.best["first-contact"] = best(1);
      save.save();
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
      expect(save.warning).toContain("unsupported version");
      save.reset();
      save.save();
      expect(decodeSave(storage.getItem(SAVE_KEY)!).progress).toEqual(
        emptyProgress(),
      );
    },
  );
  it.each([0, 4, 1.5, -1, "3", null])("rejects invalid stars %s", (stars) => {
    expect(
      decodeSave(
        JSON.stringify({
          version: 1,
          best: { "first-contact": { ...best(3), stars } },
        }),
      ).progress.best,
    ).toEqual({});
  });
  it("keeps in-memory progress when storage access or writing is blocked", () => {
    const save = new CampaignSave(() => {
      throw new Error("blocked");
    });
    save.progress.best["first-contact"] = best(3);
    save.save();
    expect(save.progress.best["first-contact"]?.stars).toBe(3);
    expect(save.warning).toContain("unavailable");
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("quota");
    };
    const writer = new CampaignSave(() => storage);
    writer.progress.best["first-contact"] = best(2);
    writer.save();
    const warning = writer.warning;
    writer.save();
    expect(writer.warning).toBe(warning);
    expect(writer.progress.best["first-contact"]?.stars).toBe(2);
  });
  it("protects damaged originals when recovery backup fails or a different backup exists", () => {
    for (const existing of [null, "previous damage"]) {
      const storage = memoryStorage();
      storage.setItem(SAVE_KEY, "{broken");
      if (existing) storage.setItem(RECOVERY_KEY, existing);
      else
        storage.setItem = () => {
          throw new Error("quota");
        };
      const save = new CampaignSave(() => storage);
      save.save();
      expect(storage.getItem(SAVE_KEY)).toBe("{broken");
      expect(save.warning).not.toBe("");
    }
  });
  it("reports a failed storage reset without claiming it was deleted", () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, best: { "first-contact": best(3) } }),
    );
    storage.removeItem = () => {
      throw new Error("blocked");
    };
    const save = new CampaignSave(() => storage);
    save.reset();
    expect(save.progress).toEqual(emptyProgress());
    expect(save.warning).toContain("may return");
    expect(storage.getItem(SAVE_KEY)).not.toBeNull();
  });
});

it("merges another tab's valid wins and protects newly incompatible data", () => {
  const storage = memoryStorage();
  const first = new CampaignSave(() => storage),
    second = new CampaignSave(() => storage);
  first.progress.best["first-contact"] = best(3);
  first.save();
  second.progress.best["canyon-escalation"] = best(2);
  second.save();
  expect(new CampaignSave(() => storage).progress.best).toEqual({
    "first-contact": best(3),
    "canyon-escalation": best(2),
  });
  const future = JSON.stringify({ version: 99, best: {} });
  storage.setItem(SAVE_KEY, future);
  second.save();
  expect(storage.getItem(SAVE_KEY)).toBe(future);
  expect(second.warning).toContain("another tab");
});
