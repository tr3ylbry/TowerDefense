# Expedition 0.5 production performance investigation

This directory contains repeatable browser measurements, not physical-device claims. The baseline is the untouched production build of `96f8297cc88be416d4e5d49270b7f623f44881b3`, built and frozen at `/private/tmp/ava-expedition-05-before/dist` before Expedition 0.5 app edits began. All baseline production-file SHA-256 hashes are recorded in `before.json`; the frozen directory is temporary and is not required to reproduce the measurement from that commit.

## Method

The [measurement runner](../../../scripts/research/reliability-0.5.mjs) records three cold browser contexts per condition, resource timings, unique image response-body bytes, browser main-thread counters, a public-control Nest combat plan, art/map transitions, and five restarts. The separate [diagnostic runner](../../../scripts/research/profile-0.5.mjs) captures startup trace-event aggregates and instruments standard WebGL creation/deletion/upload APIs to observe bounded texture retention. Neither script changes private simulation state, credits, clocks, targeting, or combat rules.

Host: Apple M5, macOS ARM64, Node 24.14.1, Playwright headless Chromium 156.0.8078.4, viewport 1280×900. The local control has no artificial CPU/network limit. The constrained condition uses 4× CPU slowdown, 150 ms latency, 200,000 B/s down and 75,000 B/s up. This matches the previous milestone's emulation profile. No other combat/test suite should run during the captures.

Startup is measured by an observer timestamp when the actual Begin mission control becomes enabled with its playable label. This is more precise than the previous milestone's host-side navigation/control-wait timer (which included automation overhead). Compare the new before and after samples with one another; do not claim that the change from the historical 0.4 timing definition is an optimization. The readiness marker is a DOM state, not a human-perception or first-composited-frame measurement.

Unique image payload counts each successful image URL once. Resource request rows also contain CSS portrait requests and Phaser XHR requests for the same URL; cached/revalidated requests can have a nonzero encoded-body size without retransferring that body. Use `transferBytes` to assess actual same-origin transfer, and the unique-response-body sum for initial artwork payload. Vite preview applies HTTP compression to JavaScript/CSS: decoded file size is not its network transfer size. ResourceTiming's transfer count includes browser-reported overhead and is not a packet capture.

`Performance.getMetrics` samples main-thread counters when the automation observes readiness; it can include a small amount of post-marker work. Trace-event durations can nest or overlap across threads and must not be summed into exclusive wall-time shares. Standard `texImage2D` wrapper duration measures synchronous dispatch, not GPU completion. Explicit `HTMLImageElement.decode()` counters do not include implicit browser decodes; the trace provides additional decoding evidence where exposed.

The dense plan buys two Money Bushes, six Astro Joes, six Moon Zeus and six far-right Asteroids using earned credits at 2× speed in The Nest. RAF gaps are sampled only during active waves 3–4, and include public-control automation overhead. The final-wave captures show the measured formation. This is a repeatable specialist formation rather than every cell occupied or every possible projectile mix.

Heap measurements do not force garbage collection and exclude GPU/native memory. Texture counters and one canvas after bounded warm-cache transitions/restarts support lifecycle correctness, not proof that all possible leaks are absent. No thermal, low-memory suspension, native Safari, Android/iOS hardware, remote-hosting, or worst-case FPS claim is made.

## Reproduction

Build the desired revision and copy its `dist/` to a dedicated absolute directory, then serve that frozen directory without rebuilding it during measurement:

```sh
npm run build
./node_modules/.bin/vite preview --host 127.0.0.1 --port 4174 --strictPort --outDir /absolute/frozen/dist
# Separate terminal, with the repository's existing Playwright browsers installed:
node scripts/research/reliability-0.5.mjs before /absolute/frozen/dist
node scripts/research/profile-0.5.mjs before
```

