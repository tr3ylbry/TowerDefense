# Expedition 0.4 — tactical depth, defender identity, and gameplay refinement

## Outcome and preservation

Expedition 0.4 makes passed firing coverage actionable, adds illustrated Money Bush/Asteroid/Moon Zeus defenders, and introduces paired lane relays in The Nest’s late waves. It also fixes premature destination selection and backgrounded artwork transitions. All unit prices, health, damage, armor, income, rewards and refund values remain unchanged.

Work began from a clean `modernization` at `cfb6eb35917ef8f5102d74c935e607455d61e910`. The previous 88 rule tests and 22 browser scenarios per engine are retained. Original Java source, assets, documentation and contributor credits remain intact; `master` and `school-project-2019` remain comparison references. No hosting, Treydmark website, backend, account, save, upgrade or campaign work is included.

## Assessment and prioritization

| 0.3 finding                      | Evidence / frequency                                                     | Severity / gameplay impact            | Cost / dependency                         | Resolution                                                             |
| -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| Replacement loops                | Three reproduced scripted timeouts; human incidence unknown              | High: ineffective recurring purchases | Small shared geometry + feedback          | Reproduced and explained; contextual recovery advice, no rules rewrite |
| Occupied lanes imply protection  | Real browser capture showed 6/6 firing while Scouts were behind all guns | High: misleading tactical information | Small UI/renderer integration             | Passed-fire markers, armed coverage, legal-placement warning           |
| Seven school defenders           | Confirmed visual mismatch in mixed formations                            | Medium: role/cohesion                 | Generation + field QA                     | Exactly three replacements; four remain                                |
| Retained Bridge/Nest backgrounds | Confirmed, restrictions already differ                                   | Medium presentation gap               | Larger art/QA effort                      | Deferred; no claim of new environment illustrations                    |
| Similar mission tactics          | Strong static formations support investigation; human experience unknown | Medium: decisions may settle early    | Authored spawn entries + matched research | One Nest late-wave relay system                                        |
| Human feedback absent            | Zero independent participants                                            | Major evidence limitation             | External participants                     | Five-player kit ready; results pending                                 |
| Physical/native Safari absent    | No usable physical-device/native Safari surface in session               | Evidence limitation                   | External hardware/access                  | Emulation and Linux CI; limitations explicit                           |
| Slow network/CPU unknown         | Not measured under constraint in 0.3                                     | Reliability risk                      | Controlled browser emulation              | Controlled startup, transition, combat and restart investigation       |
| Late credit surplus              | 0.3 optional continued Falcon spending was useful                        | Human interpretation unknown          | Matched policy study                      | Tactical response opportunities; no broad economy nerf                 |
| Authored animation quality       | Prior frame repainted the body with little useful pose change            | Low-priority presentation             | Additional consistent registration work   | Event-driven production/damage/plasma polish; no new authored sheets   |

The implementation plan was intentionally bounded: preserve geometry, share threat classification, test one Nest candidate against frozen 0.3, integrate three cutouts, verify loading and complete missions, then document and deliver.

## Passed enemies and directional coverage

The preserved simulation aims when `enemy.x > column + 0.2`. A fresh projectile starts at `column + 0.85` and its collision tolerance reaches 0.35 tiles behind that origin. Effective fresh direct reach therefore begins at `column + 0.5`. A gun can aim in the small intervening region without directly hitting the target. Named constants/helpers now express those same numbers; no thresholds, collision, damage, firing direction or positioning rule changes.

A close enemy can contact and destroy a leftmost gun after crossing its muzzle. Repeatedly purchasing the same blocker restores its body without restoring an effective firing position. Passive supply can fund this loop indefinitely. All three original 600-second stalls reproduced exactly. Public salvage followed by stopping replacements lets the hostile breach and resolves each mission with one shield spent. This is recorded separately from the original policy outcome, not relabeled as a successful policy.

Threat feedback reads the nearest living enemy per lane and healthy firing defenders. Income units and barriers do not count as guns. The amber foot marker, “lanes armed / Past guns” indicator and contextual text distinguish direct coverage from an occupied lane. Advice names an empty, legal left-side tile; if none remains, it explains salvage/blocker/breach choices. Original acid coordinates and living occupancy are respected.

This describes **direct fresh-shot reach**, not guaranteed damage, survival or invulnerability. Splash centered on another forward target and projectiles already in flight may still help. Farther-right placements remain legal and useful for future arrivals. A placement warning explains the limitation without rejecting the deployment.

