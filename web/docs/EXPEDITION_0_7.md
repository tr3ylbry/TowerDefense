# Expedition 0.7 — Player experience, pacing and accessibility

Assessment date: November 1, 2026 (America/Phoenix). Baseline: `1d50373cc9cec50ac826840a03f61b77c736ff57`, the final 0.6 revision. The working tree was clean before investigation. Implementation remains the independent `tr3ylbry/TowerDefense` repository on `modernization`.

## 1. Executive decision

Improve the existing campaign through four small changes: opening mode discovery and accurate mode labels; truthful replay/next-mission language; an accessible credit balance; and event/result accessibility. No combat values, mission schedules, ratings, save schema, renderer, artwork or dependencies change. Existing deployment, income, armor, passed-enemy, wave-call and loading guidance is retained.

Engineering verification and external player validation are separate. Independent sessions remain **0/5**. Physical phones and live screen-reader testing remain outstanding. No human opinions or satisfaction scores are inferred from agent play or policies.

## 2. Fresh-session journey and prioritized findings

An agent-controlled IAB session began without campaign progress, inspected the opening, entered Campaign, reviewed First Contact, prepared it, deployed through the public grid, and paused. The baseline screenshot in `reports/expedition-0.7/visual/baseline-campaign-mode.png` shows Campaign prepared while the header says Standalone. Source review corroborated the static label. Later browser journeys cover every mission, win/loss, receipts, replay, next, reload and standalone return; native Safari adds a genuine earned-credit victory and persistence check.

Severity: P1 prevents meaningful access; P2 misleading or costly; P3 smaller friction. Confidence reflects reproducibility, not human frequency. Costs are implementation estimates.

| Priority / finding                                                | Evidence and player impact                                                                                                                                         | Confidence / cost                                                     | Decision                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| P1: Safari credit total absent from native AX output              | Visible balance existed, but native tree jumped from SPACEBUCKS to integrity. Available funds matter for every purchase.                                           | High for tested Safari tree / small                                   | Explicit named balance group; verified changing values in native AX. Live speech still untested.             |
| P2: contradictory mode and weak opening distinction               | Campaign-ready header still said Standalone. Initial Begin mission starts untracked Standalone; Campaign was a separate header action, hidden during focused play. | Confirmed contradiction; discovery impact a hypothesis / small        | Mode label follows the prepared mission; opening offers Campaign and explains Standalone has no saved stars. |
| P2: shield loss only sounded; replay focus skipped result context | Breach callback only played audio; results focused Play again without a result description. Sound is off by default.                                               | High code/native/DOM confidence / small                               | Bounded breach notices and result descriptions on replay focus.                                              |
| P3: impossible improvement prompt / generic next action           | Every completed card said improve rating, including 3/3. Next mission did not name its destination.                                                                | High / small                                                          | Shield improvement below 3; formation experimentation at 3; next mission named.                              |
| P2 hypothesis: Bridge waiting / late secure formations            | Mixed automatic policies have 68–82 idle seconds on later missions; actual native win ends with 1,395 credits. This does not prove boredom.                        | High measurement, low human-impact confidence / balance cost moderate | Retain balance; ask players about waiting, reserve use and early calls.                                      |
| P2 validation gap: first-time comprehension                       | No independent observations of opening choice, armor, calls, stars or replay appeal.                                                                               | Confirmed missing evidence / external sessions                        | Keep five records pending; update existing kit, no invented findings.                                        |

The objective, first placement and firing direction are already explicit in the ready screen and briefing. Native keyboard deployment worked: Begin focuses the grid, arrows move, Enter deploys, number keys select, P pauses. Coverage names missing lanes; income details distinguish growers from guns; the guide and forecast describe plating, counters, arrival lead and overlap. Passed-enemy advice explains a legal rescue tile and armor checks. Those are observed interface facts, not proof new players understand them. No new tutorial state or forced steps were justified.

Campaign locks name their prerequisite, briefing focus is deliberate, preparations remain transactional, and closing preserves deployment. The board explains one shield per star and browser-only saving. Defeat retains useful formation/counter advice and the factual ledger. Native reload intentionally returns to ready Standalone; opening Campaign retains earned stars. In-progress deployments are never advertised as saved.

