import type { EnemyKind, TowerKind } from "./content";

export interface ExpeditionArt {
  key: string;
  file: string;
  width: number;
  height: number;
  foot: number;
}

// Static cutouts share a foot anchor; motion is procedural and never controls rules.
export const EXPEDITION_TOWERS: Partial<Record<TowerKind, ExpeditionArt>> = {
  tars: {
    key: "expedition-tars",
    file: "expedition/tars.png",
    width: 67,
    height: 76,
    foot: 0.957,
  },
  astro: {
    key: "expedition-ranger",
    file: "expedition/ranger.png",
    width: 80,
    height: 74,
    foot: 0.983,
  },
};
export const EXPEDITION_ENEMIES: Partial<Record<EnemyKind, ExpeditionArt>> = {
  sprinter: {
    key: "expedition-sprinter",
    file: "expedition/sprinter.png",
    width: 102,
    height: 67.9336,
    foot: 310 / 341,
  },
  manhunter: {
    key: "expedition-manhunter",
    file: "expedition/manhunter.png",
    width: 96,
    height: 87.75,
    foot: 459 / 468,
  },
  gargantua: {
    key: "expedition-gargantua",
    file: "expedition/gargantua.png",
    width: 122,
    height: 88.8789,
    foot: 363 / 373,
  },
  scout: {
    key: "expedition-scout",
    file: "expedition/scout.png",
    width: 66,
    height: 55,
    foot: 0.925,
  },
  grunt: {
    key: "expedition-grunt",
    file: "expedition/grunt.png",
    width: 86,
    height: 71.4,
    foot: 0.94,
  },
  tank: {
    key: "expedition-plated-crawler",
    file: "expedition/plated-crawler.png",
    width: 108,
    height: 72,
    foot: 0.88,
  },
};

export const BIOMES = {
  canyon: {
    accent: 0xe4ad7c,
    shadow: 0x102330,
    backgroundAlpha: 0.85,
    shadeAlpha: 0.2,
  },
  bridge: {
    accent: 0x91d7e0,
    shadow: 0x122d43,
    backgroundAlpha: 0.5,
    shadeAlpha: 0.25,
  },
  nest: {
    accent: 0xc7a2da,
    shadow: 0x2b1e40,
    backgroundAlpha: 0.48,
    shadeAlpha: 0.3,
  },
} as const;
