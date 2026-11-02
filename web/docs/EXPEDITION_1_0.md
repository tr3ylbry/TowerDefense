# Expedition 1.0 — Animation Validation, Gameplay Polish & Release Hardening

## Result and scope

The candidate refines Sprinter, accepts a contrasting articulated Gargantua pilot, formalizes the small offline authoring pipeline and measures its delivery/rendering cost. The six-mission campaign, three original standalone missions, all nine defenders/six aliens, Normal balance, version1 saves, stars and original school project remain. Hard remains one optional First Contact prototype. There is no public deployment, new mission, new roster, backend, dependency or rendering engine.

**Engineering decision: conditionally ready as a1.0 engineering candidate**, contingent on the delivered Git head passing the complete Chromium/Firefox/WebKit matrix. Local rules/build, focused browser checks, deterministic parity, validated assets and production performance support this decision. Native Safari completed a real three-shield Canyon victory; the final phone UI received a separate native readiness smoke check. The owner supplied genuine iPhone17/Safari feedback and the identified layout issues were corrected. Live VoiceOver output, final phone recheck/long-session measurements and independent-player checks remain gaps.

**Public-release decision: not ready.** Retained school/projectile/comparison art lacks documented provenance/permissions; final phone behavior/performance confirmation, independent players and live assistive-technology use remain incomplete. CI success does not resolve those gates. Treydmark Tech owns publication coordination; no website/hosting changes are included.

## Baseline and assessment

Clean `feae81d` on`modernization`,176 rule tests and production build passed before changes. A frozen0.9 build provides matched measurements. [Assessment/plan](../reports/expedition-1.0/assessment/BASELINE.md) classifies severity, confidence, cost and release impact. Known limitations: Sprinter's compact generated hip/tail variation and soft enlarged details; finite pose quantization; no human motion-quality review; atlas startup cost; synthetic Hard outcomes and one policy timeout; outstanding publication/device/accessibility evidence.

Confirmed presentation defects addressed: linear/abrupt Sprinter swing endpoints and Gargantua's late-cooldown impact cue. Gargantua previously moved as one static cutout. Phone testing also confirmed iOS emoji arrows, uncentered actions and vertically clipped landscape lanes. A paused briefing could stretch the Call button at enlarged text sizes. These targeted presentation defects are corrected; no high-severity campaign/save defect was established.

## Sprinter refinement

The accepted nine painted source parts and24 walk/eight idle/16 attack poses remain. Hermite horizontal swing now joins stance with matching velocity; sine-squared lift joins the ground with zero vertical velocity. Swing-only foot roll and a smaller .35px torso shift refine weight transfer. Idle becomes .25px breathing; attack contact/recovery/next-strike anticipation are eased with a slight preparatory lean. The head/torso/tail texture is stable, not regenerated per pose. Foot bounds remain104–105 against source ground105.

Walk stays locked to48world pixels of actual interpolated travel. Attack frame32 remains the real .75s cooldown reset; no damage is predicted. Reduced motion selects the same stable representative poses. The prior accepted118,434B atlas is archived outside public delivery, with the original authoring script/history intact. The refinement costs119,184B (+750B); more frames were not used as a quality claim. Enlarged detail and the earlier generated proportion differences remain visible limitations.

## Gargantua pilot and rejected approach

One built-in generated parts edit uses the existing Expedition Gargantua as its reference: same left-facing slate-violet broad quadruped, terracotta brow/ridges, amber eye, high shoulders and short tail. Five disconnected painted components form a torso and four complete limbs. [Exact prompt/provenance](../art-source/expedition-1.0/prompts.md) records the source/output ID; [conversion manifest](../art-source/expedition-1.0/gargantua-conversion.json) records hashes, geometry, gait and settings.

An initial upper/lower-limb slice/IK assembly produced visible seams, distorted extremities and unstable grounding; the validation gate rejected it. Its source preview is retained, never deployed. The accepted continuous scanline mesh preserves whole painted limbs, independently anchors their roots/ankles and applies restrained knee flex. It shares utilities without forcing Sprinter's biped skeleton onto a broad quadruped.

