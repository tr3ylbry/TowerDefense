# Expedition 0.5 — Visual completion, performance and player validation

## 1. Executive summary

Expedition 0.5 completes the illustrated roster and three-environment visual system, preserves the school comparison/history, and makes measured startup improvements without changing gameplay balance. Explosive Astro Joe, Startrell Cluggins, Money Tree and the original Frontier Flagship now match the other defenders; Bridge and Nest have illustrated scenery and a readable Expedition acid decal. One unsuitable wide flagship was rejected after field review and replaced with a compact edit.

Matched production measurements reduce initial imagery from 2,369,834 to 600,697 bytes and constrained median readiness from 14,803 to 5,987 ms. Normal readiness and sampled combat frame times are effectively unchanged. A reproduced ordinary-dialog background-resume defect and enlarged-phone-control clipping are fixed. The 0.4 terminal remains intact.

The implementation is complete within the available engineering environment. Independent human sessions, physical-device/native Safari/screen-reader validation and retained-art rights clearance remain external gaps. No campaign, saves, accounts, backend, hosting or publication were added.

### Bounded implementation plan

| Priority | Evidence at assessment                                                                   | Action                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| High     | Four school defenders and two school environments visibly mismatch the illustrated group | Complete the four defenders first, then Bridge/Nest; validate all roles on each field                    |
| High     | 0.4 constrained startup needed investigation                                             | Freeze 96f8297; measure production delivery/CPU/decoding/texture work; compare candidate image encodings |
| High     | Dialog control flow could remember resume intent across visibility changes               | Reproduce through public controls; invalidate stale resume intent and guard the close event              |
| Medium   | 0.4 card/terminal geometry already works                                                 | Preserve it, replace portraits consistently, correct stale attribution and comparison copy               |
| Medium   | Enlarged content may reveal responsive assumptions                                       | Stress-test mobile layout; fix actual overflow rather than hiding controls                               |
| External | No real first-time participants or usable native-device surface                          | Refine the existing five-session kit; keep results pending and agent evidence separate                   |

## 2. Remaining 0.4 pain points

| Finding                                                        | 0.5 status                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Four remaining school-style defenders                          | Completed and field-reviewed; complete nine-defender/six-alien Expedition presentation                    |
| Retained Bridge/Nest scenery                                   | Replaced in Expedition mode; school comparison preserved                                                  |
| Slow constrained initial load                                  | Measured and improved; optional first school comparison remains a sizeable deferred download              |
| Passed-enemy replacement loops                                 | Existing contextual advice, legal placements and exact directional geometry retained; no new rules change |
| Large late credit reserves / tactical engagement               | Still requires independent usability evidence; no arbitrary nerf or new sink                              |
| Authored animation inconsistency                               | No new sheets; simulation-driven procedural cues retained/refined                                         |
| Missing independent players / physical devices / native Safari | Still outstanding; no synthetic participant claims                                                        |

[Assessment and sourced identity review](../reports/expedition-0.5/assessment/README.md) separate confirmed code facts, visual observations and hypotheses. The 0.4 victory screenshot was formatting feedback, not a structured independent playtest.

## 3. Defender illustrations and provenance

The four new defenders have distinct roles: orange mechanical demolition equipment; an agile narrow rapid-fire scout; a taller five-pod cultivated Tree; and a compact three-weapon Flagship. Full silhouettes fit their registered display bounds and share alpha-derived ground anchors. Portraits use the same cutouts as the field. A complete `Record<TowerKind, ExpeditionArt>` now makes a missing future roster registration a type error.

The public browser label **Frontier Flagship** replaces the school-era franchise name. The internal `falcon` key, price, health, ammunition and combat behavior remain. Its original non-saucer lander design avoids franchise-specific hull features. This design/naming choice is not completed trademark/copyright clearance; historical attribution and comparison are not permission to reuse third-party imagery. See [the primary-source review](../reports/expedition-0.5/assessment/FLAGSHIP_IDENTITY.md).

[0.5 provenance](../public/art/expedition/README-0.5.md) links all prompts, tool output paths, eight untouched source PNGs, one edit reference, rejected prototype, conversion settings and SHA-256 inventories. The selected four defender derivatives total 162,478 bytes. All fifteen character derivatives total 508,362 bytes. Generated originals and rejected work stay outside public assets.

