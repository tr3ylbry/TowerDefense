# Expedition 0.2 — combat, gameplay, and presentation polish

## Baseline and priorities

Assessed `c786396` on `modernization`. The starting worktree was clean. Original Java source/assets, `master`, and `school-project-2019` are preserved. This milestone is confined to the game; hosting and Treydmark publication belong to Treydmark Tech.

Agent-driven browser assessment before implementation used Canyon at 1280×800, Sky Bridge at 768×1024, and The Nest at 390×844. This is not independent human feedback. The fixed-step architecture, roster, acid restrictions, keyboard controls, and pause lifecycle provide a useful base.

Priority findings:

1. Wave briefings are passive; lane arrivals have no schedule-driven warning. Preserve automatic schedules while offering a deliberate early-launch risk/reward choice.
2. Original scout/grunt art and the tall TARS image clash with the illustrated ranger/crawler. Replace this small recurring combat group rather than generating the entire roster.
3. Hit feedback does not clearly distinguish plating from ordinary damage. Defenders can lose health with little visible reaction; enemy death size/anchor changes can distract.
4. Bridge and Nest are hard to distinguish under the same dark overlay. Give retained scenery and edge details distinct, restrained palettes.
5. Phone selected-unit details occupy a half-width legacy grid column. Fix the layout before adding controls. Keep the field visible and crew selection reachable at all tested sizes.
6. Deterministic baseline policies demonstrate a large range of viable units but also excess passive economy/downtime. Bot success is not proof of enjoyment. Investigate a narrow rapid-fire adjustment; avoid a broad numerical rebalance.

Baseline screenshots and raw research are retained in the task's `review/expedition-0.2/` folder. The verification section below distinguishes completed checks from remaining limitations.

## Wave-call design

A wave can be called after the current wave has finished entering, while the mission is playing and before the next wave has been called. The opening wave keeps its preparation period.

Calling brings the next start to **three game seconds from now**. Every subsequent start and unspawned enemy moves earlier by the same amount, preserving enemy order, intra-wave spacing, and later inter-wave spacing. Existing live enemies remain, so overlap is a deliberate risk. The automatic baseline times remain unchanged when the player makes no calls.

Reward: `min(40, 2 × floor(seconds saved))`, once per called wave. At least one whole second must be saved. No reward is available while paused, after completion, during the opening preparation, while current-wave entries remain, or without a next wave. A call is recorded before crediting the reward; repeated activation cannot collect twice. Restart and destination changes rebuild the original schedule.

Warnings use actual unspawned entries within the next five game seconds, including changes from wave calls. They summarize each lane's earliest arrival, count, and highest threat (ordinary, plated Tank, or heavy Gargantua). They show a short future window rather than the whole mission's lane assignments.

## Implementation and verification

### Completed implementation

- Early-wave commands and warnings are part of the existing simulation. `waves.ts` holds reward/warning rules; `simulation.ts` owns the mutable schedule, one-time eligibility, and lifecycle resets. No renderer callback controls spawning, damage, income, or rewards.
- Impact events expose actual plating resistance. Normal hits use restrained recoil and a warm silhouette flash; resistant hits use smaller movement, a blue ring, and a PLATED cue. Projectile trails distinguish ammunition; splash rings depict the actual horizontal radius within one lane. Wind-ups and releases still follow rule events.
- Defenders flash briefly on damage, retain an outline for 0.6 game seconds, and show a persistent triangle/critical text below 30% health. Loss events announce destruction. Death effects preserve grounding and clear transient tint/rotation.
- Scout, Grunt, and TARS have new illustrated cutouts. The existing Canyon, ranger, and crawler are retained. Bridge and Nest keep their school backgrounds with cyan/violet palette and perimeter treatments. A shared art registry controls portraits, preview ghosts, sprite dimensions, and foot anchors. Repeated comparison restores school animations; static cutouts never resume a stopped school animation after pause.
- Wave controls display the reward, three-second lead, remaining live-enemy risk, and future-schedule shift. Lane edge markers and short HTML warnings identify ordinary, plated, and heavy arrivals. N uses the same command as the native button. Phone controls summarize the next group without a long composition list.
- The phone crew detail panel now uses its full width. Enlarge field provides a pannable close view; Overview restores all six lanes. The existing horizontally scrolling nine-card roster and keyboard selection remain available.
- Effects have a bounded container and remove themselves. Pausing freezes game-time movement/effects and decorative stars. Switching to reduced motion clears active decorative effects immediately; static health, critical, armor, and warning cues remain.

