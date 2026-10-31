import { COLS, isBlocked, ROWS, TOWERS } from "./content";
import type { TowerKind } from "./content";
import type { Enemy, Snapshot } from "./simulation";
import { canReachForward } from "./combat";

export interface LaneThreat {
  row: number;
  enemy: Enemy;
  armed: boolean;
  engaged: boolean;
  passed: boolean;
  rescueCol: number | null;
}

/** Current targetability, not a promise of enough damage or survival. */
export function laneThreats(state: Snapshot): LaneThreat[] {
  if (state.phase !== "playing" && state.phase !== "paused") return [];
  return Array.from({ length: ROWS }, (_, row) => {
    const enemy = state.enemies
      .filter((e) => e.row === row && e.health > 0)
      .reduce<Enemy | null>(
        (nearest, e) => (!nearest || e.x < nearest.x ? e : nearest),
        null,
      );
    if (!enemy) return null;
    const guns = state.towers.filter(
      (t) => t.row === row && t.health > 0 && TOWERS[t.kind].damage > 0,
    );
    const engaged = guns.some((t) => canReachForward(t.col, enemy.x));
    const rescueCol =
      Array.from({ length: COLS }, (_, col) => col).find(
        (col) =>
          canReachForward(col, enemy.x) &&
          !isBlocked(state.map, row, col) &&
          !state.towers.some(
            (t) => t.row === row && t.col === col && t.health > 0,
          ),
      ) ?? null;
    return {
      row,
      enemy,
      armed: guns.length > 0,
      engaged,
      passed: guns.length > 0 && !engaged,
      rescueCol,
    };
  }).filter((t): t is LaneThreat => t !== null);
}

export function placementWarning(
  kind: TowerKind,
  state: Snapshot,
  row: number,
  col: number,
): string | null {
  if (!TOWERS[kind].damage) return null;
  const passed = state.enemies.some(
    (e) => e.health > 0 && e.row === row && !canReachForward(col, e.x),
  );
  return passed
    ? `A hostile has passed tile ${col + 1}'s firing line. Fresh shots fire right; place left of the hostile to engage it directly. Deployment is still allowed for later arrivals.`
    : null;
}

export function threatAdvice(threat: LaneThreat): string {
  return threat.rescueCol !== null
    ? `L${threat.row + 1}: hostile past guns. A gun at tile ${threat.rescueCol + 1} can engage; check credits and armor.`
    : `L${threat.row + 1}: hostile past guns; no empty firing tile to its left. Salvage a blocker or prepare for a breach.`;
}