Gargantua has16 walk/eight idle/16 attack poses. Lateral four-beat LH→LF→RH→RF gait,75% stance,28px stride,3.5px swing lift and .3px torso weight transfer give three support feet and a slow≈1.56s cycle at the unchanged18px/s speed. Idle is restrained .22px breathing over3.2s. The heavy attack uses a4px body-driven contact lunge with planted feet, controlled recovery and anticipation of the next real1.2s damage tick. Ground bounds107–108 remain within one source pixel. Stable source pixels preserve shading/face; this is a generated derivative, not pixel-identical anatomy.

Agent visual review accepted identity, connected legs, grounding and restrained movement at world scale and enlarged across Canyon/Bridge/Nest, then in actual spawned combat and a dense mixed render fixture. Human naturalness/attack-readability preference remains unverified. [Animated walk](../reports/expedition-1.0/visual/gargantua-walk.gif), [attack](../reports/expedition-1.0/visual/gargantua-attack.gif) and [real combat](../reports/expedition-1.0/visual/real-both-combat.webm) distinguish fixtures from gameplay.

## Production/runtime architecture

[Architecture](ANIMATION_ARCHITECTURE.md) explains shared extraction, affine transforms, contact curves, two-bone geometry, continuous-limb mesh, packing/validation and anatomy-specific rigs. The build rejects incomplete/noncontiguous sequences, inconsistent RGBA geometry, empty/clipped cells, grounding beyond2source pixels and changed decoded alpha. Output bytes are published after encoding validation. Source PNGs/full atlases/previous assets remain outside`public/`; optimized WebPs alone enter play.

The runtime registry and pure pose selector read authoritative position, interpolation, elapsed time, attacking and cooldown. The existing Sprite is reused; no containers, per-limb objects/listeners/timers, animation-driven damage or independent gameplay clock. Pause freezes state,2× traverses the same distance/poses faster, reduced motion uses stable state poses. Original comparison retains school animations; static Expedition portraits/fallback remain. Required asset transactions, retry/cancel, cleanup and unique IDs are preserved.

Gargantua's contact ring now fades by age since the real damage reset over .18game seconds, replacing the late-cooldown cue. No animation frames enter the accessibility live region. A third alien needs its own reviewed parts/gait/configuration and measured budget, but no new renderer branch or general-purpose editor.

## Evidence and performance

[Visual index](../reports/expedition-1.0/visual/README.md) links four animated comparisons, world-size/enlarged/reduced-motion fixtures, dense mixed screenshot and unedited real gameplay. Real controls spend earned credits on barriers, use actual schedules/spawns and verify a100-health Gargantua strike before pause/style/motion/restart checks. No fake wins, money, enemies or simulation-time injection.

[Performance report](../reports/expedition-1.0/performance/README.md) retains raw measurements, conditions, hashes and caveats. Matched Chrome156 production builds:719,131→888,925B initial imagery;1,131,457→1,302,068B total initial transfer; constrained readiness6.686→7.542s (+.856s). Normal desktop median152.2→159.6ms is not a meaningful improvement claim. Sprinter119.2KB, Gargantua169.0KB; the second pilot has a documented loading cost.

Three serial runs each of50 Sprinters,50 Gargantuas and25+25 mixed keep16.7ms median intervals; mixed p95 rises16.8–16.9→18.2–18.4ms, zero sampled intervals>33.3ms.51 display objects remain; no runtime speedup claimed. Decode medians6.30/7.55ms; current sheet parsing≈8.1/8.4ms, excluding deferred GPU work. Warm real-app handles plateau47/66/102 across repeated environments/styles, one canvas/no errors. These are desktop render fixtures/retention indicators, not physical-phone FPS or memory-leak proof.

Provisional budget: roughly100–175KB/character with review above180KB; measured1280×600–720 atlases/160×120 cells; one Sprite/entity; p95≤20ms and<1%>33.3ms on this same fixture; initial imagery≈900KB/readiness≈8s ceilings on this profile. The candidate is near the imagery ceiling: future atlases should not all enter initial loading. Both current pilots occur in every mission and load reliably before Begin. A failed headless-shell WebGL probe is preserved separately; final measurements use default working Chrome graphics without weakening security.

## Hard, campaign and saves

[Research](../reports/expedition-1.0/research/README.md) reassesses216 Normal+216 Hard runs and exactly retains all0.9 outcome/economy/pressure/call fields. Normal210wins/5losses/1timeout; Hard175/40/1. Multiple specialists win, TARS is not mandatory; ordinary-fire-only fails all36 Hard runs. The only refinement names existing armor counters in the relay briefing. No balance correction is justified by synthetic evidence alone. Keep First Contact-only/opt-in, unchanged230credits/three shields/opening/stats, no extra rewards. Speed remains separate.

