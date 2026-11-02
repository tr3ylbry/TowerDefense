# Animation delivery and rendering cost

Measured frozen 0.8 versus 0.9 production builds on the same local host. [Build hashes](build-boundary.json), [source hashes](source-sha 256.json), [raw startup samples](startup.json), [cache probe](cache.json) and [serial render/decode samples](animation.json) retain the boundary. Chromium 156.0.8078.4, Apple M5/macOS desktop; these are bounded local measurements, not a phone-performance guarantee.

## Cold readiness and download

Three fresh contexts per condition/version, serial and alternating before/after. Readiness observes the actual enabled Begin mission button. Constrained condition: 4× CPU, 150 ms latency, 200,000 B/s download, 75,000 B/s upload.

| Metric                                       |                0.8 |                0.9 |                                   Difference |
| -------------------------------------------- | -----------------: | -----------------: | -------------------------------------------: |
| Initial unique imagery                       | 600,697 B /21 URLs | 719,131 B /22 URLs |                        +118,434 B /one atlas |
| Total initial transfer, including navigation |        1,010,689 B |        1,130,850 B |                            +120,161 B,≈11.9% |
| Median normal readiness                      |           138.4 ms |           142.6 ms | +4.2 ms; three samples, no improvement claim |
| Median constrained readiness                 |         6,021.4 ms |         6,652.0 ms |                             +630.6 ms,≈10.5% |

The atlas is 48 cells of 160×120 in 1280×720. It adds one retained texture; nominal uncompressed RGBA pixels are 3,686,400 bytes (3.52 MiB). That arithmetic is not a measurement of VRAM, mipmaps or total application memory. The unchanged 21,120 B static Sprinter remains for portrait/fallback. Only this pilot is added, not future roster sheets. Every current mission needs Sprinters; only the selected environment/style loads, and Original mode defers the Expedition atlas.

The rejected 256×192-cell bake was 254,066 B. The selected display-scale bake is 118,434 B. PNG/raw parts stay outside public assets. RGB is lossy; alpha is verified exact against the baked PNG. Visual review, not byte count alone, selected the smaller version.

## Decode, initialization and dense rendering

Six blob-backed `Image.decode` measurements per image exclude fetch but include decoder initialization. Static median≈1.1 ms, atlas≈6.05 ms; the first static sample was 19.3 ms, retained in raw data. No claim is made that the larger atlas decodes faster. The synchronous Phaser atlas add/parse hook measured 7.0–8.1 ms (median 7.1 ms); deferred GPU work is not isolated by that timer. Creating 50 Sprites took≈0.4–0.5 ms.

The [render fixture](../../../tests/fixtures/sprinter-density.html) compares 50 old procedural cutouts against 50 pose-selected Sprites, including ten contact states. Two-second warmup, then about ten seconds of raw Scene-update intervals, three serial alternating samples each. No game simulation, videos, competing browser test or build runs during the final measurement. A prior development probe overlapped a short rules/build check and is retained separately in [animation-development-probe.json](animation-development-probe.json), excluded here.

| Metric                                      | Before                      | After        |
| ------------------------------------------- | --------------------------- | ------------ |
| Display objects                             | 51 (50 Sprites +background) | 51           |
| Fixture textures, including Phaser defaults | 5                           | 5            |
| Median frame interval, each run             | 16.7 ms                     | 16.7 ms      |
| p95 frame interval across three runs        | 17.9–18.1 ms                | 16.9–18.2 ms |
| Frames exceeding 33.3 ms                    | 0                           | 0            |
| p95 pose/update CPU time                    | ≈0.1 ms                     | ≈0.1 ms      |

Timer resolution and this small render-only sample do not justify a performance-improvement claim. It shows no material frame-delivery regression under the measured condition. Actual encounters have different projectiles/effects/UI work. No physical-phone FPS, total-memory or leak-free claim is made.

## Lifecycle and retention indicators

The public-control cache probe selects all six missions three times per style (36 ready-state selections), with an all-unlocked navigation fixture explicitly unrelated to victory evidence. Active WebGL texture handles: 46 initially, 65 after the Expedition environments, 101 after Original comparison; each warmed phase stayed stable on repeat cycles. One canvas remained and no page errors occurred. The previous baseline was one handle lower in each phase. Created/deleted transient handles rise together; this is not a VRAM/memory-leak proof.

New public-control browser coverage also exercises actual Sprinter combat, two Original/Expedition cycles preserving paused cell health/credits, reduced motion, three restarts with one canvas, one atlas request, and an aborted atlas download followed by successful retry. Existing tests retain slow/failed transition retry/cancel behavior and all-map restrictions.

Reproduce with frozen builds served on 4174/4175: `node scripts/research/profile-0.9.mjs`. Run `node scripts/research/animation-cost-0.9.mjs` against the development fixtures on 4173. Both use the installed Playwright browser. Do not run other browser suites/builds concurrently when comparing timing.
