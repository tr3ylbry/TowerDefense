import {
  COLS,
  isBlocked,
  makeMissionSpawns,
  STEP,
  TOWERS,
} from "../../src/game/content";
import type { TowerKind } from "../../src/game/content";
import { MISSIONS } from "../../src/game/missions";
import type { MissionId } from "../../src/game/missions";
import { Simulation } from "../../src/game/simulation";
import { laneThreats } from "../../src/game/threats";

export const POLICIES = [
  "cheap",
  "economy",
  "armor",
  "mixed",
  "reactive",
] as const;
export const PACING_POLICIES = [...POLICIES, "splash"] as const;
export type Policy = (typeof PACING_POLICIES)[number];
export type CallMode = "automatic" | "clear-field" | "aggressive";
/** Public actions only. No foreknowledge of seeded lanes; reactive reads actual warnings/live enemies. */
export function playCampaign(
  id: MissionId,
  seed: number,
  policy: Policy,
  mode: CallMode = "automatic",
) {
  const game = new Simulation(seed, MISSIONS[id].environment);
  game.chooseMission(id);
  game.start();
  let idle = 0,
    allCoveredAt: number | null = null;
  // Read-only research instrumentation. It never influences the policy's actions.
  let idleStreak = 0,
    longestIdle = 0,
    replacements = 0;
  let lastPurchaseAt: number | null = null,
    lastDamageAt: number | null = null;
  const visited = new Set<string>();
  const threatSeconds = {
    armored: 0,
    heavy: 0,
    clusteredLane: 0,
    passedLane: 0,
  };
  const purchasedByKind: Partial<Record<TowerKind, number>> = {};
  const schedule = makeMissionSpawns(seed, id);
  const pacing = {
    opening: 0,
    withinWave: 0,
    betweenWaves: 0,
    active: 0,
    clearCallAvailable: 0,
    quietAffordableGunTile: 0,
    quietPurchases: 0,
    quietSpent: 0,
    latePurchases: 0,
    lateReplacements: 0,
  };
  const quietIntervals: { start: number; end: number }[] = [];
  const callDecisions: {
    at: number;
    wave: number;
    saved: number;
    reward: number;
    surviving: number;
    plated: number;
    heavy: number;
    critical: number;
  }[] = [];
  const columns = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => col).filter(
      (col) => !isBlocked(MISSIONS[id].environment, row, col),
    ),
  );
  const slots: { kind: TowerKind; row: number; col: number }[] = [];
  const income = policy === "economy" || policy === "mixed";
  if (income)
    for (let row = 0; row < 2; row++)
      slots.push({ kind: "bush", row, col: columns[row][1] });
  const ranks: TowerKind[] =
    policy === "cheap"
      ? ["astro", "astro"]
      : policy === "splash"
        ? ["astro", "explosive", "zeus"]
        : policy === "mixed"
          ? ["astro", "zeus", "tars"]
          : policy === "reactive"
            ? ["astro"]
            : ["astro", "tars"];
  const reserved = (row: number, col: number) =>
    income && row < 2 && col === columns[row][1];
  ranks.forEach((kind, rank) => {
    for (let row = 0; row < 6; row++)
      slots.push({
        kind,
        row,
        col: columns[row].filter((col) => !reserved(row, col))[rank],
      });
  });
  for (let tick = 0; tick < 12000; tick++) {
    const state = game.snapshot();
    if (state.phase !== "playing") break;
    if (!state.enemies.length && state.pendingSpawns) {
      idle += STEP;
      idleStreak += STEP;
      longestIdle = Math.max(longestIdle, idleStreak);
      const next = schedule[schedule.length - state.pendingSpawns];
      const category =
        state.wave === 0
          ? "opening"
          : next?.wave === state.wave
            ? "withinWave"
            : "betweenWaves";
      pacing[category] += STEP;
      const last = quietIntervals.at(-1);
      if (last && Math.abs(last.end - state.elapsed) < STEP / 2)
        last.end = state.elapsed + STEP;
      else
        quietIntervals.push({
          start: state.elapsed,
          end: state.elapsed + STEP,
        });
      if (state.nextWave?.canLaunch) pacing.clearCallAvailable += STEP;
      if (
        state.credits >= TOWERS.astro.cost &&
        columns.some((cols, row) =>
          cols.some(
            (col) => !state.towers.some((t) => t.row === row && t.col === col),
          ),
        )
      )
        pacing.quietAffordableGunTile += STEP;
    } else idleStreak = 0;
    if (state.enemies.length) pacing.active += STEP;
    if (state.enemies.some((e) => e.kind === "tank"))
      threatSeconds.armored += STEP;
    if (state.enemies.some((e) => e.kind === "gargantua"))
      threatSeconds.heavy += STEP;
    for (let row = 0; row < 6; row++) {
      const enemies = state.enemies.filter((e) => e.row === row);
      if (
        enemies.some((a, i) =>
          enemies.some((b, j) => i < j && Math.abs(a.x - b.x) <= 1),
        )
      )
        threatSeconds.clusteredLane += STEP;
    }
    threatSeconds.passedLane +=
      laneThreats(state).filter((t) => t.passed).length * STEP;
    if (
      allCoveredAt === null &&
      Array.from({ length: 6 }, (_, row) =>
        state.towers.some((t) => t.row === row && TOWERS[t.kind].damage > 0),
      ).every(Boolean)
    )
      allCoveredAt = state.elapsed;
    const plan = [...slots];
    if (policy === "reactive")
      for (let row = 0; row < 6; row++) {
        const kinds = [
          ...state.enemies.filter((e) => e.row === row).map((e) => e.kind),
          ...state.incoming
            .filter((e) => e.row === row)
            .flatMap((e) => e.kinds),
        ];
        const support: TowerKind | null = kinds.includes("tank")
          ? "tars"
          : kinds.includes("gargantua")
            ? "zeus"
            : state.incoming.some((e) => e.row === row && e.count >= 2)
              ? "explosive"
              : kinds.includes("sprinter")
                ? "startrell"
                : null;
        if (support) plan.push({ kind: support, row, col: columns[row][1] });
      }
    for (const slot of plan) {
      const live = game.snapshot();
      if (live.towers.some((t) => t.row === slot.row && t.col === slot.col))
        continue;
      // Save for the next planned slot, instead of spending its funds on cheaper later entries.
      if (live.credits < TOWERS[slot.kind].cost) break;
      const result = game.place(slot.kind, slot.row, slot.col);
      if (result.ok) {
        const key = `${slot.row}:${slot.col}`;
        if (visited.has(key)) replacements++;
        if (!live.enemies.length) {
          pacing.quietPurchases++;
          pacing.quietSpent += TOWERS[slot.kind].cost;
        }
        if (live.wave >= 3) {
          pacing.latePurchases++;
          if (visited.has(key)) pacing.lateReplacements++;
        }
        visited.add(key);
        lastPurchaseAt = live.elapsed;
        purchasedByKind[slot.kind] = (purchasedByKind[slot.kind] ?? 0) + 1;
      }
    }
    const after = game.snapshot();
    if (
      after.nextWave?.canLaunch &&
      (mode === "aggressive" ||
        (mode === "clear-field" && !after.enemies.length))
    ) {
      const next = after.nextWave!;
      callDecisions.push({
        at: after.elapsed,
        wave: next.number,
        saved: next.secondsSaved,
        reward: next.reward,
        surviving: after.enemies.length,
        plated: after.enemies.filter((e) => e.kind === "tank").length,
        heavy: after.enemies.filter((e) => e.kind === "gargantua").length,
        critical: after.towers.filter(
          (t) => t.health / TOWERS[t.kind].health < 0.3,
        ).length,
      });
      game.launchNextWave();
    }
    game.advance(STEP);
    if (game.drainEvents().some((e) => e.type === "defender-hit"))
      lastDamageAt = game.snapshot().elapsed;
  }
  return {
    game,
    state: game.snapshot(),
    idle: Math.round(idle * 100) / 100,
    allCoveredAt,
    research: {
      longestIdle,
      replacements,
      lastPurchaseAt,
      lastDamageAt,
      purchasedByKind,
      threatSeconds,
      pacing,
      callDecisions,
      quietAfterLastPurchase: quietIntervals.reduce(
        (sum, interval) =>
          sum +
          Math.max(
            0,
            interval.end - Math.max(interval.start, lastPurchaseAt ?? 0),
          ),
        0,
      ),
    },
  };
}
