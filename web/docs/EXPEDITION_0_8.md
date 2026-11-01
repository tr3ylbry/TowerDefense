# Expedition 0.8 — Player validation, pacing and refinement

Assessment: November 1, 2026, America/Phoenix. Baseline: `3b5bf7fd5e3160d87def616e9e3cb35a7448e723`; clean working tree on `modernization` before investigation. Independent continuation: `tr3ylbry/TowerDefense`.

## 1. Executive decision

Refine the existing game through four focused improvements: explain the wave-call choice; distinguish armed lanes from current firing coverage; give feasible passed-enemy recovery advice; center pause/speed labels and restore battlefield focus on resume. Available wave controls stack under their timing explanation at narrow widths, including enlarged text; disabled opening controls retain their compact layout. No combat, wave schedule, reward, economy, rating, save-format, artwork or dependency changes.

The 1,296-run study retains every previously published field across 1,080 prior runs. All 36 frozen-engine parity comparisons pass. The milestone improves objectively verifiable information and layout; it does not establish improved enjoyment or first-time comprehension.

## 2. Unresolved 0.7 findings and fresh assessment

The existing Campaign entry, accurate mode label, shield ratings, named Next action, credit group, outcome description and bounded breach announcements remain intact. No regression was found during the targeted review; existing browser coverage continues to exercise them.

An agent-controlled baseline Bridge playthrough used normal controls and earned credits. Four initial Astro lanes, left without further intervention, lost at wave 2: 10 kills, 78 seconds, zero shields. A replay expanded to six Astro lanes and inspected an available wave call: the interface showed the reward, a three-second lead and survivor count, but required the player to infer the actual time saved from a separate countdown. Calling and pausing confirmed that survivors remain and later arrivals shift. This is a reproducible interface observation, not a human confusion rate. The saved baseline screenshot is a paused post-call state, not a victory.

| Priority / finding                                             | Evidence                                                                                         | Classification / decision                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| P2: long later-mission quiet periods                           | Seeded measurements across six policies and three call modes                                     | Quantitative; retain schedules, explain optional pacing                                    |
| P2: recovery text can recommend impossible placement           | First Contact cheap/aggressive seed 3352022 pins a Tank beyond every legal muzzle                | Confirmed misleading advice; distinguish recoverable tiles from exhausted firing positions |
| P3: “lanes firing” measures deployed gun presence              | The opening says firing before any alien arrives                                                 | Confirmed wording mismatch; say armed, use existing geometry for nearest threats           |
| P3: mobile call explanation crowds beside its button           | Visual inspection at 390×844 with 150% CSS zoom showed a narrow text column and stretched button | Reproducible layout friction; stack at narrow widths                                       |
| P3: pause/speed contents are off-center                        | User request; flex containers lacked horizontal centering                                        | Center both, retain touch sizes and labels                                                 |
| Validation: later-mission boredom, challenge and replay appeal | No independent sessions                                                                          | Human-experience hypotheses remain open                                                    |

## 3. Pacing measurements

See [research definitions, strategy results and reproduction](../reports/expedition-0.8/research/README.md), [108 aggregate groups](../reports/expedition-0.8/research/summary.json), and [all 1,296 runs](../reports/expedition-0.8/research/balance.json). Twelve seeds per mission/policy/mode. Game seconds, not wall-clock seconds.

Representative mixed formation, automatic arrivals:

| Mission            | Opening | Within-wave quiet | Between-wave quiet | Active enemies | Automatic duration | Clear-field duration | Aggressive duration |
| ------------------ | ------: | ----------------: | -----------------: | -------------: | -----------------: | -------------------: | ------------------: |
| First Contact      |       7 |                 0 |              28.11 |          73.59 |             108.70 |                92.84 |               75.65 |
| Canyon Escalation  |       8 |                 0 |              27.23 |          78.80 |             114.03 |                97.73 |               85.63 |
| Broken Ground      |      10 |                 0 |              69.06 |          68.44 |             147.50 |                94.15 |               78.30 |
| Bridge Under Siege |      10 |                 0 |              58.19 |          77.65 |             145.84 |               100.08 |               81.02 |
| Into the Nest      |      12 |              0.98 |              69.31 |          75.91 |             158.20 |               100.59 |               83.40 |
| Heart of the Swarm |      12 |                 0 |              67.30 |          81.55 |             160.85 |               105.57 |               86.72 |

