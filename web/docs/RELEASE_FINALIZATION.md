# Release finalization — Augie / RC.2

## Baseline and scope

The frozen predecessor is `82f311315f1860899f88cedae9005658b5fad8ae`: 228 rule tests, 411 browser checks, 41 release files/3,484,207 uncompressed bytes, zero school rasters. Its reports, local rc.1 ZIP, `candidate.json` and `VERIFICATION.json` are preserved. [Baseline checksums](../reports/release-finalization/baseline.json) identify those local records. Earlier expedition/release-clearance conclusions are historical, not silently rewritten.

This sprint changes current robot identity and release verification/documentation only. No simulation, economy, damage, cooldown, penetration, projectile count/speed, mission schedule, campaign/save schema, audio, animation framework, raster/SVG bytes, dependency or hosting changes are intended. Both existing builds still use one simulation.

## Augie implementation and compatibility

`src/game/identity.ts` is the shared public-name authority, avoiding a content/mission import cycle. The existing `TOWERS.tars` definition reads **Augie**, with the description “Precision armor-piercing rounds ignore Tank plating.” Cards, accessible purchase labels, selection, Unit Stats and placed-cell descriptions inherit it. Tank guidance, Normal tactics, Hard briefings, Field Guide and result recommendations use the same name. Current browser tests expect Augie in both builds, including when displaying Original art.

All `tars` gameplay keys, sprites, filenames, ammunition references, registration and research identifiers remain compatible. The robot still costs 100, has 450 health, deals 48 damage every 0.95 seconds after a 0.15-second wind-up, fully bypasses plating and uses the same speed-8 ammunition. No public name replacement is applied to school Java, school documentation, credits, original presentation or past reports/prompts. Full Original-art comparison remains available.

## Character and identity review

The full-resolution robot and recorded original prompt were inspected. The single cabin torso, carry handle, amber sensor, separate short legs and asymmetric tool/gripper are a distinct utility-robot design within the cream/mint/navy roster. No concrete issue justified repainting or regeneration. The [new provenance addendum](../art-source/release-finalization/augie.json) preserves hashes and records this limited visual assessment. The owner's Augie decision is implemented; it is not pending another naming discussion. Owner acceptance of included designs and applicable rights remains separate.

Frontier Flagship retains its original modern name/design. A targeted copy/roster review found no additional specific franchise identity requiring a rename. Its factual historical school-name reference remains explicitly historical in credits. This is not exhaustive intellectual-property clearance. [Current rights findings and unsent contributor draft](../reports/release-finalization/RIGHTS.md) distinguish current identity, historical naming, generated-output terms, team contributions and public repository preservation.

## Rights inventory and source verification

All 25 delivered WebPs are matched to final conversion records with verified input/delivery hashes and existing generation records. Six articulated atlases retain 248 poses; nine defender derivatives retain their compact delivery bytes. Five projectile SVGs remain independently source-authored. Music/FX remain source-synthesized. The automated rights inventory now records Augie's owner-selected public name/stable key and removes the superseded naming-replacement recommendation, while retaining generated-design/terms acceptance as unresolved.

All 67 historical school rasters and 12 unused generated derivatives remain excluded. The new checks do not infer legal permission from provenance, source hashes, credits or repository visibility. Team contributions include the preserved project and adapted roster/game/content structure beyond old images; no broad project license or explicit contribution redistribution grants were located. Modern-game distribution and the already-public historical repository need separate owner/contributor scope decisions. Both dependency MIT notices and all four contributor credits remain included.

## Build integrity and package

`npm run build` keeps complete Original/Expedition comparison. `npm run build:release` creates only the explicit Expedition runtime allowlist in `dist-release/`. Candidate metadata and packaging read `scripts/release/candidate.json` (`rc.2`). The runtime still contains 41 files, 25 rasters/1,292,188 bytes, six atlases/699,038 bytes, the same 661,544-byte music, five projectile SVGs, HTML/code/styles, manifest, favicon, credits and dependency notices. Exact total bytes and per-file hashes are measured after the final clean build; do not reuse the rc.1 total for changed text/code.

The audit rejects missing/unexpected files, stale extra code chunks, school rasters, incorrect candidate metadata and the old capitalized robot identity in executable/public release copy. Lowercase compatibility paths and factual historical source documents are not falsely treated as current names. Every generated archive contains `site/`, `BUILD.json` and `SHA256SUMS`. Packaging refuses dirty or stale source. RC.2 manifests use the archive's version/revision-specific filename and do not overwrite rc.1's generic handoff records.

Only `site/` is intended for later authorized static hosting. Retain relative paths and trailing-slash subsection semantics, media types, credits/notices and compatible native Blob image decoding/dynamic styles. Revalidate unhashed HTML/art/audio/manifests/build metadata; immutable caching is appropriate only for hashed chunks. Origin changes create separate local saves. No account, backend, API key, remote font or CDN is introduced. Hosting/CSP/cache configuration remains an explicit deployment handoff, not changed here.

## Gameplay and animation preservation

The preservation tool compares rule/campaign/pose source with frozen 1.1 bytes. For `content.ts`, `missions.ts` and `challenges.ts`, only the exact reviewed import/name/description/guidance edits in `presentation-changes.json` are permitted; it does not broadly ignore text fields or numeric definitions. All other covered source bytes stay identical. The existing 36 seeded standalone stepwise parity runs allow only explicit public-copy changes, then deeply compare definitions, schedules, snapshots and events. Historical school source, all 67 original derivatives, 419 Original frames and every articulated atlas remain checked.

