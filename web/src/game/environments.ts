/** Shared terrain and presentation; missions reference these IDs. */
export const ROWS = 6;
export const COLS = 9;
export interface EnvironmentDefinition {
  name: string;
  number: string;
  tag: string;
  description: string;
  background: string;
  blocked: readonly (readonly number[])[];
}
// Zero-based Java Controller coordinates; the duplicate Nest coordinate occurs once.
export const ENVIRONMENTS = {
  canyon: {
    name: "The Canyon",
    number: "01",
    tag: "FIRST CONTACT",
    description:
      "Open terrain. Cover six lanes, invest in income, and prepare armor-piercing support for Tank waves.",
    background: "stage-one",
    blocked: [[], [], [], [], [], []],
  },
  bridge: {
    name: "Sky Bridge",
    number: "02",
    tag: "BROKEN GROUND",
    description:
      "Twelve acid pools divide the bridge. Defenders cannot deploy on them; aliens cross freely.",
    background: "stage-two",
    blocked: [
      [3, 4],
      [4, 5],
      [4, 5],
      [3, 4],
      [5, 6],
      [3, 4],
    ],
  },
  nest: {
    name: "The Nest",
    number: "03",
    tag: "HOSTILE TERRITORY",
    description:
      "Sixteen acid pools constrain your formation. Late waves arrive in paired lane relays; keep a reserve for the second group.",
    background: "stage-three",
    blocked: [
      [1, 3, 6],
      [1, 4, 7],
      [1, 2, 5],
      [1, 4],
      [1, 3, 6],
      [1, 4],
    ],
  },
} as const satisfies Record<string, EnvironmentDefinition>;
export type MapKind = keyof typeof ENVIRONMENTS;
