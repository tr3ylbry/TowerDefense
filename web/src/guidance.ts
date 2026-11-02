import { ROWS, TOWERS } from "./game/content";
import type { TowerKind } from "./game/content";
import type { Snapshot } from "./game/simulation";
import { laneThreats, placementWarning } from "./game/threats";
export function coverage(state: Snapshot): string {
  const covered = new Set(
    state.towers
      .filter((x) => x.health > 0 && TOWERS[x.kind].damage > 0)
      .map((x) => x.row),
  );
  const missing = Array.from({ length: ROWS }, (_, row) => row).filter(
    (row) => !covered.has(row),
  );
  const threats = laneThreats(state);
  const passed = threats.filter((t) => t.passed);
  if (passed.length)
    return `${covered.size}/6 lanes armed · Past guns: ${passed.map((t) => `L${t.row + 1}`).join(", ")}`;
  return missing.length
    ? `${covered.size}/6 lanes armed · Cover ${missing.map((row) => `L${row + 1}`).join(", ")}`
    : threats.length
      ? `6/6 lanes armed · ${threats.filter((t) => t.engaged).length}/${threats.length} nearest threats in firing lines`
      : "6/6 lanes armed · Your crew fires right";
}

/** Presentation only: eligibility, reward and the changed schedule come from the simulation. */
export function waveCallDetails(state: Snapshot): [string, string] {
  const next = state.nextWave;
  if (!next?.canLaunch) return ["", next?.reason ?? "No further wave to call."];
  const surviving = state.enemies.filter((e) => e.health > 0).length;
  return [
    `Call available · Wait ${Math.ceil(Math.max(0, next.startAt - state.elapsed))}s, or call: 3s lead (~${Math.round(next.secondsSaved)}s sooner).`,
    surviving
      ? `${surviving} still on field: incoming hostiles will overlap survivors. Later waves shift too.`
      : "Field clear. Keep preparing or call early. Later waves shift too.",
  ];
}
export interface CrewDetails {
  title: string;
  description: string;
  status: string;
  stats: [label: string, value: string][];
}

/** Structured presentation only; prices, timing and warnings remain authoritative. */
export function crewDetails(
  kind: TowerKind | "salvage" | null,
  state: Snapshot,
  cursor: { row: number; col: number } | null,
): CrewDetails {
  if (kind === "salvage") {
    const tower = cursor && state.towers.find(
      (x) => x.row === cursor.row && x.col === cursor.col,
    );
    return {
      title: "Salvage",
      description: "Choose a deployed defender; removing it opens that tile.",
      status: tower
        ? `Refund ${Math.floor(TOWERS[tower.kind].cost * 0.4)} credits for ${TOWERS[tower.kind].name}`
        : "Point to or focus a defender to preview the exact refund.",
      stats: tower ? [
        ["Defender", TOWERS[tower.kind].name],
        ["Health", String(Math.ceil(tower.health))],
        ["Refund", `${Math.floor(TOWERS[tower.kind].cost * 0.4)} credits`],
      ] : [["Refund rate", "40% of purchase price"]],
    };
  }
  if (!kind) return {
    title: "Choose a defender",
    description: "Select a crew card or use keys 1–9.",
    status: "Firing defenders cover a lane; income units and barriers do not shoot.",
    stats: [],
  };
  const unit = TOWERS[kind];
  const gap = Math.max(0, unit.cost - state.credits);
  const installed = cursor && state.towers.find(
    (x) => x.row === cursor.row && x.col === cursor.col && x.kind === kind,
  );
  const stats: CrewDetails["stats"] = [
    ["Cost", `${unit.cost} credits`],
    ["Health", String(unit.health)],
    ["Role", unit.role],
  ];
  if (unit.income) stats.push(
    ["Income", `+${unit.income} every ${unit.incomeInterval}s`],
    ["Gross payback", `${Math.ceil(unit.cost / unit.income) * unit.incomeInterval}s`],
    ["Position", "Protect behind guns"],
  );
  else if (unit.damage) {
    stats.push(
      ["Damage", `${unit.damage} per round`],
      ["Firing cycle", `${unit.cooldown}s`],
      ["Plating bypass", `${Math.round(unit.armorPierce * 100)}%`],
      ["Direction", "Fires right"],
    );
    if (unit.ammo.length > 1) stats.push(["Volley", `${unit.ammo.length} rounds`]);
    if (unit.splashRadius) stats.push(["Splash radius", `${unit.splashRadius} tiles`]);
  } else stats.push(["Position", "Put ahead of firing defenders"]);
  const caution = cursor && placementWarning(kind, state, cursor.row, cursor.col);
  return {
    title: unit.name,
    description: unit.description,
    status: caution ?? (gap ? `Need ${gap} more credits` : installed && unit.income
      ? `Next +${unit.income} in ${Math.ceil(unit.incomeInterval - installed.incomeClock - 1e-9)}s`
      : "Ready to deploy"),
    stats,
  };
}
