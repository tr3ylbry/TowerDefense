# Campaign architecture and content migration

There is one six-lane, nine-column fixed-step simulation. Campaign and standalone modes share it, all nine defenders, all six aliens, renderer, audio, warning and economy controls.

## Expedition 0.9 optional challenge

`game/challenges.ts` defines one First Contact Hard formation variant. `Simulation.chooseDifficulty` accepts Normal/Hard only while ready; Hard is valid for First Contact only. `simulation.waves` resolves the active authored data for spawning, warnings, early calls and briefing. It never mutates `MISSIONS` or `MAPS`; default `makeMissionSpawns` and original constructors remain Normal. The same seeded shuffler, combat engine and economy run both. Restart keeps difficulty, resets speed to 1× and rebuilds the selected timeline; selecting any mission/destination explicitly clears Hard.

Difficulty is lifecycle configuration outside the established deterministic snapshot shape. It is not persisted. The campaign briefing defaults to Normal on every review; only an explicit Hard selection is captured by the artwork preparation transaction. A failed/cancelled transaction never applies the new selection. A visible Hard badge remains during focused play, separate from speed.

Hard awards no Normal progression: both the UI save path and `CompletionRecorder.observe` reject Hard results. The existing version-1 schema, shield ratings and unlock derivation are unchanged. Returning to Normal re-enables ordinary completion recording on a fresh attempt. [The 0.9 report](EXPEDITION_0_9.md) distinguishes the synthetic study, public-control win/loss checks and remaining human balance uncertainty.

## Ownership

| Module                     | Responsibility                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `game/environments.ts`     | Canyon/Bridge/Nest IDs, reusable terrain and background identity, geometry constants                                            |
| `game/missions.ts`         | Six stable mission IDs, order, environment references, briefings, tactical notes, prerequisite, seed default and authored waves |
| `game/content.ts`          | Shared unit/ammunition definitions and reproducible spawning; computed original `MAPS` compatibility view                       |
| `game/validate-content.ts` | Lightweight authoring validation before startup; no schema dependency                                                           |
| `game/simulation.ts`       | The sole rules clock, selected mission, mutable early-call timeline, ready-only selection, restart and attempt identity         |
| `campaign/progress.ts`     | Pure shield ratings, derived unlocks/summary and once-per-attempt authoritative completion                                      |
| `campaign/save.ts`         | Isolated versioned storage, validation, recovery, warnings, write protection, merge and reset                                   |
| `campaign/board.ts`        | Semantic campaign cards and briefings; no combat or storage access                                                              |
| `main.ts`                  | Mode/navigation, confirmation copy, transactional artwork preparation, result presentation and explicit save on victory         |

The environment owns blocked coordinates and background identity. The existing art registry owns presentation anchors/biome palettes. A mission references its environment, never copies its acid tiles or artwork. Every mission uses the same geometry. `MAPS` is computed from each environment plus its original mission's waves for unchanged standalone callers and earlier research scripts. It is a compatibility view, not a second copy of authored content. New mission consumers use `MISSIONS`.

## Original migration

| Standalone selection | Campaign ID     | Order / title      | Preserved behavior                                                    |
| -------------------- | --------------- | ------------------ | --------------------------------------------------------------------- |
| Canyon               | `first-contact` | 01 / First Contact | Starts 7, 29, 56, 87; 33 enemies; open terrain                        |
| Bridge               | `broken-ground` | 03 / Broken Ground | Starts 10, 42, 82, 126; 36 enemies; 12 acid cells                     |
| Nest                 | `into-the-nest` | 05 / Into the Nest | Starts 12, 46, 90, 136; 38 enemies; 16 acid cells; paired late relays |

The old public `new Simulation(seed, map)`, `chooseMap(map)` and `makeSpawns(seed, map)` retain their meaning. `chooseMission(id)` requires ready state, resolves the environment and rebuilds the selected schedule. Restart retains that mission. Selection does not grant progress or start the clock. The caller handles an explicit abandonment decision before resetting an active mission.

Without an explicit research/test seed override, the mission's fixed seed is 3352019. Each wave shuffles lane slots with the preserved LCG and Fisher–Yates algorithm. Entries assign offsets and shuffled lane slots; default entries remain 1.8 seconds apart. Replays retain this seed. Early calls shift the same unspawned schedule used by spawning, warnings and briefings; no campaign-specific combat engine exists.

Validation rejects missing environments, unstable/mismatched IDs, noncontiguous or duplicate order, invalid prerequisites/seeds, empty briefings/waves, unsupported aliens, overlapping wave-entry schedules, negative/nonfinite/out-of-order offsets, entry count mismatches and illegal lane/terrain coordinates. It runs during application startup and in tests. Author content in TypeScript, validate, and include schedule/balance/browser evidence before adding new IDs.

