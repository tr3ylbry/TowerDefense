import { ENVIRONMENTS, ROWS, COLS } from "./environments";
import type { MapKind } from "./environments";
import { MISSIONS, STANDALONE_MISSIONS } from "./missions";
import type { MissionId } from "./missions";
export { ROWS, COLS };
export type { MapKind };
export const STEP = 0.05;

export const AMMO = {
  astro: { sprite: "projectile-astro-joe-ammo", speed: 7, color: 0xf5c18e },
  explosive: {
    sprite: "projectile-explosive-astro-joe-ammo",
    speed: 6,
    color: 0xefa181,
  },
  startrell: {
    sprite: "projectile-startrell-cluggins-ammo",
    speed: 12,
    color: 0xb6e6c8,
  },
  tars: { sprite: "projectile-tars-ammo", speed: 8, color: 0xbadce8 },
  zeus: { sprite: "projectile-moon-zeus-ammo", speed: 7, color: 0xaadfea },
} as const;
export type AmmoKind = keyof typeof AMMO;

interface TowerDefinition {
  name: string;
  role: string;
  description: string;
  cost: number;
  health: number;
  damage: number;
  cooldown: number;
  windup: number;
  armorPierce: number;
  income: number;
  incomeInterval: number;
  sprite: string;
  ammo: readonly AmmoKind[];
  splashRadius: number;
}

// Browser balance keeps the original roster's roles, with cooldowns measured in seconds.
export const TOWERS = {
  astro: {
    name: "Astro Joe",
    role: "Ballistics",
    description: "Steady fire. Your first line of defense.",
    cost: 50,
    health: 260,
    damage: 26,
    cooldown: 0.85,
    windup: 0.1,
    armorPierce: 0,
    income: 0,
    incomeInterval: 6,
    sprite: "astro-joe",
    ammo: ["astro"],
    splashRadius: 0,
  },
  bush: {
    name: "Money Bush",
    role: "Economy",
    description: "Generates 25 credits every 6 seconds.",
    cost: 60,
    health: 180,
    damage: 0,
    cooldown: 1,
    windup: 0,
    armorPierce: 0,
    income: 25,
    incomeInterval: 6,
    sprite: "money-bush",
    ammo: [],
    splashRadius: 0,
  },
  wall: {
    name: "Asteroid",
    role: "Fortification",
    description: "A durable barrier that buys you time.",
    cost: 35,
    health: 1100,
    damage: 0,
    cooldown: 1,
    windup: 0,
    armorPierce: 0,
    income: 0,
    incomeInterval: 6,
    sprite: "asteroid",
    ammo: [],
    splashRadius: 0,
  },
  zeus: {
    name: "Moon Zeus",
    role: "Heavy support",
    description: "Plasma partially pierces plating and hits nearby aliens.",
    cost: 125,
    health: 320,
    damage: 65,
    cooldown: 1.5,
    windup: 0.2,
    armorPierce: 0.65,
    income: 0,
    incomeInterval: 6,
    sprite: "moon-zeus",
    ammo: ["zeus"],
    splashRadius: 0.7,
  },
  explosive: {
    name: "Astro Joe X",
    role: "Demolitions",
    description: "Shells partially pierce plating and hit a wide cluster.",
    cost: 85,
    health: 350,
    damage: 45,
    cooldown: 1.7,
    windup: 0.15,
    armorPierce: 0.4,
    income: 0,
    incomeInterval: 6,
    sprite: "explosive-astro-joe",
    ammo: ["explosive"],
    splashRadius: 1,
  },
  startrell: {
    name: "Startrell Cluggins",
    role: "Rapid fire",
    description: "Light, fast shots keep sprinters in check.",
    cost: 75,
    health: 300,
    damage: 12,
    cooldown: 0.25,
    windup: 0.05,
    armorPierce: 0,
    income: 0,
    incomeInterval: 6,
    sprite: "startrell-cluggins",
    ammo: ["startrell"],
    splashRadius: 0,
  },
  tars: {
    name: "TARS",
    role: "Armor piercing",
    description: "Piercing rounds ignore Tank plating.",
    cost: 100,
    health: 450,
    damage: 48,
    cooldown: 0.95,
    windup: 0.15,
    armorPierce: 1,
    income: 0,
    incomeInterval: 6,
    sprite: "tars",
    ammo: ["tars"],
    splashRadius: 0,
  },
  tree: {
    name: "Money Tree",
    role: "Advanced economy",
    description: "Generates 60 credits every 8 seconds.",
    cost: 150,
    health: 220,
    damage: 0,
    cooldown: 1,
    windup: 0,
    armorPierce: 0,
    income: 60,
    incomeInterval: 8,
    sprite: "money-tree",
    ammo: [],
    splashRadius: 0,
  },
  falcon: {
    name: "Frontier Flagship",
    role: "Flagship",
    description: "Three piercing rounds per volley. One lane.",
    cost: 250,
    health: 1200,
    damage: 70,
    cooldown: 1.4,
    windup: 0.25,
    armorPierce: 0.75,
    income: 0,
    incomeInterval: 6,
    sprite: "millennium-falcon",
    ammo: ["zeus", "tars", "explosive"],
    splashRadius: 0,
  },
} as const satisfies Record<string, TowerDefinition>;
export type TowerKind = keyof typeof TOWERS;