## 3. Independent first-time testing

The existing `playtest/README.md`, `results-template.csv` and `docs/PLAYTEST_PROTOCOL.md` remain the only system. P01–P05 are pending; no participants were available in this session and no outreach was sent. The kit now observes spontaneous mode discovery before offering any prompted Campaign task. It records a Standalone choice neutrally and separates prompts from independent behavior. Deployment timing still begins at Begin mission, excluding startup and the objective question.

Existing anonymous notes/CSV fields cover counters, income, warnings, first deployment, early calls, outcome/economy, replay interest and device conditions. `open_comments` records mode choice, discovery assistance, unlock/star/save explanations, and unobserved tasks. Consent and private handling of recordings/names are retained. Questions still needing humans: discovery, firing direction, counter understanding, tolerance for Bridge pauses, reserve spending, rating comprehension and whether formation experiments motivate replay.

## 4. Opening/onboarding implementation

Problem/evidence: the baseline mode contradiction is reproducible; an unassisted player can begin Standalone without knowing it does not save stars. Solution: keep the original default and add a small opening choice, “Standalone · no saved stars” / “Explore campaign,” using the existing campaign dialog. The header label follows `campaignMode` after successful asset preparation.

A header-only text correction would fix the contradiction but leave the opening mode distinction absent, particularly on narrow screens. The opening action is a normal keyboard button with a 44px minimum height, disappears after deployment and in Campaign, and adds no artwork request, popup, stored preference or tutorial gate. Existing guidance remains. Tests cover desktop and portrait/landscape at 150% CSS zoom, preparing Campaign, returning to Standalone, beginning and pausing.

Limit: the player benefit and mode preference require human sessions. CSS zoom is not a physical phone text setting.

## 5. Campaign navigation, progression and replay language

Problem/evidence: a three-star card offered an impossible rating improvement, while a generic Next label required recall of mission order. Solution: lower ratings invite protecting more shields; maximum ratings invite another formation. Next names the actual next authored mission. This uses current data rather than adding a replay currency or scoring system.

A universal “Replay” prompt is simpler but loses the existing shield improvement goal for 1–2 stars. Tests inspect both saved rating cases, enabled replay, briefing/back focus, actual victory descriptions and all five named next transitions. Locked reasons, six-mission sequential unlocking and local-only saving stay unchanged. A three-star experiment is an invitation, not validated replay motivation.

## 6. All-six pacing and balance

[Reproducible research](../reports/expedition-0.7/research/README.md) expands the existing helper to all six missions: 1,080 public-action runs, five policies, three call modes, twelve seeds. There are **1,021 wins, 58 losses and one research timeout**. Four noncheap policies win all 864 runs with three shields. All 540 previously published new-mission runs are identical in every existing metric. Thirty-six original schedule/step/event parity runs still match frozen 0.5, including pause, speed, calls and restart.

Representative mixed policy, automatic calls (means over 12 seeds; game seconds):

| Mission            | Opening / enemies | Win / shields | Duration | No active enemies | Longest quiet interval | Ending credits | After last purchase |
| ------------------ | ----------------- | ------------- | -------- | ----------------- | ---------------------- | -------------- | ------------------- |
| First Contact      | 7s / 33           | 12/12 / 3     | 108.70   | 35.11             | 10.65                  | 615            | 23.70               |
| Canyon Escalation  | 8s / 42           | 12/12 / 3     | 114.03   | 35.23             | 10.97                  | 865            | 33.42               |
| Broken Ground      | 10s / 36          | 12/12 / 3     | 147.50   | 79.06             | 26.08                  | 1,200          | 57.17               |
| Bridge Under Siege | 10s / 42          | 12/12 / 3     | 145.84   | 68.19             | 22.94                  | 1,410          | 57.94               |
| Into the Nest      | 12s / 38          | 12/12 / 3     | 158.20   | 82.29             | 26.46                  | 1,485          | 63.20               |
| Heart of the Swarm | 12s / 48          | 12/12 / 3     | 160.85   | 79.30             | 26.31                  | 1,755          | 70.85               |