Broken Ground's mixed automatic duration rises 33.47 seconds from Canyon Escalation; with clear-field calls it is 3.58 seconds shorter. Terrain, composition and available money differ too, so mission duration is not a difficulty rating.

Later mixed automatic quiet time with a legal affordable gun placement is 48.35–51.70 seconds; quiet time after its last purchase is 22.94–26.08 seconds. These are opportunity and observed inactivity proxies. They do not prove that buying would improve the result, that no further tactical changes are necessary, or that a person is bored. Remaining active time after the last purchase is available in the per-run record. The research deliberately calls this “last purchase,” not “last meaningful decision.”

Clear-field mixed calls displace the remaining schedules by 15.86–57.61 seconds on average, depending on mission. Aggressive calls displace them by 28.40–74.80 seconds, always with survivors in these policies. Their duration changes need not equal displacement: income, rewards, purchases and combat can evolve differently.

## 4. Wave-call findings and alternatives

The authoritative simulation already implements a useful optional pace control. The interface now says **Call available**, compares waiting with a three-second lead and approximate whole-second time saved, retains the exact current credit reward, and explicitly distinguishes a clear field from overlapping survivors. A clear field is not labelled safe. The player may keep preparing. Disabled reasons still come directly from the simulation. Successful-call feedback adds the actual pre-call schedule displacement; no new dialog or control is introduced.

The timing/reward information is descriptive, not a live announcement on each countdown update. Successful/failed explicit calls announce once through the existing status mechanism. The button's accessible description includes timing and overlap information, and keyboard calls retain battlefield focus behavior. Numerical eligibility, credits and spawn timing remain solely in `Simulation.launchNextWave()`.

| Option                              | Gameplay impact / complexity                                                          | Risk / evidence needed                                                                         | Decision                             |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| A: preserve timing, clarify calls   | Existing optional acceleration; small presentation change                             | Low balance risk; first-time discovery still needs people                                      | Selected                             |
| B: shorten newer authored intervals | Faster automatic path; modest content change                                          | Less preparation/income, can harm cheap/reactive recovery; later human pacing evidence missing | Deferred                             |
| C: preparation feedback             | Clarify armed lanes, targetability and feasible recovery; small existing-guide change | Avoid implying a purchase is necessary or sufficient                                           | Selected narrowly                    |
| D: no change                        | No implementation risk                                                                | Leaves demonstrably misleading wording and impossible advice                                   | Retain numbers, correct presentation |

No mandatory calls, extra spawns, health inflation, income reduction or reward tuning.

## 5. Strategic engagement and economy

Across 216 runs per strategy, cheap defense wins 157, loses 58 and times out once. Economy-first, piercing, mixed, reactive and splash each win all 216. This is synthetic policy performance, not a player win-rate estimate.

- Cheap defense requires many replacements; it loses all 12 aggressive Bridge Under Siege runs despite winning all 12 automatic and clear-field runs there. Heart of the Swarm wins only 2/12 automatic and none of its clear-field/aggressive runs. Calling on an empty field still changes preparation and income opportunities.
- Income-first spends 1,020 on its fixed formation, ends with mean 1,651.69 and makes few late purchases. Its chosen reserve is not proof of absent useful options. Armor policy spends 900; both preserve distinct specialist value.
- Mixed formation spends 1,770 with zero losses, often holds through late waves, and can choose early calls instead of more purchases. Automatic late-wave purchases decline from six on Canyon Escalation to three/two/two/one on the later missions.
- Reactive defense averages 2.26 defender losses and 3.62 late purchases over the complete matrix. On later automatic missions it still buys about 2.58–3.5 defenders during waves 3–4. Splash averages 6.69 late purchases overall and ends with mean 242.49. Demand is strategy-dependent.
- Pressure, last damage, purchases by kind, replacements, shields and the complete supply/growth/bounty/call/salvage ledger are retained per run. No assumption equates an unspent credit with a design flaw.

The timeout is a bounded policy deadlock, not an engine freeze: a late Tank at x≈0.127 is pinned by repeated Astro replacements behind every fresh firing line. A separate public salvage action lets it breach, yielding victory with two shields at 600.5 seconds. The timeout stays in the results. Guidance now explains this tradeoff; it never salvages or deploys for the player.

All nine defender roles, armor penetration, splash, direction, blocked terrain and income rules are preserved. Fixed policies do not establish whether humans find the expensive Flagship appealing. That remains a player-observation question.