export const ENEMIES = {
  scout: {
    name: "Little Green Men",
    description: "Light scouts. A single Astro Joe can hold them off.",
    armor: 0,
    health: 100,
    speed: 0.28,
    damage: 18,
    cooldown: 1,
    reward: 10,
    sprite: "little-green-man",
    size: 92,
  },
  grunt: {
    name: "Grunt",
    description: "Steady infantry with more health and a stronger bite.",
    armor: 0,
    health: 230,
    speed: 0.2,
    damage: 32,
    cooldown: 1.1,
    reward: 15,
    sprite: "grunt",
    size: 92,
  },
  sprinter: {
    name: "Sprinter",
    description: "Fast and fragile. Cover every lane before it arrives.",
    armor: 0,
    health: 140,
    speed: 0.43,
    damage: 22,
    cooldown: 0.75,
    reward: 15,
    sprite: "sprinter",
    size: 92,
  },
  manhunter: {
    name: "ManHunter",
    description: "A mobile bruiser that tears through exposed defenders.",
    armor: 0,
    health: 330,
    speed: 0.3,
    damage: 65,
    cooldown: 0.9,
    reward: 25,
    sprite: "manhunter",
    size: 100,
  },
  tank: {
    name: "Tank",
    description:
      "Plating absorbs 80% of ordinary fire. TARS ignores it; plasma and explosives partially pierce it.",
    armor: 0.8,
    health: 650,
    speed: 0.26,
    damage: 20,
    cooldown: 1.5,
    reward: 35,
    sprite: "tank",
    size: 108,
  },
  gargantua: {
    name: "Gargantua",
    description:
      "The heaviest invader. Bring sustained fire and a strong economy.",
    armor: 0,
    health: 1200,
    speed: 0.18,
    damage: 100,
    cooldown: 1.2,
    reward: 60,
    sprite: "gargantua",
    size: 112,
  },
} as const;
export type EnemyKind = keyof typeof ENEMIES;

export interface Spawn {
  at: number;
  row: number;
  kind: EnemyKind;
  wave: number;
}
export interface Wave {
  start: number;
  title: string;
  enemies: readonly EnemyKind[];
  entries?: readonly { offset: number; laneSlot: number }[];
  briefing?: string;
}
/** Compatibility view for original standalone callers; terrain and waves each have one source. */
export const MAPS = {
  canyon: {
    ...ENVIRONMENTS.canyon,
    waves: MISSIONS[STANDALONE_MISSIONS.canyon].waves,
  },
  bridge: {
    ...ENVIRONMENTS.bridge,
    waves: MISSIONS[STANDALONE_MISSIONS.bridge].waves,
  },
  nest: {
    ...ENVIRONMENTS.nest,
    waves: MISSIONS[STANDALONE_MISSIONS.nest].waves,
  },
} as const;

export function isBlocked(map: MapKind, row: number, col: number): boolean {
  const blocked: readonly (readonly number[])[] = MAPS[map].blocked;
  return blocked[row]?.includes(col) ?? false;
}

export function makeSpawns(seed: number, map: MapKind = "canyon"): Spawn[] {
  return makeMissionSpawns(seed, STANDALONE_MISSIONS[map]);
}

export function makeMissionSpawns(
  seed: number,
  mission: MissionId,
  waves: readonly Wave[] = MISSIONS[mission].waves,
): Spawn[] {
  let value = seed >>> 0;
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
  return waves.flatMap((wave, index) => {
    const lanes = Array.from({ length: ROWS }, (_, row) => row);
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    const entries = (wave as Wave).entries;
    return wave.enemies.map((kind, i) => ({
      at: wave.start + (entries?.[i].offset ?? i * 1.8),
      row: lanes[entries?.[i].laneSlot ?? i % ROWS],
      kind,
      wave: index + 1,
    }));
  });
}
