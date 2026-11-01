# Expedition 0.6 campaign study

Run `node scripts/research/campaign-0.6.cjs` from `web/` with the pinned dependencies and Node 24. It compiles read-only temporary copies, exercises public simulation commands, and removes only its own temporary directory. No hidden credits, spawn edits or clock substitutions are used. The JSON files identify every measured game source by SHA-256.

## Original mission migration

`original-parity.json` freezes `5647f09b44520af8a0d7382b3532ac2c8362c914` with `git show`. It checks deep equality of every unit/ammunition constant, original map metadata, acid coordinates and wave definition, then all 36 schedules (12 seeds × 3 environments). Each original mission is also replayed step by step against the frozen engine using identical earned-credit Astro/TARS purchases, eligible clear-field early calls, pause/resume, 2× speed, and restart. Every snapshot apart from the new mission ID and every event must match. All 36 missions win. This is stronger than comparing two compatibility functions backed by the same new data.

## New missions

`balance.json` includes all 540 runs; `summary.json` aggregates 12 seeds for each of 3 missions × 5 policies × 3 calling modes. No global stats, economy, armor, directional fire or terrain changes were made.

- Cheap: maintain two Astro ranks, with identical replacements when lost.
- Economy: buy two Bushes, then maintain one Astro and one TARS per lane.
- Armor: maintain an Astro and TARS per lane without income units.
- Mixed: two Bushes, then Astro, Zeus and TARS ranks (20 planned purchases before replacement).
- Reactive: maintain six Astro openers; buy support from live enemies and actual five-second lane warnings. Tanks request TARS; Gargantua Zeus; paired warnings Explosive; runners Startrell. An existing support stays in place. This policy never reads future lane assignments.

Each policy saves for its next missing slot; it does not skip a costly planned purchase to spend on a later cheaper one. Legal cells are selected from each environment, with Bush cells reserved. Automatic never calls; clear-field calls only without living enemies; aggressive calls whenever eligible with survivors left in place. The default seed and eleven adjacent seeds are fixed and disclosed. Runs stop at victory, loss or 600 game seconds; none time out. Every ledger must reconcile `230 + supply + income + bounties + calls + salvage − spending = ending credits`.

| Mission            | Cheap automatic / clear / aggressive wins | Other four policies, each mode | Mixed automatic duration, mean |
| ------------------ | ----------------------------------------- | ------------------------------ | ------------------------------ |
| Canyon Escalation  | 12 / 12 / 9 of 12                         | 12 / 12 in every group         | 114.03 s                       |
| Bridge Under Siege | 12 / 12 / 0 of 12                         | 12 / 12 in every group         | 145.84 s                       |
| Heart of the Swarm | 2 / 0 / 0 of 12                           | 12 / 12 in every group         | 160.85 s                       |

Total: 491 wins, 49 losses, zero timeouts. All four specialist/economy/mixed/reactive policies retain three shields in these sampled runs. The cheap policy can grind out the first two missions with automatic schedules but loses more under aggressive overlap. The finale needs more than that same maintained cheap formation in most seeds. It uses a three-stage final relay rather than a health multiplier. The scenarios expose one concrete early-call risk; they do not prove an ideal difficulty curve or that other creative strategies are invalid.

Surplus credits remain substantial (for example the capped mixed automatic plan ends with mean 865 / 1,410 / 1,755). These plans intentionally stop adding slots after their formation is built. That does not establish that spending is useless, nor justify a currency sink, income nerf or upgrades. Economy affordability and earliest complete lane coverage are recorded per run. Aggressive specialist strategies can compress the finale below 100 game seconds, while automatic cheap runs are much longer. This variation needs first-time player observation.

Idle time is time with no living aliens while scheduled arrivals remain; it is not a boredom measurement. Fixed policies are neither optimal agents nor independent human participants. Three shields in a script do not establish fun, intuitive counters, replay desire, phone playability or population win rates. All campaign pacing is provisional pending the existing five-player package.
