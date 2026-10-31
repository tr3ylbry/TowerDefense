# Expedition 0.4 tactical research

**Recommendation: retain the paired lane relay on The Nest’s third and fourth waves.** It changes encounter shape while preserving all unit statistics, prices, income, acid coordinates, enemy counts, opening waves, and automatic wave start times. Piercing, plasma, economy, barrier/splash, held-response, and funded flagship plans remain viable. Preserve early-wave calls as optional: the more concentrated final encounters make some aggressively rushed fixed plans less reliable.

**Do not change the economy or firing geometry to make fixed scripts succeed.** The three original replacement stalls reproduce exactly, and normal public salvage followed by allowing a breach resolves each. The new warning work should expose effective firing reach without silently introducing backward fire or prohibiting legal placements.

## Evidence scope

Baseline: `cfb6eb35917ef8f5102d74c935e607455d61e910`. Baseline source is extracted with Git, never through a checkout or working-file mutation. Candidate inputs are read-only copies of the root-owned working rules after the agreed paired-relay implementation. Exact source hashes and complete input copies are saved per variant. The candidate adds the pure combat geometry helper while preserving the original numerical comparisons.

**3,024 distinct deterministic run configurations:** 1,512 per variant, covering fourteen policies × three call modes × three maps × twelve seeds (`3352019` through `3352030`). Thirteen policies are unchanged from the previous economy investigation; a fourteenth holds credits until actual warnings or live targets justify a lane-local counter. All original 1,404 baseline policy outcomes and economic measurements match the checked-in 0.3 report exactly.

Baseline outcomes are 1,354 wins, 155 losses, and three 600-second timeouts. Candidate outcomes are 1,356 wins, 152 losses, and four timeouts. These totals describe this selected collection of scripts and should not be presented as a general human difficulty or enjoyment score.

## Reproducing the original three stalls

Each scenario starts a normal Simulation, deploys legal units using earned credits, and makes public wave-call commands according to its documented policy. There are no direct state edits. Policies repeatedly repurchase their fixed missing slots before considering later purchases; they do not adapt after an enemy has passed those slots.

| Plan | Call mode | Map | Seed | Tank x at 600s | Tank HP | Shields | Credits | Last hostile hit |
|---|---|---|---:|---:|---:|---:|---:|---:|
| cheap-maintenance | aggressive | canyon | 3352022 | 0.13 | 353.6 | 3 | 1538 | 178.7s |
| falcon-saving | clear-field | nest | 3352025 | 0.09 | 234 | 2 | 1589 | 141.75s |
| falcon-saving | clear-field | nest | 3352026 | 0.14 | 182 | 3 | 1404 | 179.4s |

The preserved rule geometry explains the loop:

- A defender begins aiming only at an enemy whose x is strictly greater than `column + 0.2`.
- Projectiles originate at `column + 0.85`, travel right, and collide only with targets at or beyond `projectile.x - 0.35`. A fresh projectile therefore cannot directly hit a target left of `column + 0.5`, even when that target still passes the aiming check.
- Enemy contact has a wider band: defender center `column + 0.5` must lie between `enemy.x - 0.55` and `enemy.x + 0.45`. A column-zero Astro can therefore block a Tank near x=0.1 while being unable to shoot it.
- A later replacement at the same column restores the blocking body, but does not move the muzzle or turn it around. Passive supply is sufficient for the script to keep buying this ineffective block. This is a policy/feedback pathology rather than evidence for cheaper defenders or backward firing.
- Direct fresh-shot reach is not guaranteed damage: wind-up, movement and collision order still matter. A splash explosion centered on a different target ahead may indirectly damage a passed enemy. Threat wording should distinguish inability to engage directly from invulnerability.

A separate recovery probe after the timeout salvages the actual blocking Astro and makes no further replacements. The Tank reaches the outpost, consumes one shield, and all three missions then finish with a win. This probe is excluded from the original policy duration and ledger metrics.

