# Expedition 0.3 economy investigation

**Conclusion: retain the current economy numbers for this milestone.** The measured surplus is partly a reward for successful investment and partly an artifact of plans that intentionally stop buying after fourteen units. Extending those same foundations with Falcons turns much of the surplus into real purchases and hit events, preserves wins, and modestly shortens encounters. The evidence supports clearer feedback about income, refunds, directional fire, and spending; it does not justify a blanket income reduction, more enemy health, cheaper Falcons, or an upgrade system.

## Frozen scope and reproduction

Baseline commit: `2bb30a834343a792fd60f5ffd1cdda9e70c7c65b` (the completed Expedition 0.2 milestone). All three rule modules are read with `git show` into an owned temporary directory and compiled there. The script never switches a branch, mutates hidden simulation state, or reads current working source. The output includes frozen source copies and SHA256 hashes.

From `web/`, run:

```sh
node scripts/research/economy-0.3.cjs
```

Only Node, Git, and the already installed TypeScript compiler are used. An optional first argument supplies an absolute compiler path. The script overwrites its own JSON, CSV, and frozen-source outputs and removes its temporary compilation in a finally block. No dependencies, network access, or external services are used.

**1,404 deterministic policy runs:** thirteen plans × three call modes × three maps × twelve seeds (`3352019` through `3352030`). Seeds shuffle lanes, not wave composition, prices, or baseline start times. There are 1,246 wins, 155 losses, and three explicitly recorded 600-second policy timeouts. These totals are a description of these selected scripts, not an overall game win rate.

## Accounting and observation method

- Income-unit payments, kill rewards, early-wave bonuses, defender losses, shots, and hits are counted from actual drained simulation events. Successful purchases and salvage refunds are measured from public action balance changes and cross-checked against placement/removal events.
- The 0.2 rules expose no passive-income event. Passive income is derived from the exact per-step public credit residual after subtracting all other transactions. Every residual must be zero or 30 credits. The total is independently checked against 30 credits per completed five public game seconds.
- Every run verifies `starting credits + passive + unit income + kills + calls - purchases + refunds = ending credits`. It also verifies call rewards, income attribution, placement/removal counts, and living-unit count against purchases minus salvages minus deaths.
- Fixed plans buy legal cells from left to right in rank order, then lanes 1–6. Money units reserve leftmost cells in lanes 1 and 2; Asteroids use the rightmost legal tile. A plan stops at its first unaffordable desired unit rather than skipping ahead. Repurchases take priority, except the unattended plan.
- Automatic mode never calls. Clear-field mode calls when eligible with zero live enemies. Aggressive mode calls whenever eligible, including while survivors remain. Purchases happen before the call on a given rule step.
- The salvage companions act only at or below 30% health and only when the 40% refund plus current funds can immediately buy the same defender again. Every other plan has zero refunds by design.
- Downtime means zero live aliens while future spawns remain, including the opening wait. It does not measure boredom. The last 40% of the observed mission is labeled late. A late responsive major purchase costs at least 100 credits and has a live enemy or actual five-second warning in that lane. This is an observable proxy, not proof that the purchase was necessary or effective.
- Falcon hits are actual hit events; shot counts are volley events. These counts do not measure all useful damage: overkill is possible, and secondary splash victims do not create separate hit events. No damage-total or human-enjoyment claim is inferred from them.

## Plan outcomes

Each cell covers all three maps and twelve seeds: 36 runs per call mode. Multiple reasonable approaches remain viable on every map. A rigid saving order can perform poorly even though its unit is powerful.

| Plan | Automatic wins | Clear-field wins | Aggressive wins | Policy timeouts |
|---|---:|---:|---:|---:|
| cheap-maintenance | 36/36 | 36/36 | 27/36 | 1 |
| cheap-salvage | 36/36 | 36/36 | 32/36 | 0 |
| cheap-unattended | 6/36 | 6/36 | 0/36 | 0 |
| bush-specialist | 36/36 | 36/36 | 36/36 | 0 |
| tree-specialist | 36/36 | 36/36 | 36/36 | 0 |
| piercing | 36/36 | 36/36 | 36/36 | 0 |
| piercing-salvage | 36/36 | 36/36 | 36/36 | 0 |
| plasma | 36/36 | 35/36 | 36/36 | 0 |
| mixed | 36/36 | 36/36 | 36/36 | 0 |
| falcon-saving | 26/36 | 18/36 | 16/36 | 2 |
| barrier-splash | 36/36 | 36/36 | 36/36 | 0 |
| bush-flagship | 36/36 | 36/36 | 36/36 | 0 |
| tree-flagship | 36/36 | 36/36 | 36/36 | 0 |

