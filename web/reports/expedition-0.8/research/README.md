# Expedition 0.8 pacing study

Baseline: `3b5bf7fd5e3160d87def616e9e3cb35a7448e723`. Reproduce from `web/` with `node scripts/research/campaign-0.8.cjs`. The script copies current rules into its own temporary directory, compiles with pinned TypeScript, uses public Simulation actions, checks content, and removes only its own temporary directory. No browser state or clock manipulation.

## Design and limits

Six missions × six policies × three call modes × twelve seeds (3352019–3352030): **1,296 runs**. All 1,080 previously published runs retain every old field, including nested 0.7 metrics. All 36 stepwise frozen-engine comparisons against `5647f09b44520af8a0d7382b3532ac2c8362c914` pass, including schedules, events, purchases, calls, pause, speed and reset. Historical scripts retain their original five-policy list.

Policies: cheap = two Astro ranks; economy = two Bushes then Astro/TARS; armor = Astro/TARS; mixed = two Bushes then Astro/Zeus/TARS; reactive = Astro coverage and support selected from visible warnings/current enemies; splash = Astro/Explosive/Zeus. Fixed public-action policies are reproducible examples, not optimal strategies or people. They do not assess enjoyment. High-cost Flagship and barriers retain their existing role/stat tests; this study does not establish a preference ranking for all nine defenders.

## Metric definitions

- Opening: no active enemies and wave 0, with future entries pending.
- Within-wave quiet: no enemies and the next pending seeded entry belongs to the current entered wave. Calls move times but never reorder entries; pending count identifies the next entry without reading or editing the private schedule.
- Between-wave quiet: all other enemy-free pending-entry time, including the three-second call lead. The three quiet categories sum to the old idle metric, and active + idle equals elapsed within 0.011 seconds.
- Quiet affordable gun tile: before that tick’s purchases, at least 50 credits and a legal empty tile for Astro. This is a legal/affordable opportunity proxy, not proof that buying is useful or required.
- Last purchase: actual last successful public placement; replacement: a later successful purchase on a previously purchased tile. It is not called the last meaningful decision.
- Quiet after last purchase: overlap of actual quiet intervals and the observed no-further-purchase tail. Active tail is the remainder. No claim that all tactical changes are unnecessary.
- Late purchases/replacements: wave 3 or 4 at purchase time. Pressure includes armored/heavy presence, clustered lane-time and passed lane-time. Calls record real time, saved time, reward, living survivors, Tanks, Gargantua and critical defenders. Clear-field calls assert zero survivors.
- Outcomes include all losses and the bounded 600-second timeout; the separate public-salvage follow-up does not relabel the timeout.

## Mixed policy: quiet partition and optional pace

| Mission            | Opening | Within wave | Between waves | Active | Clear-call available | Quiet with affordable gun tile | Quiet after last buy | Auto duration | Clear-field duration | Aggressive duration |
| ------------------ | ------: | ----------: | ------------: | -----: | -------------------: | -----------------------------: | -------------------: | ------------: | -------------------: | ------------------: |
| first-contact      |    7.00 |        0.00 |         28.11 |  73.59 |                16.26 |                          14.61 |                 2.00 |        108.70 |                92.84 |               75.65 |
| canyon-escalation  |    8.00 |        0.00 |         27.23 |  78.79 |                15.38 |                          23.27 |                10.87 |        114.03 |                97.73 |               85.63 |
| broken-ground      |   10.00 |        0.00 |         69.06 |  68.44 |                57.21 |                          50.38 |                26.08 |        147.50 |                94.15 |               78.30 |
| bridge-under-siege |   10.00 |        0.00 |         58.19 |  77.65 |                46.34 |                          48.35 |                22.94 |        145.84 |               100.08 |               81.02 |
| into-the-nest      |   12.00 |        0.98 |         69.31 |  75.91 |                57.46 |                          49.23 |                24.35 |        158.20 |               100.59 |               83.40 |
| heart-of-the-swarm |   12.00 |        0.00 |         67.30 |  81.55 |                55.45 |                          51.70 |                23.52 |        160.85 |               105.57 |               86.72 |

Means in game seconds, twelve seeds per cell. Broken Ground increases mixed automatic duration by 33.47 seconds from Canyon Escalation, but clear-field duration is 3.58 seconds shorter. Terrain and composition also differ; duration alone is not a difficulty curve.

## All strategy outcomes

| Policy | Wins / 216 | Losses | Timeouts | Mean spent | Mean ending | Mean defender losses | Mean wave 3–4 purchases |
|---|---:|---:|---:|---:|---:|---:|
| cheap | 157 | 58 | 1 | 1575.46 | 441.42 | 20.77 | 19.51 |
| economy | 216 | 0 | 0 | 1020.00 | 1651.69 | 0.00 | 0.21 |
| armor | 216 | 0 | 0 | 900.00 | 857.61 | 0.00 | 1.62 |
| mixed | 216 | 0 | 0 | 1770.00 | 807.63 | 0.00 | 5.83 |
| reactive | 216 | 0 | 0 | 1001.25 | 901.43 | 2.26 | 3.62 |
| splash | 216 | 0 | 0 | 1556.34 | 242.49 | 0.26 | 6.69 |

All five non-cheap policies win all 216 runs each. Cheap wins 157, loses 58, times out once. Cheap Heart of the Swarm wins 2/12 automatic, 0/12 clear-field and 0/12 aggressive; cheap Bridge Under Siege wins 12/12 automatic and clear-field, 0/12 aggressive. Clear-field reduces preparation and reward/income timing too; absence of survivors at the moment of calling is not a guarantee of safety.

Mixed clear-field calls save a mean 15.86, 16.29, 53.35, 45.75, 57.61 and 55.28 seconds of schedule displacement in campaign order. Aggressive calls save 35, 28.4, 69.2, 66.2, 74.8 and 74.2 seconds; all 36 calls per mission/policy occur with survivors. Duration reduction can differ from displacement because money, placements and combat evolve differently.

The automatic mixed late-purchase counts fall from 6 in Canyon Escalation to 3/2/2/1 in later missions. Reactive automatic policies still purchase 2.58–3.5 defenders in waves 3–4 on later missions, while cheap policies replace heavily. Splash automatic policies make 5–6 late purchases on later missions. Late spending is strategy-dependent, not universally absent. Income-first has the largest mean reserve (1,651.69); splash ends with 242.49. Neither number alone demonstrates an economy defect.

The reproducible timeout is First Contact / cheap / aggressive / seed 3352022: Tank in lane 2 at x≈0.127, past every legal fresh muzzle, repeatedly pinned by replacements. Public salvage at row 1, column 0 allows a breach and victory with two shields. This supports honest recovery guidance, not changing Tank health or granting free damage.

## Decision

Select Option A (explicit wait/call/reward/overlap information) plus a narrow Option C (truthful armed/targetable and recovery feedback). Defer Option B: quiet periods vary substantially with policy, all original schedules must remain intact, the supplied Canyon feedback reports a continuous onslaught, and there is no later-mission first-time evidence of boredom. Option D alone leaves reproducible misleading wording and impossible advice in place. Preserve every numeric rule.

Full per-run economy, purchases, pressure, call decisions and all 108 mission/policy/mode summaries are in `balance.json` / `summary.json`; source hashes identify the exact rules and helper. `original-parity.json` records the 36 comparisons. Human validation is separate.
