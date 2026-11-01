import { describe, expect, it } from "vitest";
import { Simulation } from "../src/game/simulation";
import { coverage, waveCallDetails } from "../src/guidance";
import {
  laneThreats,
  placementWarning,
  threatAdvice,
} from "../src/game/threats";
import { playCampaign } from "./helpers/campaign-policy";

describe("wave decision feedback", () => {
  it("explains automatic waiting, the actual reward window and survivors without changing state", () => {
    const game = new Simulation();
    game.start();
    game.advance(17);
    const state = game.snapshot();
    expect(state.nextWave?.canLaunch).toBe(true);
    expect(waveCallDetails(state)).toEqual([
      "Call available · Wait 12s, or call: 3s lead (~9s sooner).",
      "6 still on field: incoming hostiles will overlap survivors. Later waves shift too.",
    ]);
    expect(game.snapshot()).toEqual(state);
    expect(game.launchNextWave()).toMatchObject({ ok: true });
    expect(game.snapshot().economy.calls).toBe(state.nextWave!.reward);
    expect(game.snapshot().nextWave!.startAt).toBe(20);
  });
  it("distinguishes an empty field from overlap without calling it safe", () => {
    const game = new Simulation();
    game.start();
    game.advance(17);
    const state = { ...game.snapshot(), enemies: [] };
    expect(waveCallDetails(state)[1]).toBe(
      "Field clear. Keep preparing or call early. Later waves shift too.",
    );
  });
  it("preserves the simulation's preparation, entering and pause reasons and handles the final wave", () => {
    const game = new Simulation();
    for (const advance of [0, 8, 9]) {
      game.start();
      game.advance(advance);
      if (advance === 9) game.pause();
      const state = game.snapshot();
      expect(waveCallDetails(state)).toEqual(["", state.nextWave!.reason]);
    }
    expect(waveCallDetails({ ...game.snapshot(), nextWave: null })).toEqual([
      "",
      "No further wave to call.",
    ]);
  });
});

describe("truthful coverage and recovery", () => {
  it("labels equipped lanes without claiming quiet guns are firing", () => {
    const game = new Simulation();
    game.start();
    expect(coverage(game.snapshot())).toContain("0/6 lanes armed");
    game.place("astro", 0, 0);
    expect(coverage(game.snapshot())).toContain("1/6 lanes armed");
    game.advance(20);
    for (let row = 1; row < 6; row++) game.place("astro", row, 0);
    expect(coverage(game.snapshot())).toContain(
      "nearest threats in firing lines",
    );
    expect(coverage({ ...game.snapshot(), enemies: [] })).toBe(
      "6/6 lanes armed · Your crew fires right",
    );
  });
  it("offers a legal empty rescue tile and distinguishes occupied forward tiles", () => {
    const game = new Simulation();
    game.start();
    game.advance(22);
    const row = game.snapshot().enemies[0].row;
    const first = game.snapshot().enemies[0];
    expect(placementWarning("astro", game.snapshot(), row, 8)).toContain(
      "tile 1 can engage",
    );
    const towers = Array.from({ length: 9 }, (_, col) => ({
      id: col,
      kind: "bush" as const,
      row,
      col,
      health: 100,
      cooldown: 0,
      incomeClock: 0,
      windup: 0,
      lastHitAt: -1000,
    }));
    const threat = laneThreats({
      ...game.snapshot(),
      towers,
      enemies: [first],
    })[0];
    expect(threat.rescueCol).toBeNull();
    expect(threat.recoveryCol).toBe(0);
    expect(threatAdvice(threat)).toContain("Salvage an occupied forward tile");
  });
  it("does not recommend impossible fresh shots for the reproducible pinned Tank", () => {
    const { game, state } = playCampaign(
      "first-contact",
      3352022,
      "cheap",
      "aggressive",
    );
    expect(state.phase).toBe("playing");
    expect(state.elapsed).toBe(600);
    const threat = laneThreats(state).find((t) => t.passed)!;
    expect(threat.recoveryCol).toBeNull();
    expect(threatAdvice(threat)).toContain("risking a shield");
    expect(placementWarning("tars", state, threat.row, 1)).toContain(
      "a new gun cannot hit it directly",
    );
    expect(game.remove(threat.row, 0).ok).toBe(true);
    game.advance(10);
    expect(game.snapshot()).toMatchObject({ phase: "won", integrity: 2 });
  });
});