The mixed formation reaches six armed lanes by 15.05s in every run, buys 20 units for 1,770 credits and loses none. Raw reports include all economy sources, spending, balances, calls, casualties, purchases/replacements, last hostile damage, and armored/heavy/cluster/passed exposure. Definitions distinguish wall time from game time and lane-seconds from mission seconds.

Canyon Escalation → original Bridge increases mean duration by 33.47s; Siege then falls by 1.66s despite tighter clusters. Nest adds terrain and relay pressure; the finale adds stages. Cheap automatic policies win 12/12 on the first five and only 2/12 at the finale, where maintaining Astro-only lines is unreliable. Specialist and reactive alternatives work without buying a Flagship or making calls. This is policy evidence of counter value, not a human difficulty curve.

Clear-field mixed calls reduce durations to 92.84 / 97.73 / 94.15 / 100.08 / 100.59 / 105.57s. Automatic calls remain a viable choice. Aggressive calls shorten further but punish maintained cheap formations; overlap remains a real risk. No call is mandatory.

The one cheap/aggressive First Contact timeout retains three shields but repeatedly replaces guns after a Tank passes their firing lines. The research ceiling is 600 game seconds; this is an advancing but brittle fixed-cell policy, not a frozen engine. A separate public salvage follow-up allows that Tank to breach and wins with two shields at 600.5s. Keep the original timeout as a policy limitation; this recovery illustrates a calculated shield tradeoff, not a numerical balance fix.

**Balance decision: no numerical or wave edits.** Quiet time rises, but it supports optional preparation/early calls and preserves original parity. Human evidence is insufficient to remove it or force spending. No global health, income, counts, requirements or rating adjustments were made.

## 7. Strategic choices and replay findings

Secure mixed formations have no purchases in their last 24–71 seconds and retain large balances. Cheap maintenance can keep making replacements until 2–10 seconds before the end; reactive Siege/finale purchases finish about 7/3 seconds before victory. Threat exposure is materially higher for cheaper formations; clusters and plating counters remain useful. These policies cannot establish optimal play or that every one of nine units has a distinct human-valued role.

Native First Contact used two Bushes, six Astros and six TARS: 14 purchases, 1,020 spent, zero losses, 33 kills, 3 shields, 1m53s, 1,395 credits. Receipt: 230 + 660 supply + 900 growth + 625 bounties − 1,020 purchases = 1,395. No calls or salvage. This confirms earned-credit play and surplus in an actual native browser, not enjoyment.

Replay can improve shields or try different existing formations/call risks; stars remain shield-only and ties retain first-best metadata. No arbitrary sinks, upgrades, score multipliers or persistent achievements were justified.

## 8. Accessible feedback implementation

The explicit credit group (`credit-balance`) exposes “N credits available” without making the continuously changing balance a live region. A static label alone would identify the resource without its value; native Safari now exposes 230, 10, 260 and later earned balances in AX. Existing visible numeric text and affordability details stay intact.

Nonterminal breach events now provide one polite status notice naming lane and remaining shields, with a coverage suggestion. Zero-shield defeat keeps its existing outcome announcement. No countdown, income tick, projectile or enemy-position narration was added. The replay button describes the actual outcome title, elapsed/shield summary and campaign rating through `aria-describedby`; replay removes the description. This supplies context at existing focus rather than adding an interrupting dialog or moving focus repeatedly.

A real one-gun loss regression checks initial and spent accessible balances, the first breach, actual defeat, focused replay/result description, final notice and description removal on replay. The existing complete six-win journey checks victory descriptions too. Semantic/native AX and keyboard behavior are engineering evidence; live screen-reader speech, timing and verbosity remain untested.

## 9. Browser, device and accessibility matrix

