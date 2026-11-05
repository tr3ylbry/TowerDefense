import type { Wave } from "./content";
import { ROBOT_NAME } from "./identity";
import type { MapKind } from "./environments";

export const DEFAULT_SEED = 3352019;
export interface MissionDefinition {
  id: string;
  environment: MapKind;
  order: number;
  title: string;
  description: string;
  briefing: string;
  tactics: string;
  prerequisite: string | null;
  /** Same fixed default and seeded lane shuffle in both modes; replays keep their seed. */
  seed: number;
  waves: readonly Wave[];
}
const canyonWaves: readonly Wave[] = [
  {
    start: 7,
    title: "First contact",
    enemies: ["scout", "scout", "scout", "scout", "scout", "scout"],
  },
  {
    start: 29,
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
    start: 56,
    title: "Plated advance",
    enemies: [
      "grunt",
      "manhunter",
      "tank",
      "tank",
      "grunt",
      "sprinter",
      "grunt",
      "scout",
      "manhunter",
    ],
  },
  {
    start: 87,
    title: "The last stand",
    enemies: [
      "grunt",
      "tank",
      "sprinter",
      "manhunter",
      "scout",
      "gargantua",
      "tank",
      "sprinter",
      "tank",
      "manhunter",
    ],
  },
];

const bridgeWaves: readonly Wave[] = [
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
];

const nestWaves: readonly Wave[] = [
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
    briefing:
      "Paired lane relay: three lanes first, then the other three. Splash and barriers help; hold a reserve.",
    entries: [
      { offset: 0, laneSlot: 0 },
      { offset: 0.6, laneSlot: 0 },
      { offset: 2.4, laneSlot: 1 },
      { offset: 3, laneSlot: 1 },
      { offset: 4.8, laneSlot: 2 },
      { offset: 5.4, laneSlot: 2 },
      { offset: 12, laneSlot: 3 },
      { offset: 12.6, laneSlot: 3 },
      { offset: 14.4, laneSlot: 4 },
      { offset: 15, laneSlot: 4 },
      { offset: 16.8, laneSlot: 5 },
    ],
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
    briefing:
      "Paired lane relay: three lanes first, then the other three. Splash and barriers help; hold a reserve.",
    entries: [
      { offset: 0, laneSlot: 0 },
      { offset: 0.6, laneSlot: 0 },
      { offset: 2.4, laneSlot: 1 },
      { offset: 3, laneSlot: 1 },
      { offset: 4.8, laneSlot: 2 },
      { offset: 5.4, laneSlot: 2 },
      { offset: 12, laneSlot: 3 },
      { offset: 12.6, laneSlot: 3 },
      { offset: 14.4, laneSlot: 4 },
      { offset: 15, laneSlot: 4 },
      { offset: 16.8, laneSlot: 5 },
      { offset: 17.4, laneSlot: 5 },
    ],
    enemies: [
      "gargantua",
      "manhunter",
      "tank",
      "grunt",
      "manhunter",
      "sprinter",
      "gargantua",
      "grunt",
      "tank",
      "sprinter",
      "manhunter",
      "sprinter",
    ],
  },
];

// Original schedules are defined once, and shared with the standalone compatibility API.
export const STANDALONE_MISSIONS = {
  canyon: "first-contact",
  bridge: "broken-ground",
  nest: "into-the-nest",
} as const;

const relay = (pairs: number, gap: number, delay: number) =>
  Array.from({ length: pairs * 2 }, (_, i) => ({
    offset:
      i < 6
        ? Math.floor(i / 2) * gap + (i % 2) * 0.6
        : delay + Math.floor((i - 6) / 2) * gap + (i % 2) * 0.6,
    laneSlot: Math.floor(i / 2),
  }));