### Exact policy definitions

- **cheap-maintenance:** Two Astro ranks; repurchase destroyed units in the same cells.
- **cheap-salvage:** Same twelve Astro slots; salvage at or below 30% health only if the refund plus current credits funds immediate identical replacement.
- **cheap-unattended:** The same twelve Astro slots, each purchased only once; no replacements.
- **bush-specialist:** Two Bushes in lanes 1 and 2, then one Astro and one TARS per lane; stop after this foundation is complete.
- **tree-specialist:** Two Trees in lanes 1 and 2, then one Astro and one TARS per lane; stop after this foundation is complete.
- **piercing:** One Astro and one TARS per lane; maintain these twelve slots.
- **piercing-salvage:** Same piercing plan; salvage defenders at or below 30% health only if refund plus current credits can immediately buy the same unit again.
- **plasma:** One Astro and one Moon Zeus per lane; maintain these twelve slots.
- **mixed:** One each of Astro, Startrell, Moon Zeus, and Falcon per lane, purchased in that rank order.
- **falcon-saving:** One Astro then one Falcon per lane; save for each 250-credit Falcon without skipping ahead.
- **barrier-splash:** One Astro and one Explosive per lane, then one Asteroid in each lane's rightmost legal cell.
- **bush-flagship:** Same two-Bush/Astro/TARS foundation, then one Falcon per lane; maintain all twenty desired slots.
- **tree-flagship:** Same two-Tree/Astro/TARS foundation, then one Falcon per lane; maintain all twenty desired slots.

## Where the surplus comes from

The table shows twelve-seed means under automatic waves. All runs start with 230 credits. These specific foundation plans win with three shields and zero deaths. Economy plans intentionally buy no further units after their 14-slot foundation, so their ending balances alone cannot establish that more spending would have no use.

| Plan | Map | Passive | Unit income | Kill rewards | Call reward | Spent | Ending | Last purchase | Duration |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| piercing | canyon | 660 | 0 | 625 | 0 | 900 | 615 | 70.64s | 113.45s |
| piercing | bridge | 900 | 0 | 670 | 0 | 900 | 900 | 85s | 150.65s |
| piercing | nest | 960 | 0 | 795 | 0 | 900 | 1085 | 80s | 164.56s |
| bush-specialist | canyon | 660 | 900 | 625 | 0 | 1020 | 1395 | 48s | 113.42s |
| bush-specialist | bridge | 900 | 1250 | 670 | 0 | 1020 | 2030 | 49.63s | 150.64s |
| bush-specialist | nest | 960 | 1350 | 795 | 0 | 1020 | 2315 | 52.37s | 164.49s |
| tree-specialist | canyon | 660 | 1620 | 625 | 0 | 1200 | 1935 | 45.69s | 113.42s |
| tree-specialist | bridge | 900 | 2100 | 670 | 0 | 1200 | 2700 | 48s | 150.64s |
| tree-specialist | nest | 960 | 2340 | 795 | 0 | 1200 | 3125 | 48s | 164.49s |

Even without a single income unit, Astro/TARS finishes with 615–1,085 credits under automatic timing. Therefore reducing Bush/Tree payouts would not directly fix the broader fact that a strong static formation can settle a four-wave mission before its final minutes. That is a mission-design and feedback observation, not enough evidence for an enemy-health escalation.

### Opening investment is a real tradeoff

- The two-Bush plan can buy its first attacker at 0 seconds and has purchased armed coverage for all six lanes by approximately 15 seconds. Bushes cost 60 each, pay 25 every six seconds, and reach first full gross repayment at 18 seconds.
- The two-Tree plan saves for its second Tree before buying guns. Its first attacker arrives at 10 seconds and all six lanes have received armed coverage by 24 seconds. Trees cost 150 each, pay 60 every eight seconds, and reach first full gross repayment at 24 seconds. This opener survives the sampled missions, but its delayed coverage is a concrete upfront risk.
- Bush earns approximately 4.17 credits/second/tile and 6.94 credits/second per 100 credits invested. Tree earns 7.5/second/tile and 5/second per 100 invested. Tree is 1.8 times as efficient per occupied tile and less efficient per upfront credit. No price adjustment is justified solely by a high ending balance.