### Before / after

| Area             | Before 0.2                                            | Expedition 0.2                                                                        |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Wave pacing      | Passive fixed countdown                               | Optional capped-reward call; automatic schedules preserved                            |
| Threats          | Whole-wave briefing                                   | Briefing plus actual five-second lane arrivals and Tank/Gargantua severity            |
| Damage           | Subtle generic impacts                                | Normal/resistant hit distinction, lane-sized splash, defender pressure/critical state |
| Art              | Three illustrated prototypes amid school sprites      | Coherent five-character subset, explicit foot anchors, all-map portraits/comparison   |
| Maps             | Similar dark treatment                                | Warm Canyon, cyan Bridge, organic violet Nest perimeter details                       |
| Phone            | Half-width selected-unit details; small overview only | Full-width details, closer pannable field, compact warning/launch controls            |
| Balance evidence | Specialist regression checks                          | Frozen baseline, narrow Startrell experiment, and current-rule pacing study           |

## Defender roles and numerical decisions

Only **Startrell's cooldown changes, from 0.30 to 0.25 seconds**. Damage, health, cost, income, armor, and all other unit cooldowns are unchanged. Automatic map wave starts and compositions are unchanged. The new call reward is the only added source of credits.

The reproducible research comprises **1,440 policy runs**: 360 frozen baseline runs, 432 Startrell baseline/candidate comparisons plus six isolated Sprinter duels, and 648 current-rule pacing runs. Each multi-map policy uses twelve seeds. Policies use legal cells and earned currency, purchase in a documented fixed order, and explicitly distinguish maintenance from unattended play. See [research methods and full results](../reports/expedition-0.2/README.md).

| Defender            | Evidence and retained role                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro Joe           | 50-credit opening coverage remains valuable. Maintained cheap formations win all baseline seeds; unattended formations fail Canyon/Nest against armor. Its ordinary nominal efficiency is 61.18 DPS per 100 credits.                                            |
| Money Bush          | Small 60-credit investment, first full gross payback at 18 game seconds. Two-Bush specialist formations win all baseline seeds. Income competes with immediate lane coverage.                                                                                   |
| Asteroid            | 1,100 health for 35 credits; barrier/splash plans win all baseline seeds. It buys firing time without adding damage or implying an armor counter.                                                                                                               |
| Moon Zeus           | Partial penetration and a 0.7-tile splash radius give it a cluster/armor role. Maintained Astro/Zeus plans win all baseline seeds.                                                                                                                              |
| Explosive Astro Joe | Cheaper 85-credit shells and wider 1-tile splash work behind barriers. Its lower single-target efficiency is not evidence to erase the cluster tradeoff.                                                                                                        |
| Startrell Cluggins  | Ordinary DPS rises 40→48, or 53.33→64 per 100 credits. Isolated Sprinter kill time improves 3.90→3.35 seconds; Astro/Startrell Canyon replacements fall 8.42→5.42 per run. Its higher opening cost and poor plating penetration remain.                         |
| TARS                | Piercing support remains approximately four times as credit-efficient as adjusted Startrell against Tank plating. Astro/TARS formations remain reliable across maps and call modes.                                                                             |
| Money Tree          | Larger 150-credit investment, first full gross payback at 24 seconds. Two-Tree specialist plans win all baseline seeds, but leave more opening exposure than Bushes. Excess late income is still a design issue.                                                |
| Millennium Falcon   | Three piercing ammunition types provide concentrated lane damage. Mixed plans win all baseline seeds. A rigid Astro/Falcon saving policy wins 26/36, exposing lanes while saving 250 credits. That is insufficient evidence to change Falcon's price or damage. |

Nominal DPS excludes projectile travel, overkill, acquisition, survival, splash multiplicity, and purchase timing. These results support the narrow Startrell adjustment; they do not prove every defender is equally attractive to human players.

## Pacing evidence

Clear-field calls shorten mean Astro/TARS missions from **113.45→97.21 seconds** in Canyon, **150.65→97.25** on Bridge, and **164.56→112.20** in Nest. Empty-field time falls from 33.44/74.52/73.99 to 15.58/19/21 seconds respectively. All 36 automatic and all 36 clear-field specialist runs win.

