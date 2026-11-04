# Autonomous release-clearance sprint

## 1. Executive summary

A separate Expedition-only engineering candidate now uses the existing browser codebase and authoritative simulation. Historical artwork stays in Git and the full development/comparison build. Public deployment, GitHub Releases, Treydmark/Labs/Vercel/DNS changes and participant contact are outside this sprint and have not occurred.

The release replaces all five historical projectile dependencies, uses an explicit runtime allowlist, carries contributor/runtime notices and omits unused historical/generated output. Rights clearance and product validation remain separate from this packaging result.

## 2. Frozen baseline

Baseline `4507737204724009d4a9d72c9626993541a27d26`, clean `modernization`, sole origin `https://github.com/tr3ylbry/TowerDefense.git`. Fresh baseline check: 223 rules, strict TypeScript and full build passed. Existing exact-head [three-engine CI](https://github.com/tr3ylbry/TowerDefense/actions/runs/41580626577) supplies the 228 browser checks; it was not rerun before editing. [Baseline inventory](../reports/release-clearance/baseline/inventory.json) hashes all 121 files/9,626,791 B. `master`/annotated `school-project-2019` remain unchanged. No unrelated uncommitted work existed.

## 3. Distribution architecture

`npm run dev` and `npm run build` retain full Original/Expedition comparison in `dist/`. `npm run build:release` uses Vite mode `expedition-release`, writes separate `dist-release/`, disables wholesale public-directory copying and emits only `scripts/release/assets.ts`'s authoritative runtime set. It derives required textures from actual loader plans plus six on-demand guide portraits, audio, favicon, credits and notices. No second application or simulation was created.

Release metadata contains no school background/sprite entries. The Original control is omitted entirely; its event hookup/render state is optional. Release credits explain the distribution boundary and keep all four contributors and working historical repository links. No instruction offers a missing comparison. Full mode retains Original portraits, all 419 animation frames, deferred loading, retry/cancel and presentation switching. Live projectiles change texture only when art mode changes; they remain the same simulation objects.

## 4. Projectile replacement

Five independently source-authored SVGs total 1,911 B, replacing 4,929 B of retained projectile PNGs in Expedition. Transparent 54×54 canvases render into the existing 27×27 world footprint: cream/mint standard slug, coral explosive capsule, staggered mint rapid streak motif, ice-blue piercing needle and cyan plasma core/ring. Silhouette and light/dark edges supplement color distinction across all three backgrounds. The rapid motif remains one simulation projectile.

[Source and exact hashes](../art-source/release-clearance/projectiles.json), [generator](../scripts/release/build-projectiles.py) and [visual review](../reports/release-clearance/visual/projectile-design-review.png) record provenance. No source image, external font, stock asset, generated-image service or recording was used. Existing impact/trail presentation, speed, damage, piercing, splash/collision geometry, wind-up, cooldown, projectile counts, targeting and events are unchanged. Original comparison uses its preserved PNGs.

## 5. Exclusions and preservation

All 67 unresolved school raster derivatives are absent from release output, including original scenery/acid, sheets, portraits, menus, Falcon imagery and five projectiles. Twelve unused generated rasters are also absent. Thus all 38 previously unused rasters are excluded (26 school + 12 generated), as are 41 additional school rasters used only for comparison or superseded projectile delivery. Total 79 excluded rasters/6,061,176 B. Eight historical public art READMEs are omitted from deployable output while source documentation remains in Git.

The exact exclusion list retains prior source records/use classification. Required Expedition portraits, map/acid textures, fallback/recovery paths, six atlases, notices and audio remain included. No original file, Java source, contributor credit, original documentation, presentation, historical tag or branch is deleted. All 67 historical derivative bytes and 419 Original frames are independently preserved; all 248 illustrated poses and atlas bytes remain unchanged.

## 6. Package inventory

| Measurement | Baseline full 1.1 | Expedition-only RC |
|---|---:|---:|
| Files |121|41|
| Uncompressed bytes |9,626,791|3,484,207|
| Rasters |104|25|
| Raster bytes |7,353,364|1,292,188|
| Animation atlases (included in rasters) |6|6|
| Atlas bytes |699,038|699,038|
| Audio bytes (gesture-deferred) |661,544|661,544|
| Projectile images |5PNG /4,929 B|5SVG /1,911 B|
| Unresolved school rasters included |67|0|

The current full comparison build has 127 files/9,630,982 B and retains 104 rasters. Relative to that current full output, 87 existing files are omitted and release build metadata is added; the baseline comparison above remains frozen to 1.1. The release also contains favicon SVG, four hashed code/style files, HTML, its minimal runtime manifest, build metadata, credits and full third-party notices. No source maps, test fixtures, research/recording artifacts, raw illustration sources, `.git`, `node_modules`, environment files or private configuration are emitted. Every required resource must exist; unexpected files or any retained school raster fail verification. Package savings are distinct from initial-transfer savings because deferred comparison/unused files were not initial downloads.

## 7. Runtime dependencies

Same-origin static HTML/JS/CSS, required illustrated assets, small manifest and gesture-deferred original audio only. No account/backend/API key, remote font/CDN, analytics or cloud save is introduced. Version 1 local campaign/motion storage remains compatible. Moving origin creates a separate browser-local save; no cross-origin migration is promised. Full mode intentionally remains a development/historical comparison output and is not the rights-minimized deployment target.

## 8. Rights and identity findings

[Rights report](../reports/release-clearance/assessment/RIGHTS.md) and [per-file inventory](../reports/release-clearance/assessment/rights-inventory.json) classify documented source-authored assets/notices, generated families needing terms/design review, excluded history and the retained TARS identity recommended for replacement/review. Paramount's official record evidences the specific TARS/Interstellar association. Historical Millennium Falcon imagery is excluded; Frontier Flagship remains the independently designed playable ship, with factual history retained in credits. No speculative prohibition is inferred for ordinary words, military roles, mythology or generic science-fiction concepts.

Owner decisions remain: TARS public identity/design; applicable generated-illustration terms and design acceptance; original contributor/code/game/design redistribution scope; final historical/branding copy and Treydmark publication authorization. Credit is not permission. Generated provenance is not automatic rights clearance. No contributors were contacted and no license/permission was invented.

## 9. Gameplay parity

The deterministic simulation, complete content/mission/challenge definitions, campaign/save code and pose selector remain byte-identical to 1.1. The reproducible standalone study compares 36 seeded full runs, schedules, stepwise states/events, earned actions, early calls, pause/speed/restart and wins against frozen browser baseline `5647f09b44520af8a0d7382b3532ac2c8362c914`. The only historical display-name normalization in that existing comparator is Astro Joe X.

Production journeys retain six earned campaign victories, sequential unlocking, ratings/replay/lost replay, Next navigation, save/reload/corruption/storage/reset behavior, all three standalone maps and acid restrictions. First Contact Hard remains opt-in/default Normal, deterministic, separate from 1×/2× speed and isolated from Normal awards/unlocks. Mixed-roster release journeys deploy all nine with actual earned credits, exercise all five projectile families and receipts in three Normal standalone maps plus optional First Contact Hard. Paused phone/landscape/reduced-motion captures supplement active desktop combat; they are not physical-device validation.

## 10. Audio and interface regression

Audio implementation and style sheet remain unchanged from the stabilized 1.1 source. Required regression covers default-off FX/Music, both 65% defaults, independent gains, real decoded looping across two actual boundaries, single-source playback, interruption/resume, cancellation/retry and backgrounding. Mix pause ownership, prepaused/completed/backgrounded states, rapid reopen, Escape/focus return and destination changes remain checked.

Release controls retain actual enabled-state seafoam feedback, typography/capitalization, centered action groups, left aligned tools, keyboard grid/navigation, Unit Stats, Salvage, Focus/Overview, pause/speed/wave calls, resize/text enlargement and reduced motion. The initial exploratory release run exposed a test selector choosing the hidden phone-only Guide shortcut before play; the visible public Guide control is now used. A second exploratory run corrected two new-test assumptions: native same-origin SVG Blob decodes were initially treated as HTTP asset paths, and Hard was incorrectly expected to populate the Normal-star rating. The corrected tests instead constrain all HTTP paths/origins and explicitly require Hard victory, no Normal rating/Next unlock and no campaign save. All corrected focused checks pass; no application assertion was weakened. Both failed exploratory records remain explicitly preliminary evidence.

## 11. Performance and loading

The paired production probe alternates serial fresh baseline/release navigations, three samples per build at normal conditions and at 4× CPU/150 ms/200,000 B/s down/75,000 B/s up. It measures actual enabled Begin readiness, actual network entries/body bytes and source-bound build metadata. See [performance evidence](../reports/release-clearance/performance/startup.json) for exact samples and conditions. Do not carry forward 1.1's earlier measured startup improvement as a new sprint result.

Measured initial game imagery changes from 917,115 B to 914,097 B, a 3,018 B/0.33% saving; the much larger package reduction is mainly deferred/unused material. Measured total initial transfer including navigation changes 1,334,289 → 1,329,624 B (-4,665 B), with 37 resource/navigation entries and 28 unique requests in both builds. Normal readiness medians 163.2 → 163.6 ms and constrained readiness 7,670.7 → 7,664.1 ms show effectively unchanged startup; these tiny timing differences are not claimed as a speedup. The inherited 900,000 B image target remains 14,097 B over, explicitly unresolved rather than silently raised. All six complete atlases remain. A separate real Heart of the Swarm candidate attempt used earned purchases of all five gun families, public 2× speed/early calls and barriers. It reached 21 actual hostiles, 239 dense frames and a legitimate defeat after 41.1 seconds, with zero page errors; median/p95 frame intervals were 16.7 ms and dense p95 was 16.8 ms. This intentionally aggressive diagnostic is not victory/progression evidence or a rendering-speedup/memory claim. [Raw dense-combat record](../reports/release-clearance/performance/dense-combat.json) and its screenshot retain the exact build boundary.

## 12. Automated verification

Reproduce with `npm ci && npm run verify:release` (pinned browsers installed; Python 3/Pillow for preserved image validation). It runs rules/types, both builds, actual output/exclusions, 36 standalone parity runs, 248-pose/419-frame/history checks and actual release production browser journeys. `npm run test:e2e` retains all 76 full-development scenarios per engine. The release target selects 61 production scenarios per engine, retaining shared gameplay/audio/save checks and adding explicit distribution/combat coverage; Original-specific comparisons and dev-only anatomy fixtures remain in full mode rather than being falsely offered by release. No test is skipped or discarded from the full matrix.

CI adds a separate Chromium/Firefox/WebKit two-shard production release matrix with clean lockfile installs, real virtual audio output and retained JSON/hash evidence. Its required aggregate is 228 full-development + 183 release checks. The [verified release matrix](../reports/release-clearance/verification/ci-release-summary.json) records 183/183 passing production checks at exact source `6c3734e61c6120e34646e902f327a5e68f56d0b9`, with zero skipped/flaky/unexpected results. Every one of the 41 output files from all six Linux jobs matches the isolated clean Mac build. The [complete 12-job CI record](../reports/release-clearance/verification/ci-summary.json) confirms228/228 full-development checks as well:411 passing browser checks, with228 unique rule tests, strict TypeScript and both builds passing. [Exact-revision CI run](https://github.com/tr3ylbry/TowerDefense/actions/runs/41757618436). Preliminary/local records are not substituted for CI. The first source push exposed a shallow-checkout setup error in frozen parity; release jobs now fetch full history/tags and the complete corrected run succeeds. The local Firefox Mac profile-launch limitation remains an environment fact; mandatory Linux Firefox CI is the cross-engine verification path.

## 13. Candidate build and hosting

`npm run build:release` writes `dist-release/`. After committing and rebuilding a clean exact revision, `npm run package:release` verifies output, refuses dirty/stale source and writes a deterministic `release-artifacts/astronauts-vs-aliens-expedition-rc.1-<revision>.zip`, archive SHA256 and `candidate.json` with exact Git/web-tree revision and every file hash. Generated builds and archives remain ignored, not committed or published. A clean isolated Node 24.14.1 lockfile install reproduces all 41 files, and a second build/package produces the same archive hash. Negative checks reject dirty source, a stale source revision, a build made while dirty, unexpected output and a stale extra hashed code chunk. [Reproduction evidence](../reports/release-clearance/verification/reproducibility.json) records their exact source/hash boundaries. The local `candidate.json` and ZIP checksum are the authoritative artifact record; a report cannot embed its own future containing-commit hash without a circular dependency.

The actual extracted candidate ZIP passes Chrome 156 and WebKit 27.2 smoke journeys at `/site/` on an ordinary local Python static server, including guide imagery, Nest, placement, FX/Music and Mix pause ownership; all HTTP resources stay inside the subsection and there are no page errors or HTTP failures. [Artifact smoke evidence](../reports/release-clearance/verification/archive-smoke.json) pins this to the same clean source. Later authorized hosting serves only ZIP `site/` with intact relative resource paths and correct JS/CSS/SVG/WebP/WAV types. The current SVG loader performs native same-origin Blob image decodes, and the interface sets dynamic inline styles; any later host CSP needs explicit compatibility checks for those existing behaviors. No hosting policy was changed here. Use a trailing slash for a subsection; revalidate HTML/unhashed assets/manifests/build info and reserve immutable caching for hashed chunks. Retain credits/notices. Treydmark owns hosting, publication path, cache/CSP integration and approval. No game release archive is uploaded as a public GitHub Release or deployed by these commands.

## 14. External testing handoff

The [short handoff](../playtest/RELEASE_HANDOFF.md) reuses the original protocol and five anonymous pending rows. It includes an owner-sent invitation, authorized local-build access rather than an invented URL, 15–20minute first-time tasks/questions, consent/privacy notes and anonymous observation guidance. Real-phone checks target touch/portrait/landscape/pan/Stats/Salvage/Mix/interruptions/backgrounding/extended play/text enlargement. Live VoiceOver/NVDA/TalkBack checks target campaign/cards/grid/credits/shields/threats/pause/waves/results/save warnings and actual speech/focus. Technical keyboard/semantic/emulation checks are not spoken-output or device evidence.

## 15. Remaining approvals

Five independent sessions remain 0/5. Final physical-phone interruption/long-session behavior and spoken screen-reader validation remain pending. The owner's prior iPhone 17/Safari feedback is genuine but applies to earlier documented revisions and does not count as independent first-time playtesting or final candidate approval. Rights/identity/team/generation and publication decisions remain in section 8. No autonomous permission inference replaces them.

## 16. Readiness decisions

**Engineering distribution: conditionally ready.** The exact implementation revision passes all required automated matrices and produces a clean reproducible candidate. The final documentation/verification handoff is rebuilt from its own clean Git revision, with the generated source/hash record identifying that artifact. Correct inclusion/exclusion and preserved gameplay/animation/audio/save implementation are testable engineering deliverables; the retained 14,097 B image-budget exception and external device/assistive-technology observations are explicit limitations.

**Public release: not ready.** Excluding historical artwork removes 67 deployable permission gaps but does not settle retained TARS identity, generated-design/terms acceptance, contributor redistribution scope, independent playtesting, final real-device/spoken-output checks or Treydmark publication approval. A candidate is not authorization to distribute publicly.


## Git and final artifact boundary

Six logical implementation commits follow the protected 1.1 baseline: `e03ecb5` (projectiles), `f940055` (distribution/production verification), `d750c56` (clean provenance/rights reproduction), `53d52fd` (both-output/unknown-rights audits), `ec67da3` (native SVG/Hard assertions), and `6c3734e` (complete CI history). They are pushed to the independent repository's existing default `modernization` branch. The subsequent documentation/evidence commit also strengthens stale-chunk exclusion, makes projectile regeneration restore full-mode manifest entries, adds offline-tool tests to the documented verification sequence, and retains source-bound performance/archive diagnostics. It does not change game/render/audio/save sources, asset bytes, browser scenarios or wave rules.

The committed CI evidence is pinned to `6c3734e61c6120e34646e902f327a5e68f56d0b9`. Its clean archive is 2,302,000 bytes with SHA-256 `5ca1a0c2215bc9181cf3f7fedb4b724b2eda982eedaf6f8be7658fd6f098e29f`; the repeated-build record proves that source's artifact. The final containing revision gets its own fresh archive/source/checksum and CI checks, reported in the generated local `release-artifacts/candidate.json` and final handoff. Build metadata necessarily changes between commits; application asset/code bytes remain independently comparable. Generated ZIPs stay out of Git and no public Release is created.