## Is continued spending actually useful?

Paired flagship plans buy the exact same economy/Astro/TARS foundation, then continue purchasing one Falcon per lane. All 216 flagship runs across plans, seeds, maps, and call modes win with three shields and zero deaths. The following automatic-wave means show that these are real late purchases that land hits, while their effect on duration is modest.

| Foundation | Map | Foundation ending | With Falcons ending | Falcons purchased | First Falcon | Last purchase | Falcon hit events | Foundation duration | With Falcons duration |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| bush | canyon | 1395 | 104.17 | 5 | 60s | 105.61s | 40.08 | 113.42s | 109.41s |
| bush | bridge | 2030 | 450 | 6 | 60s | 131.75s | 64.83 | 150.64s | 146.8s |
| bush | nest | 2315 | 735 | 6 | 60s | 132s | 88 | 164.49s | 157.54s |
| tree | canyon | 1935 | 285 | 6 | 56s | 101.3s | 55.75 | 113.42s | 105.18s |
| tree | bridge | 2700 | 1170 | 6 | 56s | 104s | 77.08 | 150.64s | 146.8s |
| tree | nest | 3125 | 1475 | 6 | 56s | 104.08s | 103.33 | 164.49s | 157.54s |

- The Bush extension lowers automatic ending balances from 1,395/2,030/2,315 to approximately 104/450/735 credits. Its Falcons first arrive around 60 seconds and the plan continues buying until approximately 106–132 seconds.
- The Tree extension lowers those balances from 1,935/2,700/3,125 to 285/1,170/1,475. It can afford all six Falcons by approximately 101–104 seconds, and then again reaches its scripted twenty-slot ceiling. This remaining surplus is not evidence that no other legal purchases exist.
- Under clear-field calls, flagship endings are approximately 85–481 credits across these six plan/map pairs. Under aggressive calls they are approximately 65–221 credits. Expensive purchases remain live decisions in shortened missions.
- The extension does not improve shields or win rate because the foundations were already successful. It shortens automatic missions by approximately 4–8 seconds, and the Falcons register real hits. Thus late spending can change combat, while being optional insurance/speed rather than a requirement. Avoid introducing upgrades solely to force every ending balance toward zero.
- Rigid Astro/Falcon saving performs much worse: automatic wins 26/36, clear-field 18/36 (plus two timeouts), aggressive 16/36. Waiting for 250 credits while earlier Astro slots require maintenance exposes other lanes. That does not justify a Falcon damage buff or discount; its viability after a funded foundation shows that purchase order matters.

## Wave rewards do not replace the missing income time

Aggressive calls earn 68 total credits in Canyon and 120 on Bridge/Nest in these runs. The opening wave remains protected. This is small next to successful income production and comes with fewer seconds of passive/unit income, plus overlapping live enemies.

- Two-Bush foundations still win every aggressive run, but end with 1,003/1,130/1,415 rather than 1,395/2,030/2,315 credits. Tree foundations similarly end with 1,193/1,440/1,745 rather than 1,935/2,700/3,125.
- Cheap maintained formations go from 36/36 automatic wins to 27/36 aggressive wins plus one timeout. Unattended formations go from 6/36 automatic wins to zero aggressive wins.
- Clear-field calling is also a choice, not a mathematical guarantee of higher survival: the plasma script loses one Canyon seed after shortening preparation. Keep the control optional and describe overlap and lost preparation clearly.

## Salvage is an active maintenance decision

Cheap critical-salvage runs exercise real refunds. All automatic runs win with three shields. Net spending means purchases minus refunds; refund totals are not additional profit.

| Map | Normal net spending | Salvage gross spending | Refunds | Salvage net spending | Salvages | Normal deaths | Salvage deaths |
|---|---:|---:|---:|---:|---:|---:|---:|
| canyon | 1262.5 | 1695.83 | 438.33 | 1257.5 | 21.92 | 13.25 | 0 |
| bridge | 1029.17 | 1295.83 | 278.33 | 1017.5 | 13.92 | 8.58 | 0 |
| nest | 1333.33 | 1512.5 | 356.67 | 1155.83 | 17.83 | 14.67 | 0.42 |

