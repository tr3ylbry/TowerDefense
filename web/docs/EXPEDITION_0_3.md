# Expedition 0.3 — game feel, visual consistency, and performance

## Baseline and priorities

Work began from clean `modernization` at `2bb30a8`. The original Java project, assets, contributor credits, master, and school-project-2019 are preserved. Hosting and Treydmark publication remain outside this game milestone.

The brief's roster count was checked: 0.2 has five illustrated characters (Astro, TARS, Scout, Grunt, Tank) and one illustrated environment, not six characters. All nine defenders, six enemies, three maps, and four waves per map remain the content baseline.

Agent-driven browser assessment used 1280×800 desktop, 768×1024 tablet, and 390×844 phone views. No independent human sessions or physical-device testing are claimed. The reusable [playtest protocol](PLAYTEST_PROTOCOL.md) is ready for five real participants.

| Priority / severity       | Objective observation                                                                                                                                           | Implemented response                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P1 · costly confusion     | No persistent indication of which lanes lack firing coverage; announcements are replaced by later actions. Income units/walls can be mistaken for lane defense. | Contextual first-play coverage guidance, no forced tutorial.                                         |
| P1 · costly confusion     | Selected details give a short role description but no affordability gap, health/penetration, gross income payback, or visible supply countdown.                 | Compact role/affordability and economy feedback.                                                     |
| P1 · performance/recovery | All original comparison sheets and all environments preload before first play; changing presentation currently assumes everything already exists.               | Simple cached per-map/style asset batches with transactional pause, retry/cancel, and no state loss. |
| P2 · visual mismatch      | Sprinter, ManHunter, and Gargantua still use school sheets among painted aliens.                                                                                | Complete this specific alien group and review at field scale.                                        |
| P2 · mobile usability     | Several compact toolbar/speed controls are below recommended touch sizes; landscape and alternative engines lack coverage.                                      | Larger targets and explicit landscape/touch/cross-engine tests.                                      |
| P2 · clarity              | End screens show kills/time/shields but not economy or deployment choices.                                                                                      | Small factual mission accounting summary, without scoring economic play as wrong.                    |

## Implemented experience

- The opening explains crew selection, empty tiles, six firing lanes, three shields, and four waves. A compact live coverage line excludes income units and barriers, identifies uncovered lanes, and reminds players that fire travels right.
- Selected crew details show affordability gap, health, plating bypass, directional fire, barrier placement, or income gross-payback context. Hovering/focusing a matching installed income unit shows its next payment in game seconds. Supply countdown and income-unit count reuse the existing crew header.
- Salvage previews the actual selected defender's health and exact 40% refund before removal. Removing an income unit still stops its production.
- Victory and defeat have an optional collapsed economy receipt: deployments, losses, purchases, remaining credits, and separate supply/growth/bounty/call/refund totals. This is factual accounting rather than a score for spending everything.
- Toolbar, speed, zoom, salvage, navigation, and dialog targets reach 44 CSS pixels. Phone labels remain compact, selected details keep full role information, and the enlarged field is 660 pixels wide so lane targets exceed 44 pixels. Overview remains intentionally smaller for situational awareness. Landscape uses a scrollable field rather than hiding controls or expanding page width.
- No extra persistent control or forced tutorial was added. The field remains central; detailed accounting is optional.

## Economy findings and decision

The [reproducible study](../reports/expedition-0.3/economy/README.md) freezes the baseline's rule modules at `2bb30a8`, then runs **1,404 policies**: thirteen plans × three call modes × three maps × twelve seeds. Every run reconciles every credit source, purchase, refund, and ending balance. Results: 1,246 wins, 155 losses, and three explicit 600-second policy timeouts. These are selected-policy outcomes, not a human win rate.

**No numerical balance change is justified for 0.3.** Starting credits, passive/unit income, bounties, wave bonuses, refunds, prices, health, damage, cooldowns, speeds, armor, and wave schedules remain unchanged. Simulation changes only add copy-isolated accounting counters. The retained 108 specialist/economy and 36 early-call regression runs still pass.

The two-Bush/Astro/TARS foundation intentionally stops at fourteen purchases. Its automatic-wave mean ending balances are 1,395 / 2,030 / 2,315 credits across Canyon / Bridge / Nest. Continuing the same foundation with Falcons reduces those balances to approximately **104 / 450 / 735**, buys five/six/six Falcons, records actual hit events, preserves all sampled wins, and shortens missions by roughly four to seven seconds. Buying continues until about 106–132 seconds instead of stopping near 48–52 seconds. Late spending is useful but optional after an already successful formation.