## 6. Implemented improvements and tradeoffs

| Improvement                                  | Smallest effective solution / alternatives                                                      | Implementation and validation                                                                                                                                                                                    | Limits                                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Wave choice and mobile readability           | Explain existing choice, rather than retime encounters or add confirmations                     | Pure `waveCallDetails()` presentation helper; timing/risk description, post-call feedback; stacked narrow layout; public keyboard/reward/pause tests at desktop, portrait and landscape, including enlarged text | Discovery and preference need first-time evidence                                               |
| Honest coverage                              | Change presence label to armed; use existing nearest-enemy geometry when all lanes are armed    | `coverage()` separates quiet armed lanes, targetable nearest threats and past-gun alerts; focused rules and retained income/barrier coverage tests                                                               | Targetable is not enough damage or guaranteed survival; splash/in-flight shots may help         |
| Feasible recovery                            | Distinguish an empty reachable tile, occupied reachable tiles, and no legal fresh-shot position | `laneThreats()` exposes earliest legal recovery column; placement and existing passed-threat details describe the actual case; pinned-Tank public-action regression                                              | Existing projectiles and splash prevent promising an inevitable breach; advice remains optional |
| Time-control alignment and keyboard recovery | One flex-alignment property and one shared pause/resume handler, same buttons                   | Horizontal and existing vertical centering; rendered-content bounds checked at three viewports. P/header resume returns to the last grid tile; arrow navigation is asserted                                      | Glyph shape varies with platform fonts; live physical touch still outstanding                   |

Native testing also reproduced P-resume leaving focus outside the grid: subsequent arrow/Enter actions did not place defenders. The shared UI toggle now returns focus only when the resulting phase is playing. The simulation is unchanged. Native Safari on the final production build verified an earned Astro placement (180 credits), P pause/resume, and ArrowRight focus at Lane 1, tile 2.

No architecture rewrite. Rules/content/simulation, local saves, scene loading, renderer and audio remain separate and unchanged. No new dependencies. Version metadata advances to 0.8.0.

## 7. Balance and progression decisions

Preserve all six schedules and all combat/economy values. Original Canyon/Bridge/Nest schedules retain stepwise parity. The authored missions retain their existing compositions, acid restrictions and staged arrivals. Strong specialists consistently succeeding is not sufficient evidence to raise difficulty globally; cheap/aggressive losses show counterexamples to “everything is trivial.”

Stars remain solely shield-based. Higher results persist; tied/lower replays preserve the best; losses do not erase it. Version-1 validation, damaged-save recovery, unsupported-version preservation, in-memory fallback, reset confirmation and best-effort cross-tab merge remain untouched. No concrete new cross-tab defect was found that would justify expanding this milestone.

## 8. Genuine human evidence and five-player handoff

The developer supplied retrospective Canyon observations during this milestone: waiting was not especially noticeable and the level felt like a continuous onslaught; they recall using an early call during one run; their runs felt easy, with victories they believe sustained no shield damage. They requested difficulty options, centered time controls and investigation of actual limb animation. Exact Canyon variant, build, strategies, number of runs, timestamps and shield totals were not recorded. Treat those as unknown; the zero-damage recollection is not independently verified telemetry.

This is genuine developer playtest feedback, **not an independent first-time session**. It supports retaining Canyon timing, fixing the explicit layout request, and investigating optional challenge later. It cannot establish later-mission pacing or first-time comprehension. No satisfaction score, participant quote or statistical conclusion is invented.

The existing [kit](../playtest/README.md), protocol and CSV are usable and unchanged. P01–P05 remain pending (0/5). A session can stay on Canyon; unreached features are not observed, not failed. A practical handoff is simply an available first-time player at the developer's local preview, the existing observer guide, and consented anonymous notes. No participants or externally accessible approved build were supplied. No outreach, invitation, deployment or duplicate protocol was created. Hosting remains a separate dependency owned by Treydmark Tech.

## 9. Accessibility

Existing keyboard selection, roving grid, dialog focus, reduced motion, named credits/shields, results descriptions and bounded breach notices remain covered. Wave timing/risk are connected descriptions and ordinary text, not per-tick live regions. The post-call message is a single explicit-action notice. Existing passed-threat status changes only with its tactical text; there is no projectile, income-tick or enemy-position narration added.