Aggressive calls are a real risk: the maintained cheap two-Astro policy wins every automatic run, but only 6/12 Canyon and 9/12 Nest runs when calling as soon as possible. Keep faster pacing optional. No global shortening or enemy-stat escalation was justified. The two-income-unit plans still accumulate excess money and finish buying early; future difficulty/economy work should involve human playtests.

## Verification

- **80 Vitest tests pass**, retaining all previous rule assertions and adding wave rewards/duplicates/deadlines, exact lead and shifted spacing/order, pause/speed/frame independence, warnings and snapshot isolation, restart/map cleanup, pressure/destruction events, and actual resistant impacts. Existing victory/defeat, economy, salvage, acid, wind-up, projectile, and specialist regressions remain. The suite includes 36 early-call specialist seeds/maps in addition to the existing 108 specialist/economy regression runs.
- **Strict TypeScript and production build pass.** No runtime or development dependencies were added. The 0.2 three-cutout group is 531,796 bytes; full-resolution sources stay outside production. All preloaded game image files total approximately 4.16 MB including original/comparison imagery.
- **13 Playwright Chromium tests pass**, covering desktop/phone controls, keyboard deployment and wave calls, pause/reward cleanup, all nine cards, phone zoom/far-cell placement, map changes, acid restrictions, art comparison including paused toggles, motion preference, guide, and original/new asset failure recovery. Art-comparison screenshots are retained as test output for inspection.
- **1,440 research policy runs and six isolated duels completed**, separate from the regression-test count. Scripts and seed-level JSON reports are checked in and require no new packages or network access.

### Agent-driven browser play

These are real browser interactions, not independent human playtests. Baseline and final assessments use representative desktop, tablet, and phone viewport sizes. Default art, repeated comparison, ordinary/plated warnings, reduced motion, placement, pause, speed, destination selection, and mission lifecycle were reviewed.

| Map / viewport        | Final full-play result                 | Observations                                                                                                   |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Canyon · 1280×800     | Victory, 33 cleared, 3 shields, 1m 50s | Two Bushes, six Astros, six TARS; one +6 early call. Desktop crew/controls fit.                                |
| Sky Bridge · 768×1024 | Victory, 36 cleared, 3 shields, 2m 30s | Legal deployment around acid, two Bushes and full Astro/TARS coverage, 2× speed, comparison toggles.           |
| Nest · 390×844        | Victory, 38 cleared, 3 shields, 2m 38s | Phone overview/zoom, scrolling cards, all six lanes, paused resume, final-wave +12 call, heavy/plated warning. |

An interrupted first Bridge test left three lanes without TARS and lost with 32 cleared at 3m 4s. The defeat overlay and restart were verified; completing the intended formation won the next run. Purchase delays from the testing sequence are not a measured human balance result. No browser console errors were observed in the final play sessions. Screenshots are retained in the task's local `review/expedition-0.2/` folder.

Limitations: automated/agent testing used Chromium, not physical phones or Safari/Firefox. No independent human enjoyment, onboarding, touch-target accuracy, or low-end hardware frame-rate results are claimed. All nine cards are tested for selection and reachability; manual victories use a representative specialist formation rather than claiming every possible formation was played by hand.

## Preserved scope and Expedition 0.3 priorities

The original contributor credits, Java project, original assets, `master`, and `school-project-2019` remain untouched. All browser work stays on `modernization`. No hosting, Treydmark site, publication, domain, campaign, save system, accounts, multiplayer, editor, upgrade tree, or replay UI is added.

Recommended next work:

1. Independent human sessions: first-run comprehension, call-button risk, unit choices, phone targeting, and whether downtime/economy still feel excessive. Use the existing research as a hypothesis source, not a substitute.
2. Continue one coherent art group at a time. Sprinter/ManHunter/Gargantua and income/barrier units still use school sprites; Bridge/Nest still use school scenery. Decide the next group from actual battlefield visibility and play feedback.
3. Add a few authored movement/firing frames only after silhouettes and scale settle. Current cutouts are procedurally animated static images, not full character animation sheets.
4. Measure performance on real lower-end phones and verify Safari/Firefox. The original comparison art still contributes to the roughly 4.16 MB image preload.
5. Explore optional difficulty and economy changes with human evidence. Current specialist formations can leave large late balances; avoid adding an upgrade/campaign system merely to spend them.

Art direction and source prompts are in [ART_DIRECTION.md](ART_DIRECTION.md) and [the 0.2 provenance record](../public/art/expedition/README-0.2.md). Existing third-party school-art authorship remains incompletely documented; contributor credits and original source files are retained.