All1,296 Normal campaign policy results and36 frozen original standalone stepwise parity runs match. Existing six-mission progression, sequential unlocks, shield ratings, best-result retention, replay/loss behavior, Next navigation, save/reload, corrupt/unsupported data/storage failures, reset confirmation and settings isolation remain covered by the retained regression suite. Hard wins/losses never award/remove Normal stars or unlock missions; restart retains challenge, reviewing/leaving/changing missions restores Normal. No save-schema migration is introduced.

## Verification and remaining validation

| Environment/check               | Evidence/status                                                                                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest                          | 188 rule tests:176 baseline+12 new; actual damage synchronization, state/interpolation/reduced motion, atlas hash/registration/grounding and existing gameplay/save coverage |
| Offline build validation        | 4 Python tests, deterministic source-to-atlas rebuild, decoded alpha equality, no clipping and ground bounds                                                                 |
| Strict TypeScript / production  | Passed; pinned dependencies unchanged; fresh install/build also required by CI                                                                                               |
| New Chromium scenarios          | Three focused cases, including real combat and failed Gargantua atlas retry; Canvas fallback and installed Chrome WebGL paths                                                |
| Full Chromium/Firefox/WebKit    | 60 scenarios per engine expected:56 preserved+4 new. Exact final head/run/conclusions recorded in delivery; a queued/running job is not passed evidence                      |
| Mobile/keyboard/semantic checks | Retained phone/landscape/zoom/crew-scroll/focus/touch-target/layout, saved motion, visibility and save-warning tests remain; viewport emulation only                         |
| Native desktop Safari           | Safari27.0.1: real Normal Canyon victory,33 kills/three shields/1m52s, keyboard controls and comparison; final UI campaign-readiness smoke check                                               |
| Live VoiceOver                  | Owner confirmed startup/readout of Codex instructions; game focus/navigation/speech not validated. Initial off setting restored; native AX is separate                                     |
| Physical iPhone/Android         | Owner iPhone17/Safari: gameplay worked, real UI issues reported/fixed; final recheck, long-session/performance/backgrounding/text-size and Android pending                                                                                                                                |
| Independent first-time players  | 0/5 pending; existing kit usable, short animation/Hard handoff appended; no new tracker, invented people or recordings                                                       |
| Dependency advisories           | npm audit returned0 known advisories on2026-11-02; [snapshot](../reports/expedition-1.0/assessment/dependencies.json); not proof of security                                 |

All meaningful new behavior has assertions; existing engines and behavioral coverage are preserved. One0.6 next-mission text expectation drops the decorative arrow because it is now a hidden SVG, while retaining the exact mission title check. The bounded CI job timeout rises30→35min because0.9 already used about26min on software-rendered runners and1.0 adds another real-combat journey; no checks, assertions or engines are skipped. Final browser counts/run and Git SHA are associated with delivery rather than asserted before CI completes. The actual-combat recording was tightened after initial visual review showed Gargantua walking past an already-destroyed opening barrier. The final browser probe maintains barriers through earned-credit public actions and records an actual100-point health decrement, allowing for earlier crowd damage; a real simulation event independently attributes Gargantua damage/contact to frame24. A test author's incorrect method name was corrected to the existing`launchNextWave` API; no production combat API was changed.

## Phone feedback, native checks and CI corrections

The project owner played on a real iPhone17 in Safari through a temporary trusted LAN production preview. Gameplay worked in both orientations, but iOS rendered the font arrows as emoji, action groups lacked centering, and landscape required vertical scrolling to see all six lanes with the top controls. This is genuine returning-player/device feedback, not a first-time study or a measured device-performance pass. [Device notes](../reports/expedition-1.0/assessment/device-feedback.json) retain the limits; final screenshots/recheck are pending.

Shared decorative SVG arrows now preserve the same visual on platforms and stay out of accessible names. Primary/secondary/destination actions center their text/icon group. Focused landscape uses a compact44px-target toolbar and safe-viewport-sized overview without an internal vertical clip; Enlarge/Overview remains available for larger tiles and panning in either orientation. Small overview tiles are an explicit space tradeoff, not44px targets; enlarged mode supports precision. A regression case checks667×320,844×390,852×393, all six far-edge cells, rotation, placement, enlargement and centering. At150% phone page zoom, Call no longer stretches to the tall adjacent paused briefing.