Economic investment still has an opening cost: two-Tree plans delay their first gun to 10 seconds and all-lane armed coverage to 24 seconds; Bush plans buy a gun immediately and cover all lanes around 15 seconds. Early calls give at most 68 total credits in Canyon or 120 on the other maps under aggressive scripts, while removing preparation and passive-income time. Cheap and rigid Falcon-saving plans become less reliable with aggressive calls. Salvage can preserve resources but requires real replacement spending and attention.

The evidence favors clarity and later mission-design research over blanket income cuts, health increases, Falcon discounts, or upgrades. Multiple specialist, mixed, economy, piercing, and barrier/splash policies win all maps. Optional spending is not proven irrelevant, and human enjoyment cannot be inferred from synthetic wins.

Three rigid replacement policies stall when a Tank passes a column-zero defender's forward firing gate and the bot continually buys another blocker there. They are recorded as timeouts, never wins. One already appears in 0.2 research. This milestone explains forward fire but does not rewrite collision/targeting to compensate for a bot loop; stronger passed-threat guidance is a 0.4 candidate.

## Artwork and animation

All six aliens now have Expedition illustrations. New **Sprinter**, **ManHunter**, and **Gargantua** cutouts share left-facing lane perspective, matte painted shapes, navy contour shadows, warm eyes, and terracotta/teal/plum relationships. Sprinter is long and light, ManHunter tall and angular, Gargantua broad and quadrupedal. They are distinct silhouettes rather than recolors. Astro and TARS remain illustrated; seven defenders and Bridge/Nest scenery still use retained school art.

The new served group is **568,457 bytes**, proportionally resized to a maximum side of 512 pixels with transparent alpha. Exact visible-foot origins and display dimensions live in `src/game/art.ts`; no destructive crop or stretch is used. Visible feet share the same ground line. Health bars sit below it inside the correct lane, avoiding tall crests attaching visually to the lane above. Tank plating retains its separate outline. Full-resolution sources and a rejected experiment remain outside `public/` and production builds. [Prompts, source IDs, hashes, alpha measurements, conversion, and evaluation](../public/art/expedition/README-0.3.md) are preserved; school sprites/team credits remain intact.

One authored opposite-contact Sprinter frame was generated and evaluated. It barely changed the useful stride while repainting body contrast, risking flicker. It was rejected and is not loaded by the game. No full animation-sheet claim is made. The chosen implementation keeps procedural motion: a quick Sprinter gait, slower ManHunter lean, and low-frequency Gargantua weight. Gargantua's close-contact ring anticipates the next recurring strike over the last 0.3 seconds of the existing cooldown, with a static contact cue under reduced motion. This creates no extra grace period or damage rule. Existing recoil, impacts, bounded effects, and school animation remain. All timing reads simulation game time, respecting pause, 2× speed, and reduced motion.

## Asset loading and measured performance

A focused `assets.ts` module computes required map/style assets. Initial Canyon loads only its background, active Expedition cutouts, remaining school defenders, and ammunition. Original comparison sheets, other maps, and acid terrain wait until needed. Opening the destination selector loads its thumbnails; the first Bridge selection then needs the acid texture. Successful textures/animations stay cached through switches and restarts.

Art/destination changes are transactional: pause, show a native loading dialog, load missing resources with bounded request timeout/retry, then apply. A failed batch keeps the same map, style, credits, units, and clock paused. Retry fetches missing files; Keep current mission restores the prior presentation. A hidden document never auto-resumes. A destination resets progress only after its required artwork succeeds. Initial failures retain the existing retry-before-play behavior.

| Local measurement                               |            Baseline 0.2 |          Expedition 0.3 |
| ----------------------------------------------- | ----------------------: | ----------------------: |
| Initial unique gameplay image payload           | 4,159,355 B / 47 images | 1,778,361 B / 24 images |
| Three first-playable times                      |      871 / 719 / 710 ms |      870 / 703 / 587 ms |
| Median / 95th-percentile frame gap, 45 s combat |          16.7 / 33.4 ms |          16.7 / 33.3 ms |
| Observed JavaScript heap                        |            26,597,888 B |            28,902,976 B |
| Canvas count after five restarts                |                       1 |                       1 |

The supported improvement is **57.24% less initial image payload** (2,380,994 bytes), despite three new aliens. Local startup and frame delivery remain broadly similar; no meaningful FPS/startup/heap improvement is claimed. The first map-selector/Bridge transition adds 133,663 bytes for both thumbnail backgrounds and acid. Nest selection next and return to Canyon add zero new unique image payloads in that sequence. This does not mean both maps preload before opening the selector.