| Original scenario | Recovery completion | Shields before → after | Public actions |
|---|---:|---:|---|
| canyon / 3352022 | 600.5s | 3 → 2 | Salvage col0, stop replacing; breach then victory |
| nest / 3352025 | 600.35s | 2 → 1 | Salvage col0, stop replacing; breach then victory |
| nest / 3352026 | 600.55s | 3 → 2 | Salvage col0, stop replacing; breach then victory |

Candidate Falcon-saving stalls also demonstrate the narrower muzzle deadzone: Tanks at x=0.22, 0.24, and 0.36 remain above the 0.2 aim threshold but below the 0.5 fresh-shot reach. An indicator based only on aiming or occupied lanes would be misleading. The candidate still has four rigid-policy timeouts; none is disguised as a win. All resolve under the same separate public salvage/no-replacement probe.

## Intended mission identities and compared options

| Environment | Existing identity | Chosen scope |
|---|---|---|
| The Canyon | Open 6×9 grid, early coverage and income decisions, introduction to plating and optional calls. | Preserve every spawn, start, count and terrain cell. |
| Sky Bridge | Twelve acid cells restrict later forward support and barriers. The cheapest first two columns remain legal, so simple rear formations initially feel similar to Canyon. | Preserve its current placement identity; do not invent an environmental subsystem. |
| The Nest | Sixteen acid cells, including column1 in all lanes, spread supporting units farther forward and create positioning gaps. | Keep the opening two waves; use seeded late-wave pairs that relay across two lane groups. |

Options considered before root-owned implementation:

1. **No schedule change:** lowest complexity but retains nearly isolated late targets under successful specialist plans; does not improve mission identity.
2. **Bridge environmental pulses or changing acid:** may create positioning choices, but requires new terrain state, timing, warnings, presentation, and rules. It conflicts with the request to solve one focused problem through existing systems.
3. **Fixed outer-lane ambush:** simple, but overfits particular acid rows and reduces seed variety; a player can memorize one corridor rather than reading actual warnings.
4. **Nest paired lane relay — selected:** one optional per-enemy schedule entry reuses the existing deterministic spawn queue, early-wave shifts and lane warnings. Existing enemies are grouped rather than multiplied or inflated. Players can retain broad coverage, add area/barrier support, or hold funds for signaled lanes. The measurements below validate encounter differences and viable responses, not whether humans enjoy them.

## Concrete schedule

Wave definitions accept optional `entries: {offset, laneSlot}[]`. Lane slots index that wave’s existing seeded six-lane shuffle; they are not hard-coded physical rows. Missing entries on other waves retain `index * 1.8` seconds and `index % 6`. Entries are time-sorted and remain attached to the matching enemy.

| Entry | Wave3 enemy | Wave3 offset / lane slot | Wave4 enemy | Wave4 offset / lane slot |
|---:|---|---|---|---|
| 1 | tank | 0 / 0 | gargantua | 0 / 0 |
| 2 | manhunter | 0.6 / 0 | manhunter | 0.6 / 0 |
| 3 | grunt | 2.4 / 1 | tank | 2.4 / 1 |
| 4 | sprinter | 3 / 1 | grunt | 3 / 1 |
| 5 | tank | 4.8 / 2 | manhunter | 4.8 / 2 |
| 6 | grunt | 5.4 / 2 | sprinter | 5.4 / 2 |
| 7 | manhunter | 12 / 3 | gargantua | 12 / 3 |
| 8 | sprinter | 12.6 / 3 | grunt | 12.6 / 3 |
| 9 | grunt | 14.4 / 4 | tank | 14.4 / 4 |
| 10 | tank | 15 / 4 | sprinter | 15 / 4 |
| 11 | scout | 16.8 / 5 | manhunter | 16.8 / 5 |
| 12 | — | — | sprinter | 17.4 / 5 |

Wave3 still starts at 90 seconds and contains 11 enemies. Wave4 still starts at 136 seconds and contains 12. The wave4 multiset is unchanged but reordered so heavy/slow leaders can be followed by faster support. The first three seeded lanes receive close pairs, then pressure moves to the other three lanes. Last-entry offsets become 16.8 and 17.4 seconds versus 18 and 19.8 before. Later wave starts, health, rewards, and terrain remain unchanged.