The expandable explanation opens once per mission, can be closed, and does not reopen after every purchase or frame. Advice updates only when its content changes, freezes with pause, and clears after reset, destination change or mission outcome. Keyboard hover/focus and action announcements use the same classifier.

## Mission differentiation and balance

Canyon remains the open coverage/economy/armor introduction. Bridge retains its placement constraints across the original 12 acid cells. Nest retains its original 16 acid cells and unchanged opening two waves, then relays close mixed-role pairs across two seeded three-lane groups in waves 3–4.

The optional per-entry timing/lane-slot definition reuses seeded spawning, early-wave shifts and five-second warnings. Starts (90/136 seconds), counts (11/12), enemy multisets, the random lane shuffle and all unit/economy values remain unchanged. The final list is reordered within its original multiset. Explicit briefings suggest a reserve and explain splash/barrier opportunities before an optional early call and during final-wave entry.

Alternatives considered were no schedule change, fixed outer-lane ambushes, dynamic acid and broad health/income changes. Dynamic terrain would add a second environmental system; fixed rows overfit acid placement; numerical inflation would ignore the previous economy evidence. The chosen relay changes encounter shape through existing systems.

The [matched research report](../reports/expedition-0.4/research/README.md) preserves sources, hashes, queues, ledgers, warnings and exact reproduction commands:

- **3,024 distinct deterministic configurations**: 14 policies × 3 call modes × 3 maps × 12 seeds × 2 variants. Complete repeat outputs are identical. All original 1,404 baseline results are reproduced, and all 1,008 unchanged Canyon/Bridge comparisons match exactly.
- 395,280 baseline and 387,291 candidate warning reconstructions pass. Calls preserve pending counts/live enemy state and shift real warnings correctly.
- Nest plasma automatic duration changes 172.50 → 167.34 seconds; piercing changes 164.56 → 165.80. Several specialist, economy, barrier and funded flagship approaches still win all 12 seeds in every call mode.
- Held-response Nest automatic spending changes roughly 883 → 1,235 credits, with last purchase 140 → 147.25 seconds and full-shield wins. This responder deliberately reacts to paired warnings; it demonstrates a feasible response, not mandatory spending or human preference.
- Strong static formations can still accumulate credits. Income remains useful, high-cost support can shorten encounters, and optional overlap can increase risk. No blanket income nerf, Falcon discount, health increase, upgrade sink or mandatory early call is justified.
- Candidate rigid policies still have **four timeouts**. Aggressively rushed cheap/mixed plans lose some prior successes. Neither these limitations nor the underlying forward-firing rule are hidden by changing balance or weakening tests.

## Art, animation and architecture

Money Bush has amber resource pods in a compact cream/mint cradle; Asteroid has a low slate/crater silhouette; Moon Zeus has a braced heavy frame and right-facing plasma cannon. The group totals **607,605 bytes**, proportionally packaged at 448 pixels maximum. Sources, prompts, generation identifiers, hashes, alpha checks, conversion alternatives and measured foot anchors are preserved in [0.4 provenance](../public/art/expedition/README-0.4.md). Untouched full-resolution originals remain outside the public build.

Root review in the actual Canyon, Bridge and Nest fields confirmed facing, grounding, role distinction and clearance around adjacent units/health indicators. Five defenders and all six aliens now have Expedition cutouts; Explosive Astro Joe, Startrell Cluggins, Money Tree and Millennium Falcon remain school artwork. Original comparison restores every school sheet and preserves the mission. School art provenance remains unresolved before public publication; see [asset credits](../ASSET_CREDITS.md).

Presentation reads real events and simulation time:

- Money Bush briefly grows by up to 5% on an actual production payment.
- Asteroid stays still and gains additional persistent crack tiers at 65%/30% health. Those remain readable with pause or reduced motion.
- Moon Zeus gains a wind-up charge cue, stronger short recoil and cool plasma release flash. Reduced motion keeps a static charge cue, removing flash/recoil.

Existing fixed-step interpolation, impacts, armor cues, enemy contact telegraphs, health bars and bounded effect cleanup remain. Pause freezes gameplay presentation; 2× follows the same clock. No animation changes collision or damage. No new authored cycle was generated: the rejected 0.3 Sprinter repaint remains excluded rather than shipped as nominal animation progress.

Small pure `combat.ts` and `threats.ts` modules keep geometry, shared warning classification and UI/renderer consumers aligned. Optional wave entries extend existing definitions. Simulation remains authoritative. No runtime dependency or architectural rewrite was introduced.

