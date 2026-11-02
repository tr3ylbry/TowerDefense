import { ENEMIES, STEP } from "./content";
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
export type AlienPose = "walk" | "idle" | "attack";
const cycle = (value: number) => ((value % 1) + 1) % 1;

export function sprinterPose(
  enemy: Pick<Enemy, "id" | "x" | "previousX" | "attacking" | "cooldown">,
  elapsed: number,
  interpolation: number,
  reducedMotion: boolean,
): { state: AlienPose; frame: number } {
  const alpha = Math.max(0, Math.min(1, interpolation));
  if (enemy.attacking) {
    // A cooldown reset IS the damage/contact instant. Recover afterwards and
    // anticipate only the next strike; never predict damage before its tick.
    const duration = ENEMIES.sprinter.cooldown;
    const age = duration - Math.max(0, enemy.cooldown - alpha * STEP);
    return {
      state: "attack",
      frame:
        32 +
        (reducedMotion ? 0 : Math.min(15, Math.floor((age / duration) * 16))),
    };
  }
  if (enemy.x !== enemy.previousX) {
    const x = enemy.previousX + (enemy.x - enemy.previousX) * alpha;
    // 48 world pixels per stride, with a 60% planted stance. The feet travel
    // backwards relative to the torso at exactly the authoritative world speed.
    const phase = cycle((-x * 100) / 48 + enemy.id * 0.37);
    return { state: "walk", frame: reducedMotion ? 6 : Math.floor(phase * 24) };
  }
  return {
    state: "idle",
    frame:
      24 +
      (reducedMotion
        ? 0
        : Math.floor(cycle((elapsed + alpha * STEP) / 2.4) * 8)),
  };
}