Desktop, portrait and landscape checks include the wave button's reachable 44-pixel minimum target, an upper height bound that catches the previously stretched mobile button, 150% CSS text/layout enlargement on mobile, paused stability and keyboard focus return. Native AX and semantic inspection are not live speech testing. VoiceOver/NVDA/TalkBack listening sessions remain outstanding; no physical phone was available through the supplied tools.

## 10. Browser and device evidence

Final results and exact local browser logs are recorded with the evidence under `reports/expedition-0.8/`. The final response identifies the GitHub Actions run for the pushed revision.

| Surface                      | Scope                                                                                                                                                   | Evidence class                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Local Chromium               | Full retained regression suite and six earned-credit Campaign wins, plus new desktop/mobile call tests                                                  | Automated real browser/public actions                       |
| Local WebKit                 | New desktop/portrait/landscape call, centering, keyboard, pause and enlarged-layout checks                                                              | Automated engine/emulated viewport                          |
| CI Chromium, Firefox, WebKit | Full suite on each engine, including all-six-mission journey, ratings, save/reload, loss replay, loading retry/cancel, background resume, art switching | Automated Linux engines; final CI link reported on delivery |
| Native macOS Safari          | Broader standalone Nest defeat, replay, earned-credit three-shield victory, expanded economy and AX inspection                                          | Native desktop UI; not iOS Safari                           |
| Physical Android/iPhone      | Not supplied                                                                                                                                            | Pending                                                     |
| Live screen reader           | Speech output not observed                                                                                                                              | Pending                                                     |

Native Safari 27.0.1 (build 22625.1.29.11.28), macOS 27.0.1: an undefended Nest run lost with zero kills at 51 seconds. An exploratory late-deployment replay exposed the beyond-every-muzzle guidance; it is not counted as a successful recovery. A subsequent controlled replay used public keyboard placement and ordinary pause/1×/2× controls: six Astros plus six TARS, 38 kills, three shields, 165 seconds, 12 purchases, no defender losses. Its expanded ledger is 230 + 990 supply + 795 bounties − 900 spent = 1,115; income, early bonuses and salvage were zero. No credits, spawns or game time were injected. Early-call attempts outside the eligible window did not award credits. This is agent-driven gameplay, not an independent player session. Only the test tab was closed; the preexisting Safari tab was preserved.

Native Mac Firefox cannot launch its profile in this environment, as documented in 0.7; CI Linux Firefox supplies its full engine run. No sandbox, profile or browser security protection was weakened.

## 11. Performance and loading

Matched frozen 0.7 and final 0.8 production builds, three alternating fresh contexts per condition. Host: Apple M5/macOS; Chromium 156.0.8078.4. Constrained conditions: fourfold CPU throttle, 150 ms latency, 200,000 B/s download and 75,000 B/s upload. Readiness is the actual enabled Begin mission observed from navigation, not merely canvas creation. Samples ran before the regression suites.

| Median / delivery                     |                 0.7 |                 0.8 |
| ------------------------------------- | ------------------: | ------------------: |
| Normal ready                          |            148.3 ms |            149.8 ms |
| Constrained ready                     |          6,028.9 ms |          6,030.0 ms |
| Initial unique image bodies           | 600,697 B / 21 URLs | 600,697 B / 21 URLs |
| Initial transfer including navigation |         1,010,190 B |         1,010,689 B |

The 499-byte transfer increase is about 0.049%. The 1.1 ms constrained difference is about 0.02%, within the small-sample variability; no speedup is claimed and no material regression was observed under these conditions. Real phone FPS, thermal behavior and GPU memory are not inferred.

The bounded warm probe again performs 36 ready-state selections across all six missions and both art styles, with one canvas, no page errors, and the same 45→64→100 active texture-handle plateaus. Board preview/same-environment reuse and optional Original deferral remain. The explicitly labelled unlocked-save fixture is for navigation only, never victory evidence. Texture handles and URL counts are not memory measurements or proof of no leaks. No renderer or asset-loading code changed; retained browser tests cover combat, failure/retry/cancel, visibility and results. No new frame-time gain is claimed.

Artifacts: `performance/startup.json`, `cache.json`, `source-sha256.json`, `build-boundary.json`. Reproduce with `scripts/research/profile-0.8.mjs` and two production previews (`AVA_BEFORE_URL`, `AVA_AFTER_URL`). The baseline dist was frozen before source edits. Build-boundary hashes tie both measured bundles to their files.

## 12. Automated verification