## Reliability and verification

Two confirmed issues found during validation were fixed:

1. Destination/art buttons could be clicked before the initial artwork was ready, silently retaining Canyon. They now start disabled and enable when usable. Destination browsing remains available after initial-load failure, preserving the recovery regression.
2. A slow artwork switch could resume after a tab briefly went hidden and returned before loading finished. A request that was backgrounded now requires explicit manual resume, even after a successful load.

Existing failed-image, retry, cancellation, destination rollback, cached comparison and paused-state checks remain. New browser coverage includes the three-art comparison, legal passed-enemy deployment/rescue, Nest briefing before optional calls and backgrounding during a gated transition. The visibility test emulates the browser visibility API; it is not a physical suspension claim.

Local verification: **98 rule tests** (88 retained + 10 targeted), strict TypeScript and production build pass. Chromium and WebKit each pass all **26 browser scenarios** after the loading-error correction. An initial local Chromium failure exposed the disabled recovery control; the unchanged assertion passes after the fix. Linux CI uses isolated Chromium/Firefox/WebKit matrix jobs with the same complete suite and no skips (78 scenarios total). The [verification record](../reports/expedition-0.4/verification/README.md) links the authoritative checks attached to the delivered commit.

Local macOS Firefox was probed again; its packaged browser still exits before creating a page with “Could not find profile folder.” Previous alternative temporary-directory attempts also failed. No security preference was disabled to force a pass. Linux Firefox remains the execution path. Playwright WebKit is not native Safari. No physical Android/iOS or native Safari run is claimed.

Phone portrait/landscape emulation covers overview/enlarge, panning, far-cell placement, all nine crew cards, horizontal scrolling, unit details, 44px controls, pause/restart, reduced motion and keyboard accessibility. Manual 390×844 phone and 768×1024 tablet reviews supplement the automated checks. A transient immediate-after-resize capture was discarded; stable rendered views are preserved. Physical touch, real GPU/thermal behavior and screen readers remain external validation.

### Controlled performance

See [measurement conditions and raw results](../reports/expedition-0.4/performance/README.md). These use the local production-build preview and compare current normal behavior with an emulated 4× CPU slowdown and 150ms/200,000-byte-per-second network. They do not establish an improvement over 0.3, production-host performance, worst-case FPS or absence of all leaks. Median first-playable startup was **580ms normal / 15,371ms constrained**, across three fresh contexts per condition. Initial images total **2,369,834 bytes**. Late-wave median/p95 frame gaps were **16.7/33.4ms normal** and **33.4/50.1ms constrained** (1,822/1,036 samples). Both public-control 20-defender Nest runs won in about 84 wall seconds. All switches preserved the paused credit bank; subsequent cached switches added no new unique images. Five restarts retained one canvas with zero page errors. JS heap grew 26.3→37.7MB normally and fell 36.7→27.1MB under constraint; uncontrolled collection prevents a memory-leak conclusion. The initial throttled development-server attempt timed out; final metrics use the deployable production build, as documented in the measurement report.

## Crew-card and final browser follow-up

The user’s final visual review identified inconsistent purchasing cards. The older narrow-screen price rule was still absolutely positioned beside the name, while the newer compact grid expected a top-row price. Cards now use an explicit image/price row and a full-width name row, with two lines reserved for short/long-name consistency and natural expansion for longer labels. Names remain complete, image aspect ratios are preserved, and prices/keyboard hints stay in their own area. All nine cards are checked for equal height, consistent label/price offsets, contained content and no overlap at 1280, 900 and 390 pixels in both art styles. Desktop and phone captures are in the visual report.