| Surface                                                     | Evidence                                                                                                                                                                                                                                                                                                              | Boundary                                                                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Chromium desktop / emulated touch                           | Full retained suite and new mode/result checks; real public-control six wins, lost replay, receipts, reload; touch selection/pan/zoom, landscape, 150% CSS zoom, reduced motion                                                                                                                                       | Desktop emulation, not hardware touch or OS text scaling                                                     |
| Playwright WebKit desktop                                   | Same regression suite and full campaign flow                                                                                                                                                                                                                                                                          | WebKit automation is not native Safari or iOS                                                                |
| Firefox                                                     | Required full CI matrix on Linux; local macOS launcher previously fails before page with profile-folder error                                                                                                                                                                                                         | No browser security preferences weakened; see exact-revision CI linked in delivery                           |
| Native Safari 27.0.1 / build 22625.1.29.11.28, macOS 27.0.1 | Actual opening, locked reasons, briefing focus, keyboard placement, income and piercing purchases, P pause, 2×, real tab absence/manual resume, Original↔Expedition while paused, 3-shield victory, expanded receipt, named next briefing, earned stars after reload, reset cancellation, return to standalone Bridge | One full mission; no native all-six claim, native network-fault, storage-quota or long physical-device claim |
| Physical Android / iPhone                                   | No connected testing hardware supplied                                                                                                                                                                                                                                                                                | Outstanding; no actual touch, OS text enlargement, thermal/memory or mobile Safari certification             |
| Live VoiceOver/NVDA/TalkBack                                | Not exercised; available tooling exposed DOM/native AX, not a reliable speech-output observation surface                                                                                                                                                                                                              | Built-in software availability alone is not a completed AT test; no certification claim                      |

Screenshots in `reports/expedition-0.7/visual/` are labeled visual evidence. They do not replace functional actions/assertions. No private tabs, participant identities or recordings are committed.

## 10. Performance, artwork and reliability

[Matched production evidence](../reports/expedition-0.7/performance/README.md) uses frozen final 0.6 bundles, alternating fresh Chromium contexts, three samples per condition/build, and actual enabled-Begin readiness. Initial imagery stays **600,697 B / 21 files**. Reported transfer is **1,009,871 → 1,010,190 B** (+319 B / 0.032%). Normal medians are 143.6 → 148.6ms; constrained medians are **6,036.7 → 6,036.8ms** (4× CPU, 150ms latency, 200,000 B/s down / 75,000 up). The 0.1ms constrained difference is noise-scale, not a performance improvement or meaningful slowdown. No other automated browser test ran during measurement.

A separate labeled unlock fixture navigates 36 ready-state preparations, not wins. All three Expedition cycles plateau at 64 active texture handles / 24 unique image URLs; all three Original cycles at 100 / 60. One canvas, no errors. This matches the same 0.6 protocol; temporary allocations continue and it is not a GPU-memory or no-leaks proof. Raw entries, source/build hashes, samples and cache observations are retained beside the protocol.

The asset plan and renderer are unchanged. The full retained checks cover selected-scene loading, deferred Original art, cache reuse, dense mixed deployments, repeated restart, failure/retry/cancel, preserved deployments, and manual resume after absence. Opening Campaign still fetches existing thumbnails only on demand. No image-generation or optimization work was needed.

## 11. Progress and save reliability

Version 1 remains unchanged. Existing tests retain initial locks, actual wins, sequential unlocks, higher-star replay, ties, lost replays, reload, partial/damaged recovery, backup failure/collision, unsupported versions, blocked access/quota, failed reset reporting, confirmation/settings isolation and sequential other-tab merge/protection. A new public-action rule test wins First Contact with two shields after deliberately leaving the first Scout lane uncovered, then verifies an existing three-star result and metadata are preserved. Completion still comes from the actual simulation, never overlay state.

Native Safari independently earned and reloaded three stars. Multiple-tab writes are best-effort read/merge/write rather than atomic synchronization: simultaneous writes can race and another open tab can retain old in-memory records after reset. Reload other tabs after reset. No live cross-tab UI synchronization or cloud promise is made. The original recovery keys and unrelated sound/motion data remain isolated.

## 12. Automated checks and failure handling