## 4. Bridge, Nest and terrain

Bridge uses an elevated slate/cyan platform and atmospheric structures. Background registration moves its perimeter rails outside the fixed playable rectangle; it does not resize the logical field. Nest uses low-contrast plum ground and peripheral alien formations. Canyon's composition is retained with a smaller encoded derivative. A pale-edged olive acid decal and dark-stroked X improve contrast without depending only on color.

The original twelve Bridge and sixteen Nest restrictions, six lanes, nine columns and collision geometry remain unchanged. Original mode restores school scenery/acid/character sheets without resetting deployments, health, credits or timers. Destination selection still deliberately starts a fresh mission, with the existing warning.

## 5. Before/after visual assessment

[Visual evidence](../reports/expedition-0.5/visual/README.md) contains actual public-control mixed formations on all three maps, the original wide flagship rejection, compact field review and enlarged-phone capture. These are different gameplay moments, not pixel-matched visual-diff measurements.

The earlier group mixed painted characters with four pixel/school defenders and dark retained scenery. The final group has consistent cream/mint/navy equipment, grounded silhouettes, distinct income/barrier/weapon roles and warm/cool/plum environments. Field review accepted the compressed assets after checking detail, right-facing equipment, neighboring cells, lane edges, acid markers, enemies, health indicators and projectile contrast. The first wide flagship appeared too low/small and was explicitly rejected. The compact replacement reads as a substantial one-cell lander.

The normalized crew-card grid and semantic economy terminal were retained. Comparison/credits copy now reflects all nine defenders, six aliens and three backgrounds. Initial guidance explicitly says guns fire right and should be placed left of approaching aliens; improved human comprehension remains a hypothesis to test.

## 6. Animation and interface fixes

- Startrell has smaller two-pixel recoil and short, small release flashes to control rapid-fire noise.
- Money Tree uses a restrained 3% growth cue on actual income; Bush retains its established cue.
- Explosive releases/impacts use warm shell accents; Zeus retains cool plasma presentation.
- One actual Flagship release drives three bounded muzzle flashes. Visual projectile height aligns with its drawn weapons; authoritative row/x collision, ammunition and damage are unchanged.
- Asteroid and landed Flagship remain stable rather than breathing. Pause, 2× speed and reduced motion retain their established clock ownership. No authored frame set was generated; the rejected 0.3 Sprinter experiment remains excluded.

A new regression first reproduced active play→Guide→background/return→close incorrectly resuming. Visibility changes now invalidate ordinary-dialog resume intent, and close checks current visibility. Guide, destinations, restart cancellation and credits are covered, including close while hidden. Existing artwork-transition protection remains.

A 150% CSS-zoom phone stress test exposed an unshrinkable destination group and clipped pause controls. The first Linux CI run then exposed header overflow that local system-font metrics had missed. An isolated Linux DejaVu reproduction measured navigation ending at 396.38 pixels in a 390-pixel viewport. The header now wraps; ready/pause instructions grow to fit the Start control; the threat row and full Enlarge label remain visible. The outcome ledger retains its bounded scroll frame. The next CI pass caught the compact-phone threat row consuming extra height; a flexible text column restores the existing below-the-fold limit while retaining the full Enlarge label. All fourteen existing/new Linux phone, narrow, pan, zoom and terminal scenarios then pass together, alongside related local tests and the strengthened control geometry assertions. [Linux before/after evidence](../reports/expedition-0.5/verification/linux-layout/README.md) records the exact failure and fix. This is a repeatable layout stress test, not native OS text-scaling evidence.

## 7. Performance measurements and decisions

[Full conditions, scripts and raw data](../reports/expedition-0.5/performance/README.md) compare a clean 96f8297 production build with the frozen 0.5 runtime. Each condition uses three fresh contexts on the same Apple M5/macOS/headless Chromium host. Constrained emulation is 4× CPU, 150 ms latency, 200,000 B/s down and 75,000 B/s up. Startup observes the actual enabled Begin control; it does not reuse the older host-wait timer as if both definitions were identical.

| Measure                               |                 Before |               After |
| ------------------------------------- | ---------------------: | ------------------: |
| Unique initial image bytes            |              2,369,834 |             600,697 |
| Total reported initial transfer       |              2,772,199 |           1,003,056 |
| Resource entries including navigation |                     38 |                  36 |
| Constrained readiness samples, ms     | 14,798 /14,803 /14,804 | 5,990 /5,987 /5,986 |
| Constrained median, ms                |                 14,803 |               5,987 |
| Normal readiness samples, ms          |          171 /156 /147 |       157 /156 /150 |
| Normal median, ms                     |                    156 |                 156 |