Measurements used three cold browser contexts and a real earned-currency fourteen-purchase combat plan in local headless macOS ARM64 Chromium, 1280×800, without network/CPU throttling. Image response bodies include renderer XHR and CSS, excluding duplicate blob decode URLs. They are not total application wire bytes. Frame/heap samples are not controlled-GC GPU-memory measurements or physical-phone/max-density benchmarks. [Raw JSON, runner, methods, and limitations](../reports/expedition-0.3/performance/README.md) make these distinctions explicit.

## Agent-driven browser assessment

The agent used actual visible browser controls, earned credits, normal 1×/2× controls, and legal map cells. No hidden-state purchases, artificial game-clock acceleration, or fabricated participants were used. Final completed runs used two Bushes, six Astros, and six TARS, respecting Nest acid gaps.

| Final mission / viewport | Outcome | Cleared / shields | Game time | Credits / call bonuses | Receipt                          |
| ------------------------ | ------- | ----------------- | --------- | ---------------------- | -------------------------------- |
| Canyon / 1280×800        | Victory | 33 / 3            | 1m 42s    | 1,257 / 22             | 14 deployed, 0 lost, 1,020 spent |
| Bridge / 768×1024        | Victory | 36 / 3            | 2m 14s    | 1,792 / 32             | 14 deployed, 0 lost, 1,020 spent |
| Nest / 390×844           | Victory | 38 / 3            | 2m 34s    | 2,173 / 18             | 14 deployed, 0 lost, 1,020 spent |

Canyon receipt reconciles `230 + 600 supply + 800 growth + 625 bounty + 22 calls − 1020 = 1257`. Bridge reconciles `230 + 780 + 1100 + 670 + 32 − 1020 = 1792`; Nest reconciles `230 + 900 + 1250 + 795 + 18 − 1020 = 2173`. No browser warning/error appeared in these final QA sessions.

Baseline and intermediate interrupted assessments are not difficulty evidence: Canyon and Bridge were left under-defended while the agent read files, leading to defeats; a later Bridge opening was also interrupted before all piercing support was bought. Those failures did exercise defeat/restart feedback. The final table describes the complete actively managed missions. Browser observations establish control behavior and visual readability, not first-time-human comprehension, fun, or preference. Independent human sessions completed: **zero**. The [15–20 minute five-participant protocol](PLAYTEST_PROTOCOL.md) includes objective understanding, first deployment timing, income/counter comprehension, early-call tradeoffs, defender choices, boredom/overload, and desire to replay.

### Visual evidence

Screenshots are actual browser captures, outside public build assets. They show different moments and formations; they are qualitative presentation comparisons, not pixel-identical performance experiments.

| Before                                                                             | After                                                                                              |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [0.2 tablet assessment](../reports/expedition-0.3/visual/before-bridge-tablet.png) | [0.3 Bridge combat: Sprinter, Tank, Grunt](../reports/expedition-0.3/visual/bridge-wave-three.png) |
| [0.2 phone assessment](../reports/expedition-0.3/visual/before-nest-phone.png)     | [0.3 phone overview and full details](../reports/expedition-0.3/visual/nest-phone-combat.png)      |

[New ManHunter in combat](../reports/expedition-0.3/visual/bridge-combat.png), [enlarged phone heavy encounter](../reports/expedition-0.3/visual/nest-heavy-pan-phone.png), and the [Canyon](../reports/expedition-0.3/visual/canyon-victory-receipt.png), [Bridge](../reports/expedition-0.3/visual/bridge-victory-receipt.png), and [Nest](../reports/expedition-0.3/visual/nest-victory-receipt.png) outcomes provide additional context. The heavy-encounter capture catches an existing hit flash; it is not a separate Gargantua skin.

A separate built-production smoke check verified placement, art switching, and destination transitions without browser errors. A [larger production encounter](../reports/expedition-0.3/visual/production-heavy-combat.png) shows Sprinter, ManHunter, and Gargantua together without hit flashes. This additional presentation run deliberately kept only six Astros and ended in defeat (23 cleared, 1m 52s); it is distinct from the complete specialist victories above and illustrates the need for plated-enemy counters.

## Browser/device matrix and automated verification