- **152 rule tests** (all original 151 retained plus authoritative lower-star replay).
- Strict TypeScript and production build pass with the existing lockfile/dependencies.
- **47 browser scenarios per engine / 141 executions** in the required Chromium, Firefox, WebKit CI matrix (all original 42 retained plus five focused scenarios). Final exact-revision CI results/run link are recorded in the delivery response; a pending job is never counted as a pass.
- **1,080 policy runs, 540 exact prior-result comparisons, 36 original parity runs** complete.

Final local run: **94/94 passed** (47 Chromium + 47 WebKit) in 21.0 minutes. The complete earned-credit campaign scenarios took 8.6 / 7.5 minutes respectively and each checked all six wins, 18 stars, result descriptions, named next transitions, receipts, phone results, reload and lost replay. The five new checks also pass in both engines. Local macOS Firefox remains unavailable because of its launcher/profile-folder failure; Firefox is verified in the required Linux CI job rather than by weakening browser settings.

The first local combined suite was deliberately stopped after 17 passes and two interrupted in-flight cases to apply the credit-name defect discovered in native Safari. It is not counted as a successful full run. No assertions, browser projects, timeouts or security settings were relaxed for 0.7. Application edits stop during long public-control playthroughs to avoid development hot reload invalidating missions. Browser output directories are isolated.

## 13. Git delivery and preservation

Logical implementation and evidence/documentation commits stay on `modernization`, pushed only to the independent origin `https://github.com/tr3ylbry/TowerDefense.git`. Runtime implementation commit: `f815c85564250cd0b37960318c255a47ade7d3a8`. Exact remaining commit IDs, remote agreement and final CI are supplied in the delivery response. No deployment, website, backend or Treydmark publication change is part of this milestone.

Original Java source, assets, school documents and contributor credits are preserved. `master` and peeled `school-project-2019` remain `d5ba2c76aa7cf287b4b89b10ff35cc15a24d09fb`; the annotated tag object remains `de94c0c5097af2a8e2f7662a8ff538136dbb4aa7`. The root README's Original Java edition remains untouched. Changes remain in the browser project and its introductory README section.

## 14. Unresolved validation and release risks

Independent human sessions, at least one physical phone, and live assistive technology remain explicit release-validation work. Unknowns include opening comprehension, real response delays, nine-unit usefulness, later waiting, replay appeal, mobile text scaling and real-device performance. Semantic feedback does not yet make the live battlefield a fully equivalent nonvisual experience: future AT observation must assess threat/location information and announcement overlap. Cross-tab writes remain best effort. Retained school-art publication permission/provenance is separate from code readiness. Hosting belongs to Treydmark Tech.

No new upgrade/loadout/content claim substitutes for that evidence. These gaps do not prevent the authorized engineering delivery, but player validation remains incomplete.

## 15. Expedition 0.8 readiness recommendation

Recommend **more targeted gameplay refinement driven by the existing five consented sessions**, with one physical-phone and one live screen-reader session where available. Keep the milestone reversible: establish whether players understand calls/counters and dislike waiting before changing authored pacing or specialist explanations. If those sessions identify a repeatable problem, adjust one authored encounter or contextual message and rerun this study; preserve original standalone parity.

| Candidate              | Current evidence / dependency                                                                                                                        | Decision                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Branching upgrades     | Secure late formations exist, but no human evidence that spending complexity is wanted; requires balance/UI/save design                              | Defer                                           |
| Configurable loadouts  | All nine currently available; no evidence roster choice overwhelms or restrictions improve decisions                                                 | Defer                                           |
| Challenge missions     | Could reuse content with optional constraints after players understand it; smaller than a permanent progression system, but replay demand unmeasured | Reconsider after sessions, do not implement now |
| More campaign missions | Six missions and variable pressure already exist; later waiting and replay appeal unresolved                                                         | Defer                                           |
| More storytelling      | Briefings provide context; no evidence narrative is the missing motivation                                                                           | Defer                                           |
| Targeted refinement    | Concrete usability fixes helped access; human/device/AT gaps and pacing questions remain                                                             | Preferred next milestone                        |

No 0.8 feature is implemented by this report.
