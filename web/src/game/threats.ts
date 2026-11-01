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
  recoveryCol: number | null;
}

/** Current targetability, not a promise of enough damage or survival. */
export function laneThreats(state: Snapshot): LaneThreat[] {
  if (state.phase !== "playing" && state.phase !== "paused") return [];
  return Array.from({ length: ROWS }, (_, row): LaneThreat | null => {
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
    const firingCols = Array.from({ length: COLS }, (_, col) => col).filter(
      (col) => canReachForward(col, enemy.x) && !isBlocked(state.map, row, col),
    );
    const rescueCol =
      firingCols.find(
        (col) =>
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
      recoveryCol: firingCols[0] ?? null,
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
  const threat = laneThreats(state).find((t) => t.row === row);
  if (!threat || canReachForward(col, threat.enemy.x)) return null;
  const recovery =
    threat.recoveryCol === null
      ? "It is beyond every legal fresh-shot firing line; a new gun cannot hit it directly."
      : threat.rescueCol !== null
        ? `A gun at tile ${threat.rescueCol + 1} can engage it; check credits and armor.`
        : `No empty firing tile remains to its left. Salvage an occupied forward tile to make room, or prepare for a breach.`;
  return `A hostile has passed tile ${col + 1}'s firing line. ${recovery} Deployment is still allowed for later arrivals.`;
}

export function threatAdvice(threat: LaneThreat): string {
  return threat.rescueCol !== null
    ? `L${threat.row + 1}: hostile past guns. A gun at tile ${threat.rescueCol + 1} can engage; check credits and armor.`
    : threat.recoveryCol !== null
      ? `L${threat.row + 1}: hostile past guns; no empty firing tile to its left. Salvage an occupied forward tile to make room, or prepare for a breach.`
      : `L${threat.row + 1}: hostile beyond every legal fresh-shot firing line. New guns cannot hit it directly. In-flight shots or splash may still help. Salvaging a blocker lets it advance, risking a shield.`;
}