export const MISSIONS = {
  "first-contact": {
    id: "first-contact",
    environment: "canyon",
    order: 1,
    title: "First Contact",
    description: "Establish an outpost on the open frontier.",
    briefing:
      "Cover six lanes. Guns fire right: build to the left of approaching aliens. Protect at least one of three shields through four waves.",
    tactics:
      `Astro Joe opens cheaply. Income supports your formation; bring ${ROBOT_NAME} or plasma for Tanks.`,
    prerequisite: null,
    seed: DEFAULT_SEED,
    waves: canyonWaves,
  },
  "canyon-escalation": {
    id: "canyon-escalation",
    environment: "canyon",
    order: 2,
    title: "Canyon Escalation",
    description: "Runners sweep the lanes before a plated pincer.",
    briefing:
      "Scouts establish the approach. Two sweeps of fast reinforcements follow; the final plated pairs split pressure across all six lanes.",
    tactics:
      "Cover every lane before investing heavily. Rapid fire catches runners; keep piercing support for the pincer. Calling early overlaps survivors.",
    prerequisite: "first-contact",
    seed: DEFAULT_SEED,
    waves: [
      {
        start: 8,
        title: "Wide horizon",
        enemies: ["scout", "scout", "scout", "scout", "scout", "scout"],
      },
      {
        start: 30,
        title: "Runner sweep",
        enemies: [
          "sprinter",
          "scout",
          "sprinter",
          "grunt",
          "sprinter",
          "scout",
          "grunt",
          "sprinter",
          "grunt",
          "sprinter",
          "scout",
          "sprinter",
        ],
        briefing:
          "Two sweeps across all lanes; fast runners make uncovered approaches costly.",
      },
      {
        start: 60,
        title: "Split advance",
        enemies: [
          "tank",
          "grunt",
          "sprinter",
          "manhunter",
          "tank",
          "grunt",
          "manhunter",
          "sprinter",
          "tank",
          "grunt",
          "sprinter",
          "manhunter",
        ],
      },
      {
        start: 94,
        title: "Plated pincer",
        entries: relay(6, 2.4, 9),
        enemies: [
          "tank",
          "sprinter",
          "manhunter",
          "scout",
          "tank",
          "grunt",
          "gargantua",
          "sprinter",
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
        ],
        briefing:
          "Paired pincer: three lanes, then the other three after 9 seconds. Keep a reserve for the second group.",
      },
    ],
  },
  "broken-ground": {
    id: "broken-ground",
    environment: "bridge",
    order: 3,
    title: "Broken Ground",
    description: "Hold the crossing around twelve acid pools.",
    briefing:
      "The bridge has twelve restricted tiles. Aliens cross acid freely; your crew must form up on safe ground.",
    tactics:
      `Plan firing lines to the left of the acid. Barriers buy time; ${ROBOT_NAME} ignores Tank plating.`,
    prerequisite: "canyon-escalation",
    seed: DEFAULT_SEED,
    waves: bridgeWaves,
  },
  "bridge-under-siege": {
    id: "bridge-under-siege",
    environment: "bridge",
    order: 4,
    title: "Bridge Under Siege",
    description: "Clustered assaults test a constrained formation.",
    briefing:
      "Paired patrols give way to tight mixed groups. Build a formation that can withstand both clusters and heavy single targets on the same crossing.",
    tactics:
      "Explosives and plasma hit nearby enemies in a lane. Keep single-target piercing for plated escorts; acid cells stay fixed.",
    prerequisite: "broken-ground",
    seed: DEFAULT_SEED,
    waves: [
      {
        start: 10,
        title: "Crossing patrol",
        enemies: ["scout", "grunt", "scout", "scout", "grunt", "scout"],
      },
      {
        start: 40,
        title: "Crowded crossing",
        entries: relay(6, 2.4, 10),
        enemies: [
          "grunt",
          "sprinter",
          "grunt",
          "scout",
          "manhunter",
          "scout",
          "sprinter",
          "grunt",
          "grunt",
          "sprinter",
          "manhunter",
          "scout",
        ],
        briefing:
          "Six close pairs use every lane. Splash can hit both members of a pair.",
      },
      {
        start: 80,
        title: "Plated escorts",
        entries: relay(6, 2.4, 10),
        enemies: [
          "tank",
          "grunt",
          "manhunter",
          "sprinter",
          "tank",
          "grunt",
          "tank",
          "sprinter",
          "manhunter",
          "grunt",
          "tank",
          "scout",
        ],
      },
      {
        start: 125,
        title: "Siege column",
        entries: relay(6, 2.4, 10),
        enemies: [
          "gargantua",
          "tank",
          "manhunter",
          "sprinter",
          "tank",
          "grunt",
          "gargantua",
          "sprinter",
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
        ],
        briefing:
          "Heavy escorts share firing lanes. A strong front needs both sustained fire and plating counters.",
      },
    ],
  },
  "into-the-nest": {
    id: "into-the-nest",
    environment: "nest",
    order: 5,
    title: "Into the Nest",
    description: "Enter hostile terrain and withstand paired relays.",
    briefing:
      "Sixteen acid pools constrain your formation. The inner guard arrives in paired lane relays: three lanes first, then the other three.",
    tactics:
      "Keep credits for the second relay. Splash and barriers support your armor counters; leave legal rescue positions behind the front.",
    prerequisite: "bridge-under-siege",
    seed: DEFAULT_SEED,
    waves: nestWaves,
  },
  "heart-of-the-swarm": {
    id: "heart-of-the-swarm",
    environment: "nest",
    order: 6,
    title: "Heart of the Swarm",
    description: "Break the inner guard in a three-stage final relay.",
    briefing:
      "The nest rallies its full roster. Early pressure alternates between lanes; the finale sends heavy anchors, plated escorts, then fast reinforcements.",
    tactics:
      "Build income without leaving lanes open. Mix splash, piercing and sustained fire. An early call brings the whole relay closer, including its reinforcements.",
    prerequisite: "into-the-nest",
    seed: DEFAULT_SEED,
    waves: [
      {
        start: 12,
        title: "Outer sentries",
        enemies: ["scout", "grunt", "scout", "scout", "grunt", "scout"],
      },
      {
        start: 44,
        title: "Alarm relay",
        entries: relay(6, 2.4, 9),
        enemies: [
          "manhunter",
          "scout",
          "sprinter",
          "grunt",
          "manhunter",
          "scout",
          "grunt",
          "sprinter",
          "manhunter",
          "scout",
          "sprinter",
          "grunt",
        ],
      },
      {
        start: 88,
        title: "Inner formation",
        entries: relay(6, 2.4, 10),
        enemies: [
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
          "tank",
          "grunt",
          "manhunter",
          "sprinter",
          "tank",
          "grunt",
          "tank",
          "sprinter",
        ],
        briefing:
          "Plated anchors and mobile escorts. Preserve reserve fire for the second half.",
      },
      {
        start: 134,
        title: "The heart answers",
        entries: Array.from({ length: 18 }, (_, i) => ({
          offset: Math.floor(i / 6) * 9 + (i % 6) * 1.2,
          laneSlot: i % 6,
        })),
        enemies: [
          "gargantua",
          "tank",
          "manhunter",
          "gargantua",
          "tank",
          "manhunter",
          "tank",
          "grunt",
          "sprinter",
          "tank",
          "manhunter",
          "grunt",
          "sprinter",
          "manhunter",
          "sprinter",
          "grunt",
          "sprinter",
          "manhunter",
        ],
        briefing:
          "Three-stage relay: anchors, escorts at +9s, reinforcements at +18s. Every lane receives all three stages.",
      },
    ],
  },
} as const satisfies Record<string, MissionDefinition>;
export type MissionId = keyof typeof MISSIONS;
export const CAMPAIGN_ORDER: readonly MissionId[] = Object.values(MISSIONS)
  .sort((a, b) => a.order - b.order)
  .map((mission) => mission.id);
