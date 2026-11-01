# Six-mission policy and parity evidence

Reproduce from `web/` with `node scripts/research/campaign-0.7.cjs` after installing the locked dependencies. The script compiles a temporary copy with the project's pinned TypeScript, runs public simulation actions, writes these reports, and removes only its own temporary directory. Source hashes, seeds, policies and calling modes are embedded. No application state, credits, enemy health, simulation clocks or schedules are overridden.

- 1,080 runs: six missions × five policies × three calling modes × twelve seeds (3352019–3352030).
- 1,021 wins, 58 losses, one 600-game-second research timeout. Every run's ledger reconciles to its ending balance.
- All 540 previously published 0.6 new-mission runs have identical outcomes and every previously recorded metric. Read-only instrumentation does not change actions.
- 36 frozen-0.5 seeded original schedules and complete stepwise simulation/event runs match, including pause, speed, early calls and restart. Definitions, geometry and original terrain also match.

`balance.json` contains individual runs; `summary.json` contains 90 grouped rows. The helper's policy descriptions/actions remain in `tests/helpers/campaign-policy.ts`: maintained cheap ranks, economy specialists, piercing specialists, mixed Bush/Astro/Zeus/TARS, and warning-driven reactive support. Fixed-priority buying and immediate maintenance are policy assumptions, not a player model.

## Metric definitions

All times are **game seconds**, independent of presentation speed. `idle` counts ticks without living enemies while pending spawns remain, including opening preparation; `longestIdle` is the longest contiguous such interval. Neither is a boredom measurement. `allCoveredAt` is the first tick with one living firing defender in every lane, not a guarantee of sufficient damage.

`replacements` counts successful purchases into a previously purchased cell. A vacated reactive support cell can receive a different kind, so replacement counts can differ from deaths. `lastPurchaseAt` is the final successful purchase. Duration minus that time is an action-free tail for this fixed policy, not proof a human has no decisions. `lastDamageAt` is the last defender-hit event. Purchases by kind and the existing factual economy, losses and calls are retained per run.

`threatSeconds.armored` / `heavy` count ticks with at least one living Tank / Gargantua. `clusteredLane` sums lane-time with two living enemies within one tile; `passedLane` sums lane-time when its nearest enemy has passed every living gun's fresh-shot firing line. Lane-seconds can exceed mission duration. These measures quantify exposure, not damage requirements or reaction success.

## Interpretation and boundary

The four noncheap policies win all 864 runs with three shields. Cheap policies win 157/216; losses and timeout are confined to that strategy. Automatic mixed formations survive every mission without losses or replacements, accumulate 615–1,755 ending credits, and stop purchasing 24–71 seconds before victory. Reactive plans continue buying/replacing much later on Siege and the finale. This confirms a durable formation can remove late purchase decisions; it does not establish that players dislike holding a reserve.

The timeout is First Contact / cheap / aggressive / seed 3352022: 32 kills, three shields, 59 purchases and 47 replacements at 600 seconds. The fixed policy repeatedly replaces guns in its chosen cells while a Tank has passed those firing lines (458.7 passed lane-seconds). This is a policy failure to use the existing left-side rescue/salvage/counter options, not evidence that the simulation stopped advancing. It remains in the results rather than being reclassified as a win.

Bridge increases automatic waiting, while optional clear-field calls substantially shorten it. There is no measured spike that requires global stat changes; the final cheap-policy failure and broad specialist success support teaching existing counters before imposing more mechanics. No combat, authored mission or standalone balance changes were made. Human enjoyment, nine-unit strategy diversity, physical input, optimal policies and real reaction delays are outside this study. See `docs/EXPEDITION_0_7.md` for the decision and browser comparison.