158 rule tests (all 152 retained plus six targeted cases), strict TypeScript and production build pass. The first strict check caught an inferred non-null array element in the new recovery-column return; explicitly typing each `LaneThreat | null` mapping result fixed it without a cast or assertion weakening.

Browser baseline remains 47 scenarios per engine; three new viewport cases make 50 per engine (150 in the CI matrix). Existing text assertions now say “armed” and continue checking income/barriers are excluded. No scenario, browser project, timeout, security setting or CI step was removed or weakened. An initial focused six-check run passed; visual review still found mobile crowding, which was corrected and given an additional button-height assertion before final runs. An in-progress run was intentionally cancelled before a responsive edit and is not counted as a completed pass. The completed local Chromium run then passed 49/50 scenarios, including all six earned-credit Campaign victories; its unchanged phone-overview assertion caught crew details extending to 870.83 px in an 844 px viewport. Restricting stacking to the available-call explanation restores the compact opening. All 12 final targeted desktop/mobile checks pass, including the unchanged phone-fit assertion and keyboard recovery. CI runs all 50 scenarios on each engine after push; its observed result is reported on delivery. No assertion was relaxed.

Research: 1,296 runs, 1,080 prior records unchanged, 36 original parity runs. All three quiet categories sum to idle; idle plus active sums to elapsed; call records equal actual early launches; clear-field calls have zero survivors. All credit ledgers close. The original timeout remains visible with a separate recovery follow-up.

## 13. Git delivery and preservation

Work stays on `modernization`, with logical implementation, research and evidence/documentation commits. The final response reports commit IDs and verified push/CI state. Only origin is `https://github.com/tr3ylbry/TowerDefense.git`; no collaborator repository is targeted. No force push or history rewrite.

`master` and the peeled `school-project-2019` tag remain at `d5ba2c76aa7cf287b4b89b10ff35cc15a24d09fb`. The original Java source, assets, documents and project files remain byte-identical to the school tag. The root README's Original Java edition section remains byte-identical to baseline; its browser introduction is the only updated school-root text. Contributor credits are preserved. No Treydmark website, `/labs`, DNS, domain or hosting changes.

## 14. Remaining issues

Independent sessions, physical phones, live assistive technology, school-art publication permissions and broad native-browser long-session evidence remain open. Cross-tab saving is still best-effort. The cheap/aggressive Tank policy can remain pinned indefinitely if it insists on replacing its blocker; the corrected advice explains that recovery may cost a shield. Strong formations can remain secure without late spending; whether that is rewarding needs human observations. No new replay motivation system was added.

Expedition aliens currently use one illustration per type with game-time bobbing/leaning/hit reaction; no independent limb gait. Original-art mode uses retained walk/attack frames. This was verified in `battlefield.ts`, not inferred from a screenshot. No art was regenerated in 0.8. There is no difficulty selector; the exact mission and early-call choices determine the current encounter.

## 15. Conservative Expedition 0.9 recommendation

The developer's concrete animation interest and verified whole-image motion support a **single-alien true walk/idle/attack animation pilot** as the next bounded visual task. Evaluate frame consistency, silhouette at gameplay size, pause/speed/reduced-motion behavior, texture budget and loading before extending to the remaining five. This is a recommendation only; no 0.9 artwork or feature is implemented here.

| Direction                     | Evidence / next decision                                                                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Optional difficulty/challenge | Canyon felt easy to the developer; specialist policies are strong, cheap/overlap policies are not. Worth a focused design/playtest pass on an opt-in challenge that preserves current progress and original parity, rather than silently making every mission harder |
| Permanent upgrades            | No evidence of a necessary progression sink; defer                                                                                                                                                                                                                   |
| Pre-mission loadouts          | No demonstrated roster-choice problem requiring a new system; defer                                                                                                                                                                                                  |
| More content/levels           | Six missions have not received first-time validation; defer                                                                                                                                                                                                          |
| Stronger narrative            | No observed blocker; defer                                                                                                                                                                                                                                           |
| Further pacing changes        | Collect later-mission observations before numerical tuning                                                                                                                                                                                                           |
| Accessibility                 | Schedule actual live screen-reader and physical-phone sessions when available; do not relabel emulation                                                                                                                                                              |
| Release hardening             | Confirm art permissions and real-device behavior before public distribution; hosting remains separate                                                                                                                                                                |

Use the existing five-player kit alongside the animation pilot. Their reactions should decide whether challenge options, authored pacing or broader animation production deserve the following milestone.