The complete browser suite retains earned campaign progression through six wins, replay/stars/Next/save corruption/reset, three standalone maps, all nine defenders/six aliens, mixed projectiles, defeat/economy/armor/Salvage/wave calling, and optional isolated Hard. New identity coverage checks Augie cards, accessible labels, Unit Stats, guide, tactics, keyboard placement and full-build Original comparison. No existing project or functional assertion is disabled.

## Verification and exact-revision evidence

Use `npm ci`, install the pinned Playwright browsers, then run `npm run verify:release` and `npm run test:e2e`. Python 3/Pillow is required for the retained preservation checks. The required matrix is **230 rule tests**, **77 full scenarios × three engines = 231 checks**, and **62 release scenarios × three engines = 186 checks**, totaling **417 browser checks** across Chromium/Firefox/WebKit. The six full and six release CI shards remain mandatory. Four offline animation-tool checks and all 36 standalone parity runs remain required.

Audio regressions retain real decoded seamless looping, default-off FX/Music, both 65% defaults, independent gains, toggle state, retry/interruption and Mix pause ownership. Responsive/accessibility regressions retain desktop/tablet/portrait/landscape, text enlargement, touch targets, keyboard/focus, live-region semantics, reduced motion and result controls. Browser emulation is technical regression evidence, not physical-device or heard-speech validation.

The first finalization CI attempt at `8d908e1` exposed a stale phone-test expectation for the robot’s previous description. The UI already showed Augie and the intended new copy; the expectation was updated to that exact copy while retaining the same scrolling, bounds and placement assertions. A subsequent release shard at `c451c37` exposed the old hardcoded rc.1 metadata expectation in the three viewport journeys. Those cases now assert the shared candidate identifier and additionally require a clean build, preserving all resource/control/layout checks. These superseded runs are not final-pass evidence.

The final containing Git revision cannot embed its own future commit/archive hash. Exact final results therefore live beside the versioned local candidate in `release-artifacts/VERIFICATION-rc.2.json`, including the exact CI URL/revision, all job conclusions, source/output hashes, independent extracted-archive checks and reproducibility comparison. The final delivery links that exact run. The [workflow](https://github.com/tr3ylbry/TowerDefense/actions/workflows/browser.yml?query=branch%3Amodernization) retains raw per-shard JSON, actual release/full inventories, rights, provenance and preservation evidence. This document describes required coverage; only completed exact-revision receipts establish its final pass status.

## Independent archive and reproduction

After a clean exact-revision build, `npm run package:release` writes a local versioned rc.2 archive, checksum and JSON inventory. Extract that actual ZIP, verify every `site/` checksum, serve its parent with an ordinary static server, and run `scripts/release/archive-smoke.mjs` against its `/site/` URL. It checks real imagery, guide, destination/placement, Augie, FX/Music/Mix and relative runtime requests; it writes new ignored evidence, never the rc.1 committed smoke report. Rebuild/package from an isolated clean checkout with lockfile dependencies and compare every file and archive SHA-256. Candidate/verification records identify the actual final revision and distinguish emulated coverage from real devices.

## Device, assistive technology and performance boundaries

The existing [human/device handoff](../playtest/RELEASE_HANDOFF.md) is updated for Augie and rc.2; the original five-player system and pending participant rows are reused. Prior genuine owner phone observations are historical and do not count as independent sessions or final-candidate approval. No connected physical phone was established: the installed CoreDevice command timed out initializing its service. Available computer-use observation offers UI/accessibility text and images, not supported observation of spoken screen-reader output. No VoiceOver speech result is inferred or invented. Final phone and actual speech validation remain external; no system accessibility setting was toggled merely to imply completion.

All raster/SVG/atlas/audio payloads and delivery bounds are unchanged from rc.1. Initial imagery remains 914,097 bytes, including the inherited 14,097-byte exception to the 900,000-byte target. The earlier approximately 7.66-second constrained startup is a baseline observation, not a new benchmark or speedup. No memory/frame-rate improvement is claimed from renaming.

## Owner checklist

The Augie name is already selected and implemented. Remaining external actions are:

- [ ] Accept the reviewed Augie design, included generated roster/environments and historical publication copy; confirm which generation account/agreement applied and any unresolved input/design permissions.
- [ ] Settle contributor/legal redistribution scope for the modern continuation and separately decide the public historical repository approach. Use the unsent draft if appropriate; do not assume team consent covers third-party artwork. No license/visibility/history changes are authorized by this report.
- [ ] Complete five genuine first-time-player sessions with the existing kit; assess actual findings and fix any release-blocking defects.
- [ ] Validate the final candidate on iPhone Safari: portrait/landscape, touch, Unit Stats, Augie, Salvage, volume/Mix, interruption/background recovery and an extended session.
- [ ] Observe actual spoken game navigation with VoiceOver or another suitable screen reader; record missing/repeated announcements and focus barriers.
- [ ] Authorize the exact final package and hosting/release path, then hand it to Treydmark Tech for deployment and `/labs` integration.

Documentation completion does not mark these approvals complete. No contributor was contacted; no permissions or participant findings were manufactured. No public deployment, GitHub Release, DNS/Vercel/Treydmark/`/labs` change is part of this sprint.

## Readiness decisions

**Engineering distribution: conditionally ready, subject to the exact-revision verification receipt.** The autonomous deliverable is a reproducible, audited successor package with preserved gameplay and full comparison. The retained image-budget exception and unobserved physical-device/live-speech behavior remain explicit limitations.

**Public release: not ready.** The earlier robot naming dependency is resolved. Generated-design/terms acceptance, contributor/repository scope, genuine first-time observations, final phone/spoken-output checks and publication/hosting approval remain external. Automated success is not permission to publish.
