import type { EnemyKind, MapKind, TowerKind } from "./content";
import { DEFENDER_DELIVERY } from "./defender-delivery";

export interface ExpeditionArt {
  key: string;
  file: string;
  width: number;
  height: number;
  foot: number;
}

// Proportional WebP derivatives; foot anchors come from alpha >= 32 bounds.
function cutout(
  name: string,
  width: number,
  pixelsWide: number,
  pixelsHigh: number,
  foot: number,
): ExpeditionArt {
  return {
    key: `expedition-${name}`,
    file: `expedition/${name}.webp`,
    width,
    height: (width * pixelsHigh) / pixelsWide,
    foot,
  };
}
function defender(name: keyof typeof DEFENDER_DELIVERY, width: number): ExpeditionArt {
  const { size, foot } = DEFENDER_DELIVERY[name];
  return cutout(name, width, size[0], size[1], foot);
}
export const EXPEDITION_TOWERS: Record<TowerKind, ExpeditionArt> = {
  astro: defender("ranger", 80),
  bush: defender("money-bush", 68),
  wall: defender("asteroid", 82),
  zeus: defender("moon-zeus", 90),
  explosive: defender("explosive-astro-joe", 86),
  startrell: defender("startrell-cluggins", 78),
  tars: defender("tars", 67),
  tree: defender("money-tree", 70),
  falcon: defender("frontier-flagship-compact", 96),
};
export const EXPEDITION_ENEMIES: Record<EnemyKind, ExpeditionArt> = {
  scout: cutout("scout", 66, 384, 320, 294 / 320),
  grunt: cutout("grunt", 86, 384, 319, 298 / 319),
  sprinter: cutout("sprinter", 102, 384, 256, 233 / 256),
  manhunter: cutout("manhunter", 96, 384, 351, 344 / 351),
  tank: cutout("plated-crawler", 108, 384, 256, 225 / 256),
  gargantua: cutout("gargantua", 122, 384, 280, 273 / 280),
};
export const EXPEDITION_ENVIRONMENTS: Record<
  MapKind,
  { key: string; file: string; zoom: number }
> = {
  canyon: {
    key: "expedition-canyon",
    file: "expedition/canyon-0.5.webp",
    zoom: 1,
  },
  // Register the perimeter rails outside the playable ground, without changing the grid.
  bridge: {
    key: "expedition-bridge",
    file: "expedition/sky-bridge.webp",
    zoom: 1.3,
  },
  nest: { key: "expedition-nest", file: "expedition/nest.webp", zoom: 1 },
};
export const EXPEDITION_ACID = {
  key: "expedition-acid-pool",
  file: "expedition/acid-pool.webp",
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
    backgroundAlpha: 0.85,
    shadeAlpha: 0.2,
  },
  nest: {
    accent: 0xc7a2da,
    shadow: 0x2b1e40,
    backgroundAlpha: 0.85,
    shadeAlpha: 0.2,
  },
} as const;
