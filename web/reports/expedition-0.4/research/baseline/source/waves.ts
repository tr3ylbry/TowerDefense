import type { EnemyKind, Spawn } from "./content";

export const EARLY_WAVE_LEAD = 3;
export const MAX_EARLY_WAVE_BONUS = 40;
export const SPAWN_WARNING_SECONDS = 5;

export interface SpawnWarning {
  row: number;
  in: number;
  count: number;
  threat: "standard" | "armored" | "heavy";
  kinds: EnemyKind[];
}

/** Capped incentive; fast-forwarding income would erase the risk of overlapping waves. */
export function earlyWaveReward(secondsSaved: number): number {
  if (!Number.isFinite(secondsSaved) || secondsSaved < 1 - 1e-9) return 0;
  return Math.min(MAX_EARLY_WAVE_BONUS, Math.floor(secondsSaved + 1e-9) * 2);
}

/** Only scheduled arrivals in the short warning window are revealed. */
export function spawnWarnings(
  spawns: readonly Spawn[],
  from: number,
  elapsed: number,
): SpawnWarning[] {
  const lanes = new Map<number, SpawnWarning>();
  for (let index = from; index < spawns.length; index++) {
    const spawn = spawns[index];
    if (spawn.at > elapsed + SPAWN_WARNING_SECONDS + 1e-9) break;
    const threat =
      spawn.kind === "gargantua"
        ? "heavy"
        : spawn.kind === "tank"
          ? "armored"
          : "standard";
    const existing = lanes.get(spawn.row);
    if (existing) {
      existing.count++;
      if (!existing.kinds.includes(spawn.kind)) existing.kinds.push(spawn.kind);
      if (
        threat === "heavy" ||
        (threat === "armored" && existing.threat === "standard")
      )
        existing.threat = threat;
    } else
      lanes.set(spawn.row, {
        row: spawn.row,
        in: Math.max(0, Math.ceil((spawn.at - elapsed) * 10 - 1e-9) / 10),
        count: 1,
        threat,
        kinds: [spawn.kind],
      });
  }
  return [...lanes.values()].sort((a, b) => a.row - b.row);
}
