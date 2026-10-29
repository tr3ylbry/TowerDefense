import { AMMO, ENEMIES, MAPS, TOWERS } from "./game/content";
import type { MapKind, EnemyKind, TowerKind } from "./game/content";
import { EXPEDITION_ENEMIES, EXPEDITION_TOWERS } from "./game/art";
export type ArtStyle = "expedition" | "original";
export interface ImageAsset {
  key: string;
  file: string;
}
export interface SpriteAsset extends ImageAsset {
  frameWidth: number;
  frameHeight: number;
  frames: number;
  fps: number;
}
export interface ArtManifest {
  backgrounds: ImageAsset[];
  images: ImageAsset[];
  sprites: SpriteAsset[];
}
export interface AssetPlan {
  images: ImageAsset[];
  sprites: SpriteAsset[];
}
export function backgroundKey(map: MapKind, style: ArtStyle): string {
  return map === "canyon" && style === "expedition"
    ? "expedition-canyon"
    : MAPS[map].background;
}
/** Only the selected environment/style is needed to play. Texture keys form the cache. */
export function assetsFor(
  art: ArtManifest,
  map: MapKind,
  style: ArtStyle,
): AssetPlan {
  const images: ImageAsset[] = [],
    sprites: SpriteAsset[] = [];
  const image = (key: string) => {
    const found = art.images.find((x) => x.key === key);
    if (!found) throw Error(`Missing image: ${key}`);
    images.push(found);
  };
  const legacy = (key: string, required = true) => {
    const found = art.sprites.find((x) => x.key === key);
    if (found) sprites.push(found);
    else if (required) throw Error(`Missing animation: ${key}`);
  };
  if (map === "canyon" && style === "expedition")
    images.push({ key: "expedition-canyon", file: "expedition/canyon.webp" });
  else {
    const background = art.backgrounds.find(
      (x) => x.key === MAPS[map].background,
    );
    if (!background) throw Error("Missing environment");
    images.push(background);
  }
  for (const ammo of Object.values(AMMO)) image(ammo.sprite);
  if (map !== "canyon") image("acid-pool");
  for (const [kind, tower] of Object.entries(TOWERS)) {
    const cutout =
      style === "expedition" ? EXPEDITION_TOWERS[kind as TowerKind] : undefined;
    if (cutout) images.push(cutout);
    else {
      legacy(`${tower.sprite}-idle`);
      legacy(`${tower.sprite}-fire`, false);
    }
  }
  for (const [kind, enemy] of Object.entries(ENEMIES)) {
    const cutout =
      style === "expedition"
        ? EXPEDITION_ENEMIES[kind as EnemyKind]
        : undefined;
    if (cutout) images.push(cutout);
    else
      for (const action of ["walk", "attack", "die"])
        legacy(`${enemy.sprite}-${action}`);
  }
  return {
    images: [...new Map(images.map((x) => [x.key, x])).values()],
    sprites: [...new Map(sprites.map((x) => [x.key, x])).values()],
  };
}