This establishes 74.7% less initial imagery, 63.8% less reported transfer and 59.6% less constrained readiness time under this profile. Normal readiness is effectively unchanged. The main practical change is proportionate 384 px quality 90 WebP cutouts and 1080 px quality 85 backgrounds, with exact alpha after resampling and preserved originals. Independent manifest/renderer downloads now overlap. No cache framework, runtime dependency, renderer rewrite or audio change was justified; audio remains lazy and opt-in.

Decode/upload work did not establish a speedup: implicit decode traces changed 21.2→23.8 ms normal and 84.9→99.4 ms constrained; synchronous WebGL upload dispatch changed 27.9→26.9 ms and 109.5→114.1 ms. These overlapping diagnostics are not exclusive wall-time shares or GPU-completion measurements. The improvement is delivery/readiness, not faster decoding or FPS.

Both matched 20-defender Nest missions won before/after. Final late-wave RAF median/p95 gaps were 16.7/33.4 ms normal and 33.3/33.4 ms constrained, effectively the same as before. Warm WebGL texture handles plateaued 81→81→81 after selected map/style cycles; five restarts retained one canvas and zero page errors. Heap collection was uncontrolled and GPU memory unmeasured: no all-leaks-absent or real-device performance claim is made.

The first optional Original switch still costs about 15.4 s constrained and requests 33 newly deferred school images; subsequent switches request zero new unique images. This cost is disclosed rather than hidden inside an initial-load improvement claim. Future campaigns should preserve selected-scene loading and avoid an unbounded cache.

## 8. Loading and recovery

Initial progress reflects actual Phaser file completion; play remains disabled until renderer readiness. It is not an invented byte percentage. Only the selected environment and Expedition roster are initially required. Original character sheets remain deferred; lazy destination previews can load when their selector opens.

Existing initial failure/retry, failed comparison/retry/cancel, failed destination rollback, cached switches, restart and backgrounded transitions remain covered. New cases gate an initial asset, check progress/disabled controls, traverse all map/style combinations and preserve every acid restriction. A failed transition retains the paused live mission. Closing an ordinary dialog after absence also requires explicit resume.

## 9. Gameplay and balance evidence

No price, income, damage, health, armor, projectile speed, aim threshold, collision, acid coordinate or wave schedule changed. [Rules parity](../reports/expedition-0.5/verification/rules-parity.json) verifies three authoritative game modules byte-for-byte against the frozen 0.4 candidate, all content exports apart from the Flagship display name, and 36 seeded spawn comparisons. [The reusable check](../scripts/research/rules-parity-0.5.mjs) runs with Node 24.

The existing 3,024-configuration 0.4 policy research remains applicable; it was not mislabeled as a new study or human finding. New public-control mixed formations use earned credits, all nine unit types, 20 purchases and 1,865 spending, then complete every map while preserving comparisons and reconciling the winning ledger. These are engineering regressions, not proof of enjoyment, optimal balance, mandatory spending or broad win rates. There is no evidence supporting arbitrary numerical changes or progression systems in 0.5.

## 10. Human validation

**Zero independent first-time sessions** were available or fabricated. The existing [five-person kit](../playtest/README.md), protocol and five pending blank CSV rows remain the single testing system. Instructions now distinguish startup from time-to-deployment, record cache/art/audio/motion conditions, separate spontaneous actions from questions/coaching, ask replay interest before prompted tasks, and include terminal comprehension. No participants were contacted, impersonated or inferred from agent runs.

## 11. Browser/device matrix

| Environment                                | Evidence and limit                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local Chromium /WebKit                     | Retained scenarios plus new complete-roster, map, slow-start, dialog, zoom and mixed-mission checks; actual field captures                                                 |
| Linux Chromium /Firefox /WebKit            | Full 33-scenario matrix, 99 executions; final run is attached to the delivered commit and linked at handoff                                                                |
| Local macOS Firefox                        | Standard bounded launch still exits before a page with missing-profile error; no security preferences changed                                                              |
| Emulated phone/tablet                      | Existing 390 px portrait/landscape, touch targets, pan/enlarge, all cards/details, wave controls, keyboard, motion and terminal checks retained;150% CSS-zoom stress added |
| Native Safari /real mobile /screen readers | Outstanding; no usable native/device surface was provided, and native-app access was unavailable during a locked-host check                                                |