Use `AVA_PERF_URL` for a different owned preview URL. `AVA_PERF_STARTUP_ONLY=1` skips missions/transitions for a bounded diagnostic rerun. The full before/after runs use the complete protocol. Browser installation can be selected with the standard `PLAYWRIGHT_BROWSERS_PATH`; this environment used `/private/tmp/ava-playwright`.

## Frozen 0.4 baseline results

Completed raw evidence: [before.json](before.json), [profile-before.json](profile-before.json), [normal combat](combat-before-local-control.png), and [constrained combat](combat-before-constrained.png).

| Measure                                       |                  Local control |                    Constrained |
| --------------------------------------------- | -----------------------------: | -----------------------------: |
| Precise readiness samples                     |               171 /156 /147 ms |      14,798 /14,803 /14,804 ms |
| Median readiness                              |                         156 ms |                      14,803 ms |
| Unique initial images /body bytes             |                23 /2,369,834 B |                23 /2,369,834 B |
| JS transfer /decoded body                     |         381,000 B /1,438,749 B |                           Same |
| Image transfer reported by ResourceTiming     |                    2,379,434 B |                           Same |
| Total initial transfer including navigation   |                    2,772,199 B |                           Same |
| Startup main-thread TaskDuration samples      |               513 /473 /458 ms |         1,850 /1,900 /1,798 ms |
| First original-art switch /new unique images  |                     296 ms /27 |                  14,905 ms /27 |
| Three subsequent cached switches              | 162 /188 /216 ms; 0 new images | 326 /299 /299 ms; 0 new images |
| Dense Nest purchases /outcome                 |                    20 /victory |                    20 /victory |
| Dense combat wall duration                    |                        83.879s |                        84.112s |
| Late-wave RAF sample count                    |                          1,994 |                          1,391 |
| Median /p95 frame gap                         |                  16.7 /33.4 ms |                  33.3 /33.4 ms |
| Frame gaps above 50 ms                        |                              5 |                              6 |
| Heap before /after five restarts              |       42,422,828 /36,381,276 B |       27,316,048 /29,098,636 B |
| Canvases after five restarts /uncaught errors |                           1 /0 |                           1 /0 |

The total transfer includes the navigation document, three JS files, CSS, manifest, and all image resource entries available by readiness. It includes browser-reported per-request overhead; sums of encoded-body sizes would incorrectly count cached image bodies twice. In the first constrained sample the last JS response ended at 7,710 ms, the last image at 14,753 ms, and readiness at 14,798 ms. Images account for approximately 86% of reported initial bytes. Large portrait downloads compete with the compressed Phaser module before Phaser begins scene-image requests. This supports artwork delivery as the main optimization target in this emulation profile. It does not imply that Phaser's initialization is free or that every real device has the same bottleneck.

The separate startup diagnostic recorded implicit image decoding at 21.2 ms normal /84.9 ms constrained (28 trace events), module evaluation at 21.3 /81.4 ms, and synchronous WebGL upload dispatch at 27.9 /109.5 ms. Those event sums are not exclusive and uploads can include implicit decoding; do not add them into a synthetic startup total. No explicit `HTMLImageElement.decode()` calls occurred. Phaser disables its own audio system, and the original synthesized sound bus creates an AudioContext only after the player enables sound; there are no audio downloads to optimize.

Initial ready-state texture handles were 47. After the first all-map/style warmup there were 77 active handles, then 77 /77 after the next two cycles in both conditions. Created and deleted handles continued to balance during cached transitions; a new canvas was not introduced. This is expected finite cache growth, with no increasing live-handle trend across these bounded cycles. The observer holds texture handles during its diagnostic; unforced heap samples remain noisy and are not a GPU-memory or leak-proof result.

Selecting Bridge after opening the selector added three unique images (school background thumbnails plus acid); Nest then added none because its original-background URL was already cached. All map selections returned 230 ready credits. All four paused art switches preserved the bank. Timings include public-controller and network-idle overhead, and selector thumbnail work can precede the selection timer.

## Offline compression experiment

