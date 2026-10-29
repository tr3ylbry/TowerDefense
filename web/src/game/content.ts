export const ROWS = 6;
export const COLS = 9;
export const STEP = 0.05;
export type TowerKind = "astro" | "bush" | "wall" | "zeus";
export type EnemyKind = "scout" | "grunt" | "brute";

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
  },
} as const;

export const ENEMIES = {
  scout: {
    name: "Scout",
    health: 100,
    speed: 0.28,
    damage: 18,
    cooldown: 1,
    reward: 10,
    sprite: "little-green-man",
  },
  grunt: {
    name: "Grunt",
    health: 230,
    speed: 0.2,
    damage: 32,
    cooldown: 1.1,
    reward: 15,
    sprite: "grunt",
  },
  brute: {
    name: "Armored grunt",
    health: 440,
    speed: 0.16,
    damage: 44,
    cooldown: 1.2,
    reward: 25,
    sprite: "grunt",
  },
} as const;

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

export const WAVES: readonly Wave[] = [
  {
    start: 7,
    title: "First contact",
    enemies: ["scout", "scout", "scout", "scout", "scout", "scout"],
  },
  {
    start: 33,
    title: "Incoming company",
    enemies: [
      "scout",
      "grunt",
      "scout",
      "grunt",
      "scout",
      "grunt",
      "scout",
      "scout",
    ],
  },
  {
    start: 65,
    title: "Heavy footsteps",
    enemies: [
      "grunt",
      "scout",
      "brute",
      "scout",
      "grunt",
      "scout",
      "grunt",
      "scout",
      "grunt",
    ],
  },
  {
    start: 101,
    title: "The last stand",
    enemies: [
      "grunt",
      "brute",
      "scout",
      "grunt",
      "scout",
      "brute",
      "grunt",
      "scout",
      "grunt",
      "brute",
    ],
  },
];

export function makeSpawns(seed: number): Spawn[] {
  let value = seed >>> 0;
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
  return WAVES.flatMap((wave, index) => {
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