The rule can preserve money that would otherwise be lost with a dying defender, but requires approximately 14–22 interventions in these automatic missions. It does not repair the underlying armor weakness or produce free currency: an Astro refund is 20 credits against a new 50-credit purchase, leaving a 30-credit replacement expense. The safer Astro/TARS plan does not trigger critical salvage in any sampled run, another sign that strategy changes matter more than one economy number.

## Policy stalls and interpretation limits

Three rigid maintenance scripts remain playing at the 600-second cap. These are recorded as timeouts rather than wins or fabricated losses. A Tank has passed the column-zero defender’s forward firing threshold, but the bot continually replaces a blocker in that same cell. The Tank can damage that body while the defender cannot shoot backward. The bot has enough passive income to keep repeating this ineffective action.

| Plan | Mode | Map | Seed | Remaining Tank x | Tank health | Ending credits |
|---|---|---|---:|---:|---:|---:|
| cheap-maintenance | aggressive | canyon | 3352022 | 0.13 | 353.6 | 1538 |
| falcon-saving | clear-field | nest | 3352025 | 0.09 | 234 | 1589 |
| falcon-saving | clear-field | nest | 3352026 | 0.14 | 182 | 1404 |

The previous 0.2 pacing evidence already contains the cheap aggressive Canyon stall. This study adds explicit timeout classification and two Falcon-saving examples. A human can stop replacing that cell, salvage it, change the formation, or accept the breach; the scripts do not do that. Useful feedback should explain forward-only fire and when a threat has already passed a tile. Changing prices or passive payouts to break a scripted loop would address the wrong cause.

Overall means in the raw aggregates include losses and 600-second timeouts; each aggregate also reports wins-only means to prevent interpreting a timeout as a typical successful mission duration. Seeds cover only twelve deterministic lane arrangements. No independent human testers or physical devices were involved in this research.

## Targeted recommendations for implementation

1. **Keep numerical economy rules unchanged in Expedition 0.3.** No payout, starting-credit, reward, refund, price, health, or enemy-pressure candidate is tested or recommended here. The strongest evidence is for visibility and comprehension, not a nerf.
2. **Make current income legible without adding controls.** Show passive outpost income (30/5s), deployed income-unit contribution, and the next game-time payout. For a selected deployed income unit, show actual income clock, payment amount, and gross payback context. Freeze this information with pause.
3. **Explain salvage before the click.** Preview the exact 40% refund for the hovered/focused defender, and where appropriate the net cost to replace it. Keep losing the current unit and stopping its income explicit. Do not imply the whole original purchase is refunded.
4. **Summarize real mission economics on the outcome screen.** Separate passive, income units, kills, and wave calls from spent/refunded and remaining credits. Present surplus as resources retained, not an automatic failure to spend.
5. **Retain role and call feedback.** Explain that TARS bypasses plating, ordinary rapid fire does not, and Falcon is a concentrated-lane commitment. Explain that calls shift the schedule and can sacrifice preparation and income time despite the bonus.
6. **Clarify forward-only placement.** A tile behind a passed threat can be ineffective even if the lane contains an enemy. Prefer an understandable placement/guide hint over prohibiting otherwise legal placements or silently altering collision.
7. **Use independent playtests to decide the next balance step.** Ask whether surplus feels earned or whether decisions stop mattering, whether income is understood, whether players want a second mission, and whether Falcons are intentionally saved for. These agent-authored scripts cannot answer those human questions.

## Files and schema

- `results.json`: complete compact run data, source hashes, definitions, assumptions, purchase/refund timelines, call details, role calculations, and aggregates.
- `summary.json`: readable aggregate ranges/means plus wins-only metrics. Each mean covers twelve seeds. Nullable purchase timings include a present count so a rare Falcon purchase is not mistaken for a universal one.
- `ledgers.csv`: one row per run with all credit categories, outcomes, deaths, and important timings.
- `source/`: exact frozen inputs extracted from the baseline commit.
- `../../../scripts/research/economy-0.3.cjs`: reproducible runner. No report or research source is imported into the game or copied into its production build.