The [reproducible experiment](../../../scripts/research/compression-0.5.py) and [all per-file bytes, hashes, settings, and full-resolution pixel checks](compression-candidates.json) evaluate the 11 existing cutouts. Production files and high-resolution generation originals were not modified by this experiment. Candidate images remain in `/private/tmp/ava-expedition-05-compression/` for the integrating developer's visual review rather than adding 99 duplicate image files to the repository.

The already-installed `cwebp` executable could not run on this ARM64 host (`Bad CPU type in executable`). Existing Pillow 12.2.0 /libwebp 1.6.0 provided encoding without adding a project dependency. All variants use method 6; lossy variants use lossless alpha quality 100 and `exact=True`. Downsampled candidates use proportional LANCZOS, with the largest side 384 or 320 pixels. No crop, recoloring, illustration edit, sharpening, or alpha removal was performed.

| Eleven-cutout format          | Total bytes | Reduction from original PNGs |
| ----------------------------- | ----------: | ---------------------------: |
| Original PNGs                 |   2,175,882 |                            — |
| Full-resolution lossless WebP |   1,493,600 |                        31.4% |
| Full-resolution q85 WebP      |     406,920 |                        81.3% |
| Full-resolution q90 WebP      |     477,960 |                        78.0% |
| 384 px lossless WebP          |     998,480 |                        54.1% |
| 384 px q85 WebP               |     297,342 |                        86.3% |
| 384 px q90 WebP               |     345,884 |                        84.1% |
| 320 px lossless WebP          |     733,266 |                        66.3% |
| 320 px q85 WebP               |     230,278 |                        89.4% |
| 320 px q90 WebP               |     266,626 |                        87.7% |

All 11 full-resolution lossless files decode to exactly the original RGBA pixels. All 22 full-resolution q85/q90 files preserve every alpha pixel; RGB changes as expected. Premultiplied RGB PSNR for full-resolution q90 ranges 35.8–42.3 dB, a diagnostic rather than a visual-acceptance criterion. The existing 1672×941 Canyon WebP is 159,894 B; a 1080×608 q85 candidate is 87,406 B (45.3% smaller). Recoding already lossy scenery changes pixels, so the byte saving alone does not authorize accepting the candidate.

Recommended candidate for field review is 384 px q90: it retains ample source resolution above the renderer's approximately 55–122 world-unit silhouettes and reduces the old cutout group by 84.1%. The Ranger candidate was inspected in isolation with clean edges and readable equipment; final acceptance requires all characters against the actual maps, enlarged battlefield, and original/Expedition comparison. The 320 px candidates are smaller but are not automatically preferred merely for bytes. New roster illustrations and new environments add payload, so none of these old-group reductions is presented as a completed whole-game startup improvement.

## Integrated Expedition 0.5 after measurements

Completed evidence: [after.json](after.json), [profile-after.json](profile-after.json), [normal final-wave capture](combat-after-local-control.png), and [constrained final-wave capture](combat-after-constrained.png). Both captures were visually inspected: the mixed formation, barriers, acid restrictions, enemy health and projectiles remain legible against the new Nest scenery.

The final runtime was frozen at `/private/tmp/ava-expedition-05-after-phone-overview-fix/dist`. Its [source boundary](after-source-boundary.json) records 16 runtime/configuration source hashes and four built bundle hashes. All 16 source hashes matched the working runtime before measurement. The measurement JSON also records every frozen production-file hash. `sourceCommitAtCapture` is `78cb5669b866b25fb6b02473d2a9e2ee3b948beb`, the committed mobile-layout baseline with the final incoming-summary flex/min-width repair still uncommitted at capture. This is not a claim that the measured working build equals that base commit. The source boundary and bundle hashes identify the measured implementation. The final [capture-integrity check](capture-integrity.json) matched all 16 source files, four frozen bundles and 99 production artwork/manifest files to the working tree, with no mismatches. Later documentation, tests or source-preserving Git commits do not alter these measurements; any subsequent runtime change must be checked against the boundary or measured again.

