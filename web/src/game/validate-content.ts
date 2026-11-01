import { COLS, ENEMIES, ROWS } from "./content";
import { ENVIRONMENTS } from "./environments";
import type { EnvironmentDefinition } from "./environments";
import { MISSIONS } from "./missions";
import type { MissionDefinition } from "./missions";

/** Authoring errors fail at startup and in tests, before a schedule reaches the engine. */
export function validateContent(
  missions: Record<string, MissionDefinition> = MISSIONS,
  environments: Record<string, EnvironmentDefinition> = ENVIRONMENTS,
): void {
  const fail = (message: string): never => {
    throw new Error(`Invalid mission content: ${message}`);
  };
  for (const [id, environment] of Object.entries(environments)) {
    if (environment.blocked.length !== ROWS)
      fail(`${id}: expected six terrain rows`);
    for (const cells of environment.blocked) {
      if (
        new Set(cells).size !== cells.length ||
        cells.some((col) => !Number.isInteger(col) || col < 0 || col >= COLS)
      )
        fail(`${id}: invalid terrain coordinate`);
      if (cells.length === COLS) fail(`${id}: lane has no deployment cells`);
    }
  }
  const orders = new Set<number>();
  for (const [id, mission] of Object.entries(missions)) {
    if (id !== mission.id || !/^[a-z][a-z0-9-]*$/.test(id))
      fail(`${id}: unstable ID`);
    if (!Object.hasOwn(environments, mission.environment))
      fail(`${id}: unknown environment`);
    if (
      !Number.isInteger(mission.order) ||
      mission.order < 1 ||
      orders.has(mission.order)
    )
      fail(`${id}: invalid order`);
    orders.add(mission.order);
    if (
      !Number.isInteger(mission.seed) ||
      mission.seed < 0 ||
      mission.seed > 0xffffffff
    )
      fail(`${id}: invalid seed`);
    if (
      ![
        mission.title,
        mission.description,
        mission.briefing,
        mission.tactics,
      ].every((text) => typeof text === "string" && text.trim())
    )
      fail(`${id}: missing briefing`);
    if (
      mission.prerequisite === null
        ? mission.order !== 1
        : !Object.hasOwn(missions, mission.prerequisite) ||
          missions[mission.prerequisite].order !== mission.order - 1
    )
      fail(`${id}: invalid prerequisite`);
    if (!mission.waves.length) fail(`${id}: empty schedule`);
    let previousEnd = -1;
    for (const wave of mission.waves) {
      if (
        !Number.isFinite(wave.start) ||
        wave.start < 0 ||
        wave.start <= previousEnd ||
        !wave.title ||
        !wave.enemies.length
      )
        fail(`${id}: invalid wave schedule`);
      if (wave.enemies.some((kind) => !Object.hasOwn(ENEMIES, kind)))
        fail(`${id}: unsupported enemy`);
      if (wave.entries && wave.entries.length !== wave.enemies.length)
        fail(`${id}: entry count mismatch`);
      let offset = -1;
      for (let i = 0; i < wave.enemies.length; i++) {
        const entry = wave.entries?.[i] ?? {
          offset: i * 1.8,
          laneSlot: i % ROWS,
        };
        if (
          !Number.isFinite(entry.offset) ||
          entry.offset < 0 ||
          entry.offset < offset ||
          !Number.isInteger(entry.laneSlot) ||
          entry.laneSlot < 0 ||
          entry.laneSlot >= ROWS
        )
          fail(`${id}: invalid spawn entry`);
        offset = entry.offset;
      }
      previousEnd = wave.start + offset;
    }
  }
  if (
    !Array.from({ length: orders.size }, (_, i) => i + 1).every((order) =>
      orders.has(order),
    )
  )
    fail("campaign order must be contiguous");
}