## Tactical and spending results

The following Nest means cover twelve seeds. Duration is game seconds. Every listed fixed specialist plan wins all twelve runs with all three shields in both variants under automatic timing.

| Plan | Baseline duration | Candidate duration | Baseline spending | Candidate spending | Baseline last buy | Candidate last buy | Baseline cluster lane-seconds | Candidate cluster lane-seconds |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| piercing | 164.56 | 165.8 | 900 | 900 | 80s | 80s | 0.27 | 69.88 |
| plasma | 172.5 | 167.34 | 1050 | 1050 | 98.02s | 96.81s | 1.6 | 38.45 |
| barrier-splash | 187.98 | 183.79 | 1189.17 | 1186.25 | 166.7s | 168.78s | 49.39 | 55.69 |
| bush-specialist | 164.49 | 166.18 | 1020 | 1020 | 52.37s | 52.37s | 0.24 | 69.85 |
| tree-specialist | 164.49 | 166.18 | 1200 | 1200 | 48s | 48s | 0.24 | 69.85 |
| mixed | 167.19 | 163.55 | 1818.75 | 1802.08 | 155.41s | 155.03s | 5.34 | 52.26 |
| bush-flagship | 157.54 | 154.98 | 2520 | 2520 | 132s | 132s | 0 | 31.3 |
| tree-flagship | 157.54 | 154.98 | 2700 | 2700 | 104.08s | 104.5s | 0 | 23.48 |
| held-response | 163.31 | 163.18 | 883.33 | 1234.58 | 140s | 147.25s | 0.93 | 61.28 |

- Astro/TARS close-cluster exposure grows from approximately 0.27 to 69.88 lane-seconds. This is an observed encounter-shape change: each lane-second means one lane contains at least two live enemies within one tile. It is not a performance or enjoyment measurement.
- Plasma’s automatic duration improves from 172.50 to 167.34 seconds while piercing changes from 164.56 to 165.80. Its gap to piercing narrows from approximately eight seconds to approximately two. Barrier/splash improves from 187.98 to 183.79 seconds. These results support an area-support opportunity while preserving the single-target piercing route.
- The held-credit responder wins all 108 baseline and all 108 candidate runs across all maps and modes. In Nest automatic mode it spends approximately 883 → 1,235 credits and last buys at 140 → 147.25 seconds. Mean late purchases rise 3.33 → 5.67. It buys 3.25 Explosives on average under the new schedule versus none automatically before, plus additional TARS coverage.
- That responder intentionally reacts to paired warnings, so increased spending is partly a policy trigger by construction. It proves that a public-warning-driven response is feasible; it does not prove these extra purchases are mandatory or human players will choose them.
- Strong fixed economy and piercing formations still finish purchasing well before mission end. Their late balances remain legitimate outcomes of a stable formation. The relay does not eliminate surplus, and no economy nerf or artificial spending sink is recommended.

### Nest call-mode outcomes

Each cell is wins out of twelve seeds. Other environments have identical schedules and matching policy outcomes. Early overlap remains optional and can be riskier for a narrowly maintained cheap or mixed formation.

| Plan | Automatic before → after | Clear-field before → after | Aggressive before → after |
|---|---:|---:|---:|
| held-response | 12 → 12 | 12 → 12 | 12 → 12 |
| cheap-maintenance | 12 → 12 | 12 → 12 | 9 → 8 |
| cheap-salvage | 12 → 12 | 12 → 12 | 12 → 10 |
| cheap-unattended | 0 → 0 | 0 → 0 | 0 → 0 |
| bush-specialist | 12 → 12 | 12 → 12 | 12 → 12 |
| tree-specialist | 12 → 12 | 12 → 12 | 12 → 12 |
| piercing | 12 → 12 | 12 → 12 | 12 → 12 |
| piercing-salvage | 12 → 12 | 12 → 12 | 12 → 12 |
| plasma | 12 → 12 | 12 → 12 | 12 → 12 |
| mixed | 12 → 12 | 12 → 12 | 12 → 11 |
| falcon-saving | 10 → 9 | 1 → 6 | 4 → 6 |
| barrier-splash | 12 → 12 | 12 → 12 | 12 → 12 |
| bush-flagship | 12 → 12 | 12 → 12 | 12 → 12 |
| tree-flagship | 12 → 12 | 12 → 12 | 12 → 12 |