The [first complete after capture](prior-to-phone-header-fix/README.md) is retained unchanged under its earlier source boundary. A [header-only refresh](interrupted-header-only-refresh/README.md) was deliberately interrupted when actual Linux text-scaling screenshots revealed additional mobile clipping; its partial data and runner closed-page diagnostic are historical evidence, not final metrics or a product loading failure. The main-directory after files were regenerated from the final inspected mobile layout. The completed mobile-layout capture immediately preceding the final overview repair is preserved at [pinned commit 78cb566](https://github.com/tr3ylbry/TowerDefense/tree/78cb5669b866b25fb6b02473d2a9e2ee3b948beb/web/reports/expedition-0.5/performance), including its raw data, source boundary and integrity check; it is not duplicated in another raw-data folder. The clean 0.4 before data remains unchanged.

The after build includes all nine defenders and six aliens, three Expedition environments, new acid art, 384 px q90 WebP cutouts, 1080 px q85 scenery, concurrent manifest/renderer initialization, actual file-progress loading feedback, the ordinary-dialog visibility guard, enlarged-field layout repair, wrapping phone header/help controls, content-height mobile ready/pause panels and the incoming-summary width repair that keeps the original 390×844 overview details visible. No gameplay stat or schedule change is part of this comparison. Measurements retain the original 1280×900 viewport; separate browser assertions and screenshots validate the mobile-only corrections.

| Startup/transfer measure              |                    Before |                  After | Interpretation                                                |
| ------------------------------------- | ------------------------: | ---------------------: | ------------------------------------------------------------- |
| Normal readiness samples              |          171 /156 /147 ms |       157 /156 /150 ms | Same practical range                                          |
| Normal median readiness               |                    156 ms |                 156 ms | No meaningful fast-host improvement claim                     |
| Constrained readiness samples         | 14,798 /14,803 /14,804 ms | 5,990 /5,987 /5,986 ms | Same profile and observer                                     |
| Constrained median readiness          |                 14,803 ms |               5,987 ms | **59.6% less time**                                           |
| Unique initial images                 |                        23 |                     21 | Complete roster replaces deferred school strips in Expedition |
| Initial image response-body bytes     |               2,369,834 B |              600,697 B | **74.7% smaller** despite completed visual scope              |
| Total reported initial transfer       |               2,772,199 B |            1,003,056 B | **63.8% smaller**                                             |
| Resource entries including navigation |                        38 |                     36 | Includes cached/revalidated duplicate image URLs              |
| JS reported transfer                  |                 381,000 B |              381,510 B | Phaser bundle hash unchanged                                  |
| Normal TaskDuration samples           |          513 /473 /458 ms |       507 /484 /466 ms | Cumulative browser counter                                    |
| Constrained TaskDuration samples      |    1,850 /1,900 /1,798 ms |       892 /906 /857 ms | Shorter startup window, not isolated initialization CPU       |

The first after constrained run finishes its last JS response at 4,193 ms, last image at 5,949 ms and reaches the DOM readiness marker at 5,990 ms. The before comparison was 7,710 /14,753 /14,798 ms. The large readiness reduction is consistent with substantially fewer image-transfer bytes and reduced competition between portraits and Phaser delivery. Concurrent import also removes the manifest-before-renderer dependency; this combined measurement does not isolate a separate causal percentage for that change.

Image decoding is **not faster** in these bounded diagnostics: trace totals are 23.8 ms normal /99.4 ms constrained after, versus 21.2 /84.9 ms before. WebGL upload-dispatch totals are 26.9 /114.1 ms after, versus 27.9 /109.5 ms before. Module evaluation is 21.5 /74.2 ms after, versus 21.3 /81.4 ms before. These overlapping/threaded trace totals reinforce that the major measured improvement is network delivery and readiness, rather than a claim of faster decoding, GPU processing or initialization. The normal first-ready state is essentially unchanged.

| Dense mission/lifecycle measure | Before normal /constrained | After normal /constrained |
| ------------------------------- | -------------------------: | ------------------------: |
| Purchased defenders             |                     20 /20 |                    20 /20 |
| Outcome                         |           Victory /victory |          Victory /victory |
| Combat wall duration            |            83.879 /84.112s |           83.857 /84.123s |
| Late-wave RAF samples           |               1,994 /1,391 |              1,979 /1,316 |
| Median frame gap                |              16.7 /33.3 ms |             16.7 /33.3 ms |
| p95 frame gap                   |              33.4 /33.4 ms |             33.4 /33.4 ms |
| Gaps above 50 ms                |                       5 /6 |                      1 /3 |
| Heap before five restarts       |   42,422,828 /27,316,048 B |  29,351,532 /22,054,684 B |
| Heap after five restarts        |   36,381,276 /29,098,636 B |  18,695,740 /12,739,304 B |
| Canvases after five restarts    |                       1 /1 |                      1 /1 |
| Uncaught page errors            |                       0 /0 |                      0 /0 |

These single mission samples show retained playability with similar sampled frame gaps. They do not establish a statistically meaningful FPS improvement, maximum-density guarantee, physical-device improvement or heap reduction. Different late-wave sample counts and unforced-GC heap values are retained rather than normalized away. The new four defenders are loaded/available, but this measured formation specifically uses Bush, Astro, Zeus and Asteroid; the separate art/browser reviews cover the complete roster.

The first Original comparison remains a substantial optional download: 436 ms normal /15,395 ms constrained, with 33 newly requested unique school images (previously 296 ms /14,905 ms and 27 images). Six more school images are now genuinely deferred because all nine Expedition defenders have illustrated replacements. This historical comparison is not included in initial-play payload and its slow-network cost is not presented as improved. All four paused art switches preserve the bank. The next three cached switches request zero new unique images and take 183 /167 /168 ms normal or 309 /285 /281 ms constrained.

After opening the selector, Bridge adds three unique images (the new environment previews and acid) and takes 353 ms normal /1,444 ms constrained; Nest then adds zero unique images and takes 126 /595 ms. Returning through Canyon and Nest remains cached. Every destination returns a ready 230-credit state. Selector preview requests can occur before the selected-destination timer, so these are public-control transition samples rather than exclusive download times.

## Texture retention, environment limits and next steps

The after diagnostic begins with 45 active WebGL texture handles versus 47 before. After warming all three Expedition maps and both Canyon art styles, live handles stabilize at 81 /81 /81 after the three cycles in both conditions, versus 77 /77 /77 before. The completed asset set increases the finite warm cache, with no upward trend after the first cycle. Created/deleted counts continue to balance and exactly one canvas remains. This diagnostic does not cover the full Cartesian product of every map in every style; ordinary browser regression coverage verifies those flows separately. It is not a GPU-memory or absence-of-all-leaks proof.

The [bounded local Firefox probe](local-firefox.json), run after timing with the standard launch API and no changed browser preferences/security flags, still fails before page creation with `Could not find profile folder.` Its [reusable probe](../../../scripts/research/probe-firefox-0.5.mjs) preserves the diagnostic. Linux CI remains the Firefox validation route. Playwright WebKit is not native Safari. Physical Android/iOS/tablet, thermal and memory-pressure sessions, network variability outside this fixed profile, native Safari and real independent player sessions remain outstanding.

The practical optimization is delivered without cache infrastructure or runtime dependencies: smaller production images, preserved generation/source artwork, selected-environment loading, deferred school comparison and concurrent independent initialization. Preserve those boundaries for 0.6. Future mission growth should avoid preloading every campaign background or retaining an unbounded number of unique scenes; the current three-map cache does not justify speculative eviction/save infrastructure now. Native-device field testing and independent usability sessions remain more valuable than further speculative rendering rewrites.

Owned temporary production preview 4174 was stopped after these measurements; the user's active 4173 development preview was not rebuilt or closed by this task.
