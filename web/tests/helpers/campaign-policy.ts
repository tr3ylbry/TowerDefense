import { COLS, isBlocked, STEP, TOWERS } from "../../src/game/content";
import type { TowerKind } from "../../src/game/content";
import { MISSIONS } from "../../src/game/missions";
import type { MissionId } from "../../src/game/missions";
import { Simulation } from "../../src/game/simulation";

export const POLICIES = [
  "cheap",
  "economy",
  "armor",
  "mixed",
  "reactive",
] as const;
export type Policy = (typeof POLICIES)[number];
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
    if (!state.enemies.length && state.pendingSpawns) idle += STEP;
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
      game.place(slot.kind, slot.row, slot.col);
    }
    const after = game.snapshot();
    if (
      after.nextWave?.canLaunch &&
      (mode === "aggressive" ||
        (mode === "clear-field" && !after.enemies.length))
    )
      game.launchNextWave();
    game.advance(STEP);
    game.drainEvents();
  }
  return {
    game,
    state: game.snapshot(),
    idle: Math.round(idle * 100) / 100,
    allCoveredAt,
  };
}
