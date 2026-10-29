import { ROWS, TOWERS } from "./game/content";
import type { TowerKind } from "./game/content";
import type { Snapshot } from "./game/simulation";
export function coverage(state: Snapshot): string {
  const covered = new Set(
    state.towers.filter((x) => TOWERS[x.kind].damage > 0).map((x) => x.row),
  );
  const missing = Array.from({ length: ROWS }, (_, row) => row).filter(
    (row) => !covered.has(row),
  );
  return missing.length
    ? `${covered.size}/6 lanes firing · Cover ${missing.map((row) => `L${row + 1}`).join(", ")}`
    : "6/6 lanes firing · Your crew fires right";
}
export function crewDetails(
  kind: TowerKind | "salvage" | null,
  state: Snapshot,
  cursor: { row: number; col: number } | null,
): [string, string, string] {
  if (kind === "salvage") {
    const tower =
      cursor &&
      state.towers.find((x) => x.row === cursor.row && x.col === cursor.col);
    return [
      "Salvage · 40% refund",
      "Choose a deployed defender; removing it opens that tile.",
      tower
        ? `${TOWERS[tower.kind].name} · ${Math.ceil(tower.health)} health · Refund ${Math.floor(TOWERS[tower.kind].cost * 0.4)} credits`
        : "Point to or focus a defender to preview the exact refund.",
    ];
  }
  if (!kind)
    return [
      "Choose a defender",
      "Select a crew card or use keys 1–9.",
      "Firing defenders cover a lane; income units and barriers do not shoot.",
    ];
  const unit = TOWERS[kind];
  const gap = Math.max(0, unit.cost - state.credits);
  const budget = gap ? `Need ${gap} more credits` : "Ready to deploy";
  const installed =
    cursor &&
    state.towers.find(
      (x) => x.row === cursor.row && x.col === cursor.col && x.kind === kind,
    );
  const role = unit.income
    ? installed
      ? `Next +${unit.income} in ${Math.ceil(unit.incomeInterval - installed.incomeClock - 1e-9)}s`
      : `Gross payback ${Math.ceil(unit.cost / unit.income) * unit.incomeInterval}s · Protect behind guns`
    : unit.damage
      ? `${Math.round(unit.armorPierce * 100)}% plating bypass · Fires right`
      : "Barrier · Put ahead of firing defenders";
  return [
    `${unit.name} · ${unit.cost} credits`,
    unit.description,
    `${budget} · ${unit.health} health · ${role}`,
  ];
}