[Native evidence](../reports/expedition-1.0/assessment/native-checks.json) separates the1.0 production Canyon victory from the final icon/layout build's campaign preparation smoke check. No new native Hard/save claim is inferred. Direct VoiceOver launch timed out and tool observations did not confirm output; the owner subsequently confirmed it started and read the Codex phone-preview instructions. Focus was in the chat, so this confirms startup, not spoken game navigation. The initial off state was restored. Live game screen-reader testing remains required.

The [first1.0 CI run](https://github.com/tr3ylbry/TowerDefense/actions/runs/41476246480) passed59/59 in Firefox and WebKit, but Chromium passed55/59. Three wave-choice checks spent a short2× call window inspecting layout/screenshots; the combat case assumed Gargantua reached a pristine barrier. [Timing reproduction](../reports/expedition-1.0/assessment/ci-timing.json) records the evidence. Layout review now pauses public gameplay before an immediate resume/call; contact observes a real100-point decrement amid crowd damage. Existing keyboard/call/focus/pause assertions are retained, with active/paused target bounds and a new mobile case added. Optional4× CPU throttling reproduces slow rendering without changing game time. CI now retains failed traces/screenshots for seven days. A fresh complete60-case matrix is required for the final head; the failed run is not relabeled green.

## Release-readiness matrix and handoff

| Area                                     | Decision                          | Evidence / next step                                                                                                    |
| ---------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Engineering/build/loading/error recovery | Conditionally ready               | Rules/build/focused checks pass; require final all-engine head green; retain visible retry and unchanged transactions   |
| Gameplay/campaign/saves                  | Ready within engineering coverage | Exact deterministic parity and retained real browser lifecycle/win/loss/save tests; human difficulty preference pending |
| Animation                                | Conditionally ready               | Two accepted bounded pilots, actual contact and recordings; independent visual preference pending                       |
| Performance                              | Conditionally ready               | Measured desktop/profile budgets pass; explicit +.856s constrained startup cost; real devices pending                    |
| Browser compatibility                    | Conditionally ready               | Complete automated matrix required; native1.0 Safari victory and final UI smoke check recorded                                                     |
| Accessibility implementation             | Conditionally ready               | Semantic/keyboard/reduced-motion coverage retained; live spoken-output session pending                                  |
| Real devices                             | Conditionally ready               | Real owner iPhone17 feedback incorporated; final recheck, backgrounding/text size/long-session performance remain pending                     |
| Player feedback                          | Blocked external check            | Recruit first-time players with consent; retain0/5 until supplied                                                       |
| Asset permissions                        | Blocked for public release        | 67 retained derivatives lack asset-specific permission evidence; resolve or exclude/replace deployable outputs          |
| Publication                              | Blocked pending coordination      | Treydmark Tech owns hosting/Labs/DNS/portfolio; no deployment authorized/performed                                      |

[Rights inventory/handoff](../reports/expedition-1.0/assessment/RIGHTS.md) covers100 raster files,67 retained school derivatives and33 generated derivatives, plus sounds, contributor material and identity references. Five retained projectiles remain in Expedition; Original comparison and unused public files also count as delivery. Original WAVs remain outside browser public assets. Frontier Flagship's independent design does not clear TARS, historical franchise material or other retained art. No legal clearance or contributor permission is invented.

Git delivery stays on`modernization` in logical commits, no rewritten history or collaborator-repo changes. Original Java/assets/docs/credits,`master` and`school-project-2019` remain protected. No public GitHub release, Treydmark modification or deployment is created.

## Post-1.0 direction

Collect genuine animation/attack and Hard comprehension feedback before expanding. If players value the motion and target phones support it, Scout is a reasonable small next pilot (clear gait, modest silhouette); Tank then tests rigid plating against articulated support legs. Neither is authorized for automatic rollout; ManHunter/Grunt/defender-wide animation waits for demonstrated value and production budget. Avoid auto-loading every future atlas.

Do not broaden Hard across the campaign from fixed-policy win rates. First establish whether people seek replay challenge, understand armor and early-call risk, and can return to Normal. Prioritize permissions, physical-device/live-AT validation and independent sessions over new missions or tiers.
