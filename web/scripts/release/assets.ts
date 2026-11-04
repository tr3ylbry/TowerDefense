import { assetsFor } from "../../src/assets";
import { EXPEDITION_ENEMIES } from "../../src/game/art";
import { EXPEDITION_PROJECTILES } from "../../src/game/projectile-art";
import type { ArtManifest } from "../../src/assets";

/** Shared by packaging and verification. No directory/glob based asset approval. */
export const releaseManifest: ArtManifest = {
  backgrounds: [],
  images: Object.values(EXPEDITION_PROJECTILES),
  sprites: [],
};
export function releaseFiles(): string[] {
  const plans = (["canyon", "bridge", "nest"] as const).map(map =>
    assetsFor(releaseManifest, map, "expedition"),
  );
  return [...new Set([
    "favicon.svg", "THIRD_PARTY_NOTICES.txt", "CREDITS.txt", "audio/orbital-drift.wav",
    ...plans.flatMap(plan => [...plan.images, ...plan.sprites].map(asset => `art/${asset.file}`)),
    ...Object.values(EXPEDITION_ENEMIES).map(asset => `art/${asset.file}`),
  ])].sort();
}