The first pushed CI run (`72ea4bf`, [run 41236746865](https://github.com/tr3ylbry/TowerDefense/actions/runs/41236746865)) passed all 26 Firefox cases but exposed two timing issues in Chromium/WebKit:

- A short-lived placement announcement was correctly replaced by a new-wave notice before a delayed assertion read it. The test now observes the actual live-region emission, preserving its exact-message requirement. Setup earns the same credits through the public 2× control and returns to 1× before the placements, reducing real wait time without private state/clock edits or relaxed assertions.
- WebKit could lose a pause click if telemetry replaced the visible label between pointer-down and pointer-up. A held public-input probe reproduces this on the pre-guard build. The label now changes only when the phase changes; the same probe pauses both engines successfully. The browser suite includes that held-input regression and retains the original keyboard-wave/pause assertions. [Before](../reports/expedition-0.4/verification/pause-pointer-before.json) and [after](../reports/expedition-0.4/verification/pause-pointer-after.json) records preserve bundle hashes and outcomes.

The complete 98 rule checks/build and targeted local browser corrections pass. Final Linux results are attached to the follow-up commit in GitHub Actions and reported at handoff. No assertions were removed, no browser was skipped, and no security setting was disabled. The earlier controlled performance capture remains explicitly tied to `da0798f`; these subsequent presentation/test changes are not presented as a new performance measurement. Gameplay rules and the frozen tactical research inputs remain unchanged.

## Mission economy terminal follow-up

The user's Canyon victory screenshot supplied visual feedback on the two centered receipt sentences. The expanded receipt now has a compact mint terminal treatment: three aligned deployed/lost/spent readouts, an itemized credit table, signed income and purchase amounts, and an emphasized ending balance. The opening 230-credit bank remains visible. Every amount comes from the existing final snapshot; no economy, prices or balance rules changed. Static fine lines and tabular numerals provide the monitor appearance without additional animation, assets or dependencies.

Native details/summary keyboard behavior, semantic table headers and explicit plus/minus signs preserve readable interaction beyond color. In short focused, phone and landscape battlefields, the expanded outcome overlay scrolls vertically so the entire ledger and Play again remain reachable. The existing receipt browser scenario retains its original purchase/start/reset assertions and now checks actual balance reconciliation, keyboard toggling, horizontal containment, scrollable ending balance and restart at 390×844 and 844×390. Both local Chromium and WebKit pass; the full browser matrix is checked again on the pushed follow-up. [Desktop and phone captures](../reports/expedition-0.4/visual/README.md) record the result. This user formatting feedback is not counted as an independent structured playtest.

## Human and agent evidence

**Zero independent human sessions** have been completed. [The five-player package](../playtest/README.md) is ready, with anonymous pending rows, setup instructions, consent/privacy boundaries, timed first deployment, firing-direction tasks, income/armor/call questions, difficulty observations and open comments. Prompted direction tasks are separate from unassisted behavior. Human evidence must precede broad difficulty or enjoyment claims.

Agent-driven ordinary browser controls produced these successful review runs without private state, free credits or clock edits:

| Map    | Observed outcome                                 | Formation and decisions                                                                                                                                  |
| ------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canyon | 33 cleared; 1m58s; 3 shields; 890 ending credits | Two Bushes, six Astros, six Zeus, a barrier; four late TARS added when L6 lost its Astro. Contextual passed-gun advice and a legal rescue were observed. |
| Nest   | 38 cleared; 2m9s; 3 shields; 1,649 credits       | Two Bushes, six Astros, six Zeus, two barriers; optional early calls for both relay waves; stable phone/tablet review.                                   |
| Bridge | 36 cleared; 2m18s; 3 shields; 1,639 credits      | Two Bushes, six Astros, six Zeus, one barrier; optional third-wave call and original terrain preserved.                                                  |

Pauses and tool timing make these demonstrations unsuitable as controlled balance comparisons. Short unattended incomplete openings also lost while development continued; they are not included as successful sessions or interpreted as first-time-player difficulty. The controlled policy study is the balance evidence. Selected captures and their conditions are in [visual evidence](../reports/expedition-0.4/visual/README.md).

## Remaining issues and Expedition 0.5

1. Recruit the five genuine first-time testers and validate native Safari plus real iOS/Android touch before broad difficulty changes.
2. Finish the four remaining defender illustrations in small reviewed groups; prioritize Explosive Astro Joe because it participates directly in the new splash opportunity. Preserve role differences from Moon Zeus.
3. Replace Bridge/Nest environments coherently, keeping acid coordinates/readability and resolving retained-art attribution before publication.
4. Profile production builds on real slower devices. The present frame/heap measurements are bounded engineering observations.
5. Use actual playtest evidence to decide whether late pressure, reserves or expensive units need further tuning. Do not add upgrades/campaign systems merely to spend surplus credits.
6. An authored action cycle is still a future experiment requiring useful pose change and stable shading. Existing procedural effects remain the accepted baseline.

## Git delivery

Changes are organized into defender art, tactical/reliability implementation, research/verification documentation, focused crew-card/pause follow-up, and mission-economy terminal commits on `modernization`. Completed validated work is pushed to the existing independent `tr3ylbry/TowerDefense` repository; no other contributor repository is a push target. Exact delivered commits and final CI run are reported with the handoff. School source/assets compare unchanged against `school-project-2019`; master/tag reference hashes are checked without modifying them.
