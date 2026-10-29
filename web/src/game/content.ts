export const ROWS = 6;
export const COLS = 9;
export const STEP = 0.05;

export const AMMO = {
  astro: { sprite: "projectile-astro-joe-ammo", speed: 7 },
  explosive: { sprite: "projectile-explosive-astro-joe-ammo", speed: 6 },
  startrell: { sprite: "projectile-startrell-cluggins-ammo", speed: 12 },
  tars: { sprite: "projectile-tars-ammo", speed: 8 },
  zeus: { sprite: "projectile-moon-zeus-ammo", speed: 7 },
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
    income: 0,
    incomeInterval: 6,
    sprite: "asteroid",
    ammo: [],
    splashRadius: 0,
  },
  zeus: {
    name: "Moon Zeus",
    role: "Heavy support",
    description: "Heavy plasma with a small blast radius.",
    cost: 125,
    health: 320,
    damage: 65,
    cooldown: 1.5,
    income: 0,
    incomeInterval: 6,
    sprite: "moon-zeus",
    ammo: ["zeus"],
    splashRadius: 0.7,
  },
  explosive: {
    name: "Explosive Astro Joe",
    role: "Demolitions",
    description: "Slower shells hit a wide cluster in one lane.",
    cost: 85,
    health: 350,
    damage: 45,
    cooldown: 1.7,
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
    cooldown: 0.3,
    income: 0,
    incomeInterval: 6,
    sprite: "startrell-cluggins",
    ammo: ["startrell"],
    splashRadius: 0,
  },
  tars: {
    name: "TARS",
    role: "Assault robot",
    description: "A sturdy shooter with a hard-hitting round.",
    cost: 100,
    health: 450,
    damage: 48,
    cooldown: 0.95,
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
    income: 60,
    incomeInterval: 8,
    sprite: "money-tree",
    ammo: [],
    splashRadius: 0,
  },
  falcon: {
    name: "Millennium Falcon",
    role: "Flagship",
    description: "Three powerful rounds per volley. One lane.",
    cost: 250,
    health: 1200,
    damage: 70,
    cooldown: 1.4,
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
    description: "Slow, massive health. Concentrate fire behind a barrier.",
    health: 850,
    speed: 0.12,
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
}
interface MissionDefinition {
  name: string;
  number: string;
  tag: string;
  description: string;
  background: string;
  blocked: readonly (readonly number[])[];
  waves: readonly Wave[];
}

// Restricted cells are copied from the Java Controller's zero-based map coordinates.
// The original duplicate column in The Nest's last row is represented once.
export const MAPS = {
  canyon: {
    name: "The Canyon",
    number: "01",
    tag: "FIRST CONTACT",
    description:
      "Open terrain. Build a foundation, then face the entire alien roster.",
    background: "stage-one",
    blocked: [[], [], [], [], [], []],
    waves: [
      {
        start: 7,
        title: "First contact",
        enemies: ["scout", "scout", "scout", "scout", "scout", "scout"],
      },
      {
        start: 36,
        title: "Fast company",
        enemies: [
          "scout",
          "grunt",
          "sprinter",
          "grunt",
          "scout",
          "sprinter",
          "scout",
          "grunt",
        ],
      },
      {
        start: 72,
        title: "Heavy footsteps",
        enemies: [
          "grunt",
          "manhunter",
          "tank",
          "scout",
          "grunt",
          "sprinter",
          "grunt",
          "scout",
          "manhunter",
        ],
      },
      {
        start: 112,
        title: "The last stand",
        enemies: [
          "grunt",
          "tank",
          "sprinter",
          "manhunter",
          "scout",
          "gargantua",
          "grunt",
          "sprinter",
          "grunt",
          "manhunter",
        ],
      },
    ],
  },
  bridge: {
    name: "Sky Bridge",
    number: "02",
    tag: "BROKEN GROUND",
    description:
      "Twelve acid pools divide the bridge. Defenders cannot deploy on them; aliens cross freely.",
    background: "stage-two",
    blocked: [
      [3, 4],
      [4, 5],
      [4, 5],
      [3, 4],
      [5, 6],
      [3, 4],
    ],
    waves: [
      {
        start: 10,
        title: "Across the divide",
        enemies: ["scout", "scout", "scout", "grunt", "scout", "scout"],
      },
      {
        start: 42,
        title: "Bridge runners",
        enemies: [
          "sprinter",
          "grunt",
          "sprinter",
          "scout",
          "grunt",
          "manhunter",
          "scout",
          "sprinter",
        ],
      },
      {
        start: 82,
        title: "Heavy crossing",
        enemies: [
          "tank",
          "grunt",
          "manhunter",
          "sprinter",
          "grunt",
          "tank",
          "scout",
          "manhunter",
          "grunt",
          "sprinter",
        ],
      },
      {
        start: 126,
        title: "Hold the bridge",
        enemies: [
          "gargantua",
          "sprinter",
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
          "grunt",
          "tank",
          "manhunter",
          "scout",
          "grunt",
          "sprinter",
        ],
      },
    ],
  },
  nest: {
    name: "The Nest",
    number: "03",
    tag: "HOSTILE TERRITORY",
    description:
      "Sixteen acid pools scatter your formation. Leave room for income and heavy support.",
    background: "stage-three",
    blocked: [
      [1, 3, 6],
      [1, 4, 7],
      [1, 2, 5],
      [1, 4],
      [1, 3, 6],
      [1, 4],
    ],
    waves: [
      {
        start: 12,
        title: "Into the nest",
        enemies: ["scout", "grunt", "scout", "scout", "grunt", "scout"],
      },
      {
        start: 46,
        title: "The swarm wakes",
        enemies: [
          "sprinter",
          "manhunter",
          "grunt",
          "sprinter",
          "scout",
          "grunt",
          "sprinter",
          "manhunter",
          "scout",
        ],
      },
      {
        start: 90,
        title: "The inner guard",
        enemies: [
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
          "tank",
          "grunt",
          "manhunter",
          "sprinter",
          "grunt",
          "tank",
          "scout",
        ],
      },
      {
        start: 136,
        title: "Heart of the swarm",
        enemies: [
          "gargantua",
          "tank",
          "sprinter",
          "manhunter",
          "grunt",
          "gargantua",
          "sprinter",
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
          "manhunter",
        ],
      },
    ],
  },
} as const satisfies Record<string, MissionDefinition>;
export type MapKind = keyof typeof MAPS;

export function isBlocked(map: MapKind, row: number, col: number): boolean {
  const blocked: readonly (readonly number[])[] = MAPS[map].blocked;
  return blocked[row]?.includes(col) ?? false;
}

export function makeSpawns(seed: number, map: MapKind = "canyon"): Spawn[] {
  let value = seed >>> 0;
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
  return MAPS[map].waves.flatMap((wave, index) => {
    const lanes = Array.from({ length: ROWS }, (_, row) => row);
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    return wave.enemies.map((kind, i) => ({
      at: wave.start + i * 1.8,
      row: lanes[i % ROWS],
      kind,
      wave: index + 1,
    }));
  });
}
