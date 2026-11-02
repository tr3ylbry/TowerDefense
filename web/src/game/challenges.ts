import type { Wave } from "./content";
import { MISSIONS } from "./missions";

export type Difficulty = "normal" | "hard";
export const HARD_DESCRIPTION =
  "Hard prototype: compact lane relays from wave 2, with more Sprinters and plated Tanks. Same health, damage, 230 credits and three shields. Results do not award or save campaign stars. Speed remains a separate 1×/2× control.";
const formations: readonly (readonly import("./content").EnemyKind[])[] = [
  MISSIONS["first-contact"].waves[0].enemies,
  [
    "sprinter",
    "grunt",
    "sprinter",
    "grunt",
    "sprinter",
    "sprinter",
    "scout",
    "grunt",
  ],
  [
    "tank",
    "manhunter",
    "tank",
    "sprinter",
    "grunt",
    "sprinter",
    "tank",
    "scout",
    "manhunter",
  ],
  [
    "tank",
    "sprinter",
    "tank",
    "manhunter",
    "sprinter",
    "gargantua",
    "tank",
    "sprinter",
    "tank",
    "manhunter",
  ],
];
/** One opt-in encounter variant. Normal authored definitions are never mutated. */
export const HARD_FIRST_CONTACT: readonly Wave[] = MISSIONS[
  "first-contact"
].waves.map((wave, i) => ({
  ...wave,
  enemies: formations[i],
  ...(i
    ? {
        entries: formations[i].map((_, j) => ({
          offset: Math.floor(j / 6) * 5 + (j % 6) * 0.8,
          laneSlot: j % 6,
        })),
        briefing:
          "Compact relay: six lanes, then reinforcements at +5s. Watch plating and keep reserve fire.",
      }
    : {}),
}));
