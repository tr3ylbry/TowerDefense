# Optional challenge study and Normal preservation

Reproduce from `web/`: `node scripts/research/challenges-0.9.cjs` and `node scripts/research/campaign-0.9.cjs`. These are offline deterministic studies, not first-time-player difficulty ratings. No hidden runtime actions, added health, edited saves or synthetic human feedback are used.

## Candidate design

First Contact, twelve seeds 3352019–3352030, six existing public-action policies (cheap, economy, armor, mixed, reactive, splash), three call modes (automatic, clear-field, aggressive). Each candidate has 216 runs, 1,080 total. Policies use actual credits, warnings, visible enemies and legal deployment; no seeded lane foreknowledge. Every run is bounded at 600 game seconds. Full outcomes, opening coverage, pressure, purchase timing, income, losses, calls and ledger fields are in [candidates.json](candidates.json). Per-seed geometry remains deterministic.

| Candidate          | Explicit change                                                                   | Wins /216 | Losses | Timeouts | Mean shields | Mean duration | Mean wave-overlap seconds | Mean defender losses |
| ------------------ | --------------------------------------------------------------------------------- | --------: | -----: | -------: | -----------: | ------------: | ------------------------: | -------------------: |
| Normal             | Established First Contact                                                         |       210 |      5 |        1 |         2.89 |      114.28 s |                     12.53 |                 2.83 |
| A: timing          | Starts 7,22,38,56 instead of 7,29,56,87                                           |       194 |     22 |        0 |         2.65 |       99.02 s |                     21.63 |                 3.30 |
| B: formation       | More existing Sprinters/Tanks; compact six-lane relays then reinforcements at+5 s |       175 |     40 |        1 |         2.38 |      109.85 s |                     24.64 |                 4.59 |
| C: budget          | 150 starting credits instead of 230                                               |       209 |      7 |        0 |         2.88 |      114.56 s |                     13.97 |                 2.69 |
| D: lane constraint | Maximum two living defenders per lane                                             |       204 |      9 |        3 |         2.75 |      157.00 s |                     43.22 |                13.70 |

Isolated temporary source copies implement the experimental data/budget/constraint; they are not maintained alternate combat engines. Only C changes the two initial-budget assignments. D adds one placement guard and lets the fixed policies skip full lanes before affordability checks. Its income/mixed plans still reserve early Bush slots; it is not an optimized two-slot strategy. All copies use the same combat code and fixed-step clock. Source hashes and exact candidate changes are retained in the script/report. One additional 216-run verification exercises the shipped `chooseDifficulty("hard")` API and asserts complete equality with studied B outcomes and research fields.

## Selection: B, one playable prototype

Timing mostly penalized the all-Astro policy: the other five policies still won 36/36 with three shields, aside from one splash shield loss. Budget delayed mean full-lane gun coverage from 12.13 s to 19.13 s while hardly changing outcomes; it narrows the opening more than the later decisions. Normal 230 can immediately fund four Astro Joes or two TARS;150 funds three or one. The lane cap prolonged fights and replacement loops, reduced formation freedom and produced three bounded timeouts. It is excluded from production.

B preserves 230 credits, the original opening, all 33 enemies' total count, four start times, all prices, health/damage/velocity/armor/reward rules and all nine defenders. It changes which existing aliens occupy later entries and their compact relay offsets. Mean peak live enemies rose 6.72→9.77, overlap 12.53→24.64 s, and spending 1231.81→1310.39 credits. These are controlled fixed-policy observations, not a universal measure of enjoyment or optimal play.

| B policy | Wins across 36 seed/call combinations | Meaning                                                                                                  |
| -------- | ------------------------------------: | -------------------------------------------------------------------------------------------------------- |
| Cheap    |                                     0 | Repeated ordinary fire cannot reliably handle the plated formations.                                     |
| Economy  |                                    36 | Income plus Astro/TARS remains viable.                                                                   |
| Armor    |                                    36 | Direct Astro/TARS coverage remains viable without income.                                                |
| Mixed    |                                    36 | Income, plasma and piercing support remain viable.                                                       |
| Reactive |                                    35 | Visible-threat decisions face more losses; mean losses≈3–4 rather than 0.58.                             |
| Splash   |                                    32 | Explosive/plasma formation remains viable without a TARS requirement; aggressive calling increases risk. |

One B splash/clear-field run reaches the 600-second policy bound with a passed enemy. This is a limitation of that fixed replacement policy, not proof of an unavoidable player softlock: the existing salvage/breach guidance can change the formation and permit a breach. The report retains the timeout rather than relabeling it a win. Several strategies succeeding is evidence for a restrained prototype, not proof that it is fully balanced.

The mode is available only in First Contact's campaign briefing, explicitly opt-in, Normal default. It awards/saves no stars or unlocks. Restart retains Hard; mission/destination selection resets to Normal. Difficulty and 1×/2× speed are independent. Lane warnings/early calls read the actual selected timeline. No other campaign mission is made harder.

## Normal and original parity

[normal/balance.json](normal/balance.json) contains 1,296 six-mission runs. Every previously published 0.8 result/research field matches exactly, including its retained cheap/aggressive timeout. New max-live and overlap counters are read-only and do not affect policy actions. [normal/original-parity.json](normal/original-parity.json) compares 36 standalone runs against frozen 0.5 engine 5647f09b44520af8a0d7382b3532ac2c8362c914, including seeded schedules, tick snapshots/events, earned-credit specialist actions, early calls, pause, speed and restart. Unit/ammunition/terrain definitions are equal.

Only real player sessions can establish whether the new formations are understandable and enjoyable. The existing five-player kit remains pending 0/5; developer Canyon observations remain separate. No new study protocol or participant record is invented.