No candidate revision is indicated by these bounded results: several mechanically different plans remain reliable across all call modes. The aggressive cheap-maintenance, critical-salvage and mixed policies lose one or two successes compared with baseline; rigid Falcon saving remains unreliable and produces some different deadzone stalls. These are reported rather than hidden through price changes, slower enemies, or weaker assertions.

## Warning and schedule invariants

- Candidate definitions are compared against baseline for every tower/enemy field, each original acid coordinate, all wave starts, and each wave’s sorted enemy multiset.
- Every generated queue is ordered, has the exact declared enemy count, and uses valid lanes. Canyon, Bridge, and Nest waves1–2 are compared entry-for-entry across every seed.
- Expected warning groups are independently reconstructed from the public scheduled entries every half game second and after every call. Arrival times, lane, count, kinds and threat class must match the simulation snapshot.
- Calls shift all remaining expected entries by the exact saved time. They must preserve pending count and all live enemy state, and the next start must be exactly three seconds away. This checks the warning/schedule integration, including close pair entries after calls.
- All public economic categories are reconciled per step and checked against the 0.3 mission receipt. Timeouts remain explicit, and successful post-timeout recovery is not folded back into their original outcomes.

The completed baseline and candidate studies perform **395,280** and **387,291** warning comparisons respectively, without an invariant failure.

## Reproduction and files

From `web/`:

```sh
node scripts/research/tactics-0.4.cjs baseline
node scripts/research/tactics-0.4.cjs candidate
```

Run baseline first because candidate validates against its frozen definitions and schedules. The optional third argument is an absolute TypeScript compiler path. Baseline always reads the immutable commit; candidate snapshots the current root-owned game modules and their relative dependencies. The script uses only installed Node/TypeScript and Git, creates and removes its own temporary compilation, and writes only this research directory. No dependencies, network, game edits, branch changes, or private-state mutation are used.

- `baseline/` and `candidate/`: full compact results, readable aggregates, economic CSVs, exact generated schedules and source snapshots/hashes.
- `comparison.json` and `comparison.csv`: matched plan/map/mode summaries, including outcomes, shields, duration, credit ledgers, deaths, purchases, last purchase, late-response proxies and cluster exposure.
- `original-stalls.json`: exact original three cases, both firing gates, blocking state, last hit and separate public recovery evidence.
- `reproducibility.json`: SHA256 proof that a complete repeat produced identical results, summaries, ledgers, schedules, comparisons, and original-stall data. All 1,008 unchanged Canyon/Bridge policy cases also match entry-for-entry between variants.

Comparison files and this narrative describe the captured source hashes. Re-running candidate after further gameplay edits produces a new measured candidate and should be accompanied by an updated comparison. Reports and scripts are not imported by the game or included in production builds.

## Limits and deliberate decisions

- No independent human sessions, native Safari results, physical devices, enjoyment ratings, or performance measurements are claimed here. This is deterministic agent-authored research.
- Twelve seeds vary lane permutations, not player skill or the rest of the encounter design. Fixed purchase priority is deliberately simple and can make a good unit look poor in a rigid order.
- Late major purchases mean cost at least 100; the report also retains all late purchases so useful 85-credit Explosives are not silently excluded.
- The direct-reach gate is an explanation of preserved rules. Threat UI should communicate emergency choices without rejecting legal placements or promising that an occupied lane is safe.
- Prices, income, starting funds, damage, health, armor, refunds and reward caps remain unchanged. The selected mission-specific schedule change is the only measured tactical adjustment.

Delivery cross-check: all four captured candidate game modules (`content.ts`, `simulation.ts`, `combat.ts`, `waves.ts`) compare byte-for-byte identical with the implemented rules at game commit `da0798f59866cd23ae6fb59cab89218b9a4f6e57`. Later verification/documentation changes do not alter these measured rules.
