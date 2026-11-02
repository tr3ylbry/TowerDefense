import { ENEMIES, STEP } from "./content";
import type { EnemyKind } from "./content";
import type { Enemy } from "./simulation";

/** Baked joint poses; the renderer owns no locomotion or combat clock. */
export const SPRINTER_ANIMATION = {
  key: "expedition-sprinter-animation",
  file: "expedition/sprinter-animation.webp",
  frameWidth: 160,
  frameHeight: 120,
  frames: 48,
  fps: 0, // Explicit pose selection, never Phaser's wall-clock animation player.
  width: 128,
  height: 96,
  foot: 0.875,
} as const;
export const GARGANTUA_ANIMATION = {
  key: "expedition-gargantua-animation",
  file: "expedition/gargantua-animation.webp",
  frameWidth: 160,
  frameHeight: 120,
  frames: 40,
  fps: 0,
  width: 144,
  height: 108,
  foot: 107 / 120,
} as const;

export const ALIEN_ANIMATIONS = {
  sprinter: SPRINTER_ANIMATION,
  gargantua: GARGANTUA_ANIMATION,
} as const;
export type AnimatedAlien = keyof typeof ALIEN_ANIMATIONS;
const POSES = {
  sprinter: { walk: 24, idle: 24, attack: 32, stride: 48, idleSeconds: 2.4 },
  gargantua: { walk: 16, idle: 16, attack: 24, stride: 28, idleSeconds: 3.2 },
} as const;

export function isAnimatedAlien(kind: EnemyKind): kind is AnimatedAlien {
  return kind in ALIEN_ANIMATIONS;
}

export type AlienPose = "walk" | "idle" | "attack";
const cycle = (value: number) => ((value % 1) + 1) % 1;

export function alienPose(
  kind: AnimatedAlien,
  enemy: Pick<Enemy, "id" | "x" | "previousX" | "attacking" | "cooldown">,
  elapsed: number,
  interpolation: number,
  reducedMotion: boolean,
): { state: AlienPose; frame: number } {
  const layout = POSES[kind];
  const alpha = Math.max(0, Math.min(1, interpolation));
  if (enemy.attacking) {
    // A cooldown reset IS the damage/contact instant. Recover afterwards and
    // anticipate only the next strike; never predict damage before its tick.
    const duration = ENEMIES[kind].cooldown;
    const age = duration - Math.max(0, enemy.cooldown - alpha * STEP);
    return {
      state: "attack",
      frame:
        layout.attack +
        (reducedMotion ? 0 : Math.min(15, Math.floor((age / duration) * 16))),
    };
  }
  if (enemy.x !== enemy.previousX) {
    const x = enemy.previousX + (enemy.x - enemy.previousX) * alpha;
    // Each rig's planted foot path cancels the same authoritative world motion.
    const phase = cycle((-x * 100) / layout.stride + enemy.id * 0.37);
    return {
      state: "walk",
      frame: reducedMotion
        ? Math.floor(layout.walk / 4)
        : Math.floor(phase * layout.walk),
    };
  }
  return {
    state: "idle",
    frame:
      layout.idle +
      (reducedMotion
        ? 0
        : Math.floor(cycle((elapsed + alpha * STEP) / layout.idleSeconds) * 8)),
  };
}

/** Compatibility entry point for the accepted Sprinter pilot and its fixtures. */
export function sprinterPose(
  enemy: Parameters<typeof alienPose>[1],
  elapsed: number,
  interpolation: number,
  reducedMotion: boolean,
) {
  return alienPose("sprinter", enemy, elapsed, interpolation, reducedMotion);
}

/** Contact cue uses the same cooldown reset as damage, never its late tail. */
export function attackContact(
  kind: EnemyKind,
  cooldown: number,
  interpolation: number,
): number {
  const age =
    ENEMIES[kind].cooldown -
    Math.max(0, cooldown - Math.max(0, Math.min(1, interpolation)) * STEP);
  return Math.max(0, 1 - age / 0.18);
}
