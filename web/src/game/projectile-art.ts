import type { AmmoKind } from "./content";

/** Presentation only. Simulation AMMO values and the 27×27 world footprint stay unchanged. */
export const EXPEDITION_PROJECTILES: Record<AmmoKind, { key: string; file: string }> = {
  astro: { key: "expedition-projectile-astro", file: "expedition/projectiles/astro.svg" },
  explosive: { key: "expedition-projectile-explosive", file: "expedition/projectiles/explosive.svg" },
  startrell: { key: "expedition-projectile-startrell", file: "expedition/projectiles/startrell.svg" },
  tars: { key: "expedition-projectile-tars", file: "expedition/projectiles/tars.svg" },
  zeus: { key: "expedition-projectile-zeus", file: "expedition/projectiles/zeus.svg" },
};