## Progress and integrity

The initial unlock is mission 01. A victory record for the previous mission unlocks the next; completed missions are also always replayable. Unlocks and completion status are derived from validated best records rather than separately persisted booleans that can disagree. A valid recovered later win is retained without fabricating missing earlier stars. The board still identifies the first available uncompleted mission.

`CompletionRecorder` queries the real simulation. Only `won` with no pending spawns/enemies and 1–3 shields records a result for an unlocked mission. UI opening, animations, assets loading, pause, abandoning and defeats never award it. Attempt identity is lifecycle metadata outside deterministic snapshots; restart increments it without affecting any rules. The UI observes once per attempt, and the recorder is idempotent. Higher stars replace the result; equal/lower stars retain the first best result and its metadata. No credit score, XP or permanent currency exists.

Local client data can be edited by the browser owner. This is a single-player convenience save, not an anti-cheat boundary or trusted online leaderboard input.

## Save schema and failure behavior

Only two campaign keys are owned: `ava-campaign` and `ava-campaign-recovery`. Sound and `ava-reduced-motion` are independent. Version 1 is:

```json
{
  "version": 1,
  "best": {
    "first-contact": {
      "stars": 3,
      "shields": 3,
      "duration": 113.25,
      "kills": 33
    }
  }
}
```

Stars must be integer 1–3 and IDs must be registered. Shields normalize to stars; invalid/missing best-result duration/kills become null while retaining valid stars. Duration is finite/nonnegative and kills are additionally integer. Unknown missions or invalid stars are omitted with a recovery notice. No in-progress simulation, controls, event history, personal data or rendering state is stored.

Malformed JSON recovers to empty in memory. A partly damaged version-1 save salvages valid wins. Before a future overwrite, the complete original is preserved in the recovery key. A distinct existing backup is never overwritten: saving stays protected/in memory until reset. Failed backup/read access also protects the original. The warning remains visible without repeated modal interruptions. Raw stored text is never rendered as HTML.

This is the first campaign save version: there is no invented legacy schema to migrate. Unsupported older/newer versions are preserved in place, with in-memory play and a clear reset path. Future migrations must explicitly recognize a supported source schema and test its conversion; do not overwrite unknown versions.

Before a write, another tab's valid higher-star results merge into memory. Newly damaged/incompatible data in another tab is protected. This is a best-effort synchronous localStorage merge, not a multiwriter transaction/lock: truly simultaneous writes can race. No cross-device sync or account recovery is promised. A write quota/access failure keeps the current in-memory progress and gives a concise warning; reloading/closing can lose unsaved wins. Optional settings failures never crash play.

Reset requires a native dialog confirmation with the safe action initially focused. It removes only the two owned keys and clears in-memory campaign records. A failed delete reports that stored progress may return. It never resets combat, sound or motion settings. An already-observed victory does not re-award immediately after reset; replay is required.

## UI and assets

Standalone Canyon remains the default, and all original destinations remain freely accessible. Campaign is available in main navigation and the destination selector. During campaign play the destination control returns directly to Mission control. Preparing an active replacement says it abandons the current deployment; backing out keeps it. A briefing is reviewed before preparation, then the existing Begin control starts play. Results retain the complete itemized economy terminal, show current/previous/best stars, and offer replay, mission control and eligible next-mission review.

Only successful `battlefield.prepare(environment, style)` commits mode/mission changes. Failure offers retry or cancellation with the old mission intact. Visibility changes invalidate automatic resume intent. Ordinary modal swaps keep the original resume intent only while visible. Chapter completion is six wins; total best stars is displayed out of eighteen.

Campaign metadata is static text; opening the board requests three existing scenery thumbnails, rather than mounting six Phaser scenes. Initial assets still include only the selected Canyon environment and current roster; Original art remains deferred. Same-environment missions reuse the texture set. The finite three-environment/two-style cache remains shared and bounded. No new generated imagery, framework, runtime dependency or backend was introduced.

## Expedition 1.0 preservation

Normal authored schedules, simulation rules, shield ratings, save schema and completion recording remain unchanged. The Hard relay briefing now names existing plating counters; no encounter/stat change is introduced. Reassessment exactly retains 1,296 Normal campaign results, 432 Normal/Hard comparison runs and 36 frozen-engine standalone runs. Both articulated aliens read snapshots and cannot change outcomes. See [1.0 evidence](EXPEDITION_1_0.md).