| Environment                                    | Scope                                                                                                   | Result / limit                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Local Chromium 156, macOS ARM64                | All 22 scenarios; rendered canvas screenshot                                                            | 22 passed                                                                                |
| Local WebKit 27.2, macOS ARM64                 | All 22 scenarios; rendered canvas screenshot                                                            | 22 passed; this is Playwright WebKit, not the Safari app or iOS                          |
| Local Firefox 157, macOS ARM64                 | Launch attempted with normal and alternate temporary profile roots                                      | Cannot launch: “Could not find profile folder”; no local page-level Firefox pass claimed |
| Linux GitHub Actions                           | Chromium, Firefox, WebKit, 22 scenarios each                                                            | Exact pushed revision verification recorded in Git delivery below                        |
| 390×844 / 768×1024 / 1280×800                  | Agent-operated phone/tablet/desktop views                                                               | Full mission per map; no physical hardware claim                                         |
| Emulated touch 390×844, landscape 844×390      | Tap far tile, automatic pan, crew scrolling, 44px controls, zoom, pause/restart, no page-width overflow | Included in each engine's automated suite                                                |
| Physical Android/iPhone/iPad and native Safari | Unavailable                                                                                             | Outstanding                                                                              |

There are **88 Vitest tests**, up from 80, including asset-plan completeness/deferral, accounting conservation and isolation, coverage, refunds, income timing, and reset. Prior fixed-step, schedule, spawn-warning, wind-up, armor, splash, income, and balance coverage remains. Strict TypeScript and production build pass. No dependency was added or upgraded. Package version is 0.3.0.

There are **22 browser scenarios per engine**, up from thirteen. New tests cover required-image deferral/caching, slow loading pause/commit, failed comparison cancel/retry with state preservation, failed destination recovery, first-play guidance, emulated touch/landscape, audio gestures, real outcome receipts, and repeated art/motion/pause/restart lifecycles. Existing deployment, keyboard, map restrictions, crew roster, guide, focus, art switching, motion preference, wave calls, and initial-load failures remain. Tests inspect visible UI and intercepted network behavior; they do not mutate hidden simulation state. Both local engine canvas screenshots were inspected and show the painted battlefield rather than an empty canvas.

```sh
npm run check
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers npm run test:e2e -- --workers=1 --project=chromium --project=webkit
node scripts/research/economy-0.3.cjs
```

CI installs all three engines and keeps the Firefox project enabled. The local profile-launch failure is not hidden by skipping Firefox globally or disabling browser security.

The first Linux run passed 64 of 66 scenarios and exposed the same phone fit issue under different system-font metrics: TARS details ended at 852.95 pixels in Firefox and 844.94 pixels in WebKit, against the 844-pixel viewport. The noninteractive phone hint had enough unused vertical padding to recover 12 pixels. Reducing that padding preserves full text, battlefield dimensions, and 44-pixel controls; the existing viewport assertion remains unchanged. The follow-up pushed revision reruns the complete three-engine suite.

## Git delivery and preservation

Work remains on the existing `modernization` branch. Delivery commits separate illustrated assets/provenance, game implementation/tests, and research/documentation. Exact commit IDs and pushed-revision CI outcome are recorded in the delivery response; this document avoids embedding its own changing commit hash.

`master` and the peeled `school-project-2019` still resolve to `d5ba2c76aa7cf287b4b89b10ff35cc15a24d09fb`. Original Java source, school assets, generated Java docs, Eclipse/project files, XML, and presentation compare unchanged against the school tag. No Treydmark, hosting, account, backend, campaign, upgrade, or unrelated-directory change is included.

## Known limits and Expedition 0.4 priorities

1. Run five independent first-time-player sessions using the protocol before altering economy/difficulty again. Establish whether surplus feels earned and whether the last wave still creates decisions.
2. Test physical phones/tablets and native Safari, slower CPUs/networks, longer high-density combat, and production first-play behavior. Keep frame/memory claims bounded until then.
3. Improve feedback for a hostile that has passed a defender's forward firing position; investigate the documented replacement-policy stalls without silently changing directional rules.
4. Continue visual cohesion with a small high-use defender group and eventually Bridge/Nest illustrations. Seven defenders remain school sprites. Preserve readable silhouettes and original comparison.
5. Explore one genuinely registered authored action cycle if it improves on procedural motion; reject repaint flicker. The 0.3 alternate-stride trial is not a shipped animation.
6. Use playtest evidence to decide mission pressure/pacing variation before larger campaign/progression/upgrade/editor work. Current four-wave formations can reach a comfortable state; this is documented, not solved with artificial mandatory spending.