Playwright WebKit is not native Safari. Desktop emulation is not physical touch, OS text scaling, thermal, low-memory or real-device network evidence.

## 12. Automated results and verification

The original 98 rule tests remain, with four added registration/environment checks: **102 total**. Strict TypeScript and production build pass. All 26 previous browser scenarios remain; seven new scenarios yield 33 per engine/99 in CI. Asset-failure routes, name assertions and a portrait URL assertion are updated to the actual new WebP/name while preserving their behavioral requirements. No assertion, browser or security protection was disabled to obtain a pass.

The first local full browser pass identified one stale `.png` portrait expectation; the actual WebP output was correct. Its exact URL assertion was updated and rerun. The dialog-resume and enlarged-content failures were implementation defects reproduced before their fixes, not silently discarded tests. [Verification details](../reports/expedition-0.5/verification/README.md) distinguish these corrections, measured boundaries and external limits. The initial Linux run passed all 33 Chromium cases and 32 each in Firefox/WebKit; both failures identified the enlarged header issue described above. After reproducing and fixing it, the existing geometry checks were strengthened rather than relaxed. A follow-up full run caught ordinary phone details exceeding the viewport; the compact threat-row correction is covered by the original overview constraint and the enlarged-layout case together. The retained multi-layout receipt scenario also exceeded its total 45-second budget once in Chromium CI. It now has 75 seconds for its full flow; the independent 35-second outcome requirement and all functional assertions remain unchanged. Final exact-commit CI results are authoritative at handoff.

## 13. Git delivery and preservation

Delivery uses the existing independent `tr3ylbry/TowerDefense` repository on `modernization`, organized as asset preparation, runtime/test integration, evidence/documentation commits, and a follow-up mobile-layout/evidence correction found by CI. Validated changes are pushed; exact hashes and final CI URL are reported at handoff. No other contributor repository is a push target.

Original Java source, source assets, documentation, contributor attribution and project configuration remain unchanged against `school-project-2019`. The `master` comparison commit and peeled school tag remain `d5ba2c76aa7cf287b4b89b10ff35cc15a24d09fb`; annotated tag object remains `de94c0c5097af2a8e2f7662a8ff538136dbb4aa7`. No school history is rewritten. Hosting/Treydmark/Vercel remain outside scope.

## 14. Remaining issues

1. Conduct the five genuine first-time sessions and retest any recurring direction, income, armor, pace or replay-interest issue.
2. Validate native Safari, real iOS/Android touch, platform text enlargement, screen readers and actual constrained hardware.
3. Resolve external provenance/permission for retained school images before public publication, including historical comparison and five small projectile images. The Flagship rename is not blanket clearance of every retained name/design.
4. The first school comparison remains a substantial optional slow-network download. Keep transactional progress/retry/cancel and avoid making it an initial-play dependency.
5. Heap/texture evidence is bounded; real memory pressure and GPU/native retention still need device observation.

## 15. Expedition 0.6 readiness decision

**Complete a small player/platform validation gate before making campaign implementation the next priority.** Visual completeness, deterministic rules, the asset boundaries and current engineering checks provide a strong foundation. Strategic depth has reproducible policy evidence, but first-time comprehension, enjoyment, native touch and real-device behavior still lack the evidence that should shape campaign pacing.

Minimum next work is the five independent sessions, native Safari plus at least one real phone, and fixes/retests for any blocking usability/platform findings. Public-release rights review is a separate release gate. No further roster/environment expansion or speculative framework work is needed to satisfy this recommendation.

After that gate, a restrained 0.6 foundation can separate mission IDs/waves from the three environment/geometry definitions, add a small number of missions per environment, define transparent mission ratings from authoritative completion data, and use versioned local save data with validation and a safe reset for corrupt/older saves. Keep existing selected-scene loading, deterministic seeds, early-wave semantics and accessible controls. Mission ratings should not reward arbitrary hoarding without player evidence. These are architecture considerations only: no campaign types, saves, ratings or progression infrastructure were implemented in 0.5.
