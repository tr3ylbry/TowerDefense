# Matched production loading and cache regression

Reproduce from `web/` with `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ava-playwright node scripts/research/profile-0.7.mjs`, serving frozen final 0.6 on port 4174 and current production `dist` on 4175 using the same locked Vite preview. `AVA_BEFORE_URL` / `AVA_AFTER_URL` override those URLs. Build both revisions before serving; never use a development page or an unfrozen baseline. The installed Chromium must match the pinned Playwright package.

The frozen baseline is `1d50373cc9cec50ac826840a03f61b77c736ff57`; its bundle hashes match the archived final 0.6 `afterBundles` exactly. Runtime changes are commit `f815c85564250cd0b37960318c255a47ade7d3a8`. `build-boundary.json` records both build inventories; `source-sha256.json` records the measured current source. Later documentation/research commits do not change this runtime.

Host: Apple M5/macOS 27.0.1; Chromium 156.0.8078.4. No other automated browser test ran concurrently. Three fresh contexts per condition/build, alternating before/after. Readiness uses a MutationObserver of the actual enabled Begin mission button and `performance.now()` from navigation, not a host wait timer. Constrained is CDP 4× CPU, 150ms latency, 200,000 B/s download and 75,000 B/s upload; normal is unthrottled. This is desktop emulation, not a physical phone/network.

| Measure                                |                  Frozen 0.6 |                         0.7 |
| -------------------------------------- | --------------------------: | --------------------------: |
| Unique initial image bodies            |        600,697 B / 21 files |        600,697 B / 21 files |
| Reported transfer including navigation |                 1,009,871 B |                 1,010,190 B |
| Normal samples, ms                     |       209.0 / 143.6 / 143.4 |       154.1 / 148.6 / 141.9 |
| Normal median, ms                      |                       143.6 |                       148.6 |
| Constrained samples, ms                | 6,036.7 / 6,026.2 / 6,042.4 | 6,036.8 / 6,045.0 / 6,036.1 |
| Constrained median, ms                 |                     6,036.7 |                     6,036.8 |

Transfer rises 319 B / 0.032%. The constrained median difference of 0.1ms is noise-scale; no speedup or meaningful slowdown is claimed. Normal results also vary by milliseconds. These small samples support preserved delivery behavior, not population latency percentiles. Image bodies are deduplicated by path because CSS portraits and Phaser can report the same encoded file twice. Transfer retains browser-reported headers/revalidation overhead and is not interchangeable with unique image bytes. Raw resource entries and all twelve samples are in `startup.json`.

## Repeated ready-state asset cycles

A separate all-unlocked storage fixture is used only to reach navigation targets, never as victory evidence. Public controls prepare six missions three times in Expedition and three times in Original (36 preparations), then return to Expedition. `cache.json` records the complete probe.

| Observation                               | Active WebGL texture handles | Unique image URLs |
| ----------------------------------------- | ---------------------------: | ----------------: |
| Initial Standalone                        |                           45 |                21 |
| Campaign board / same-environment mission |                      45 / 45 |           23 / 23 |
| Expedition complete cycles                |                 64 / 64 / 64 |      24 / 24 / 24 |
| Original complete cycles                  |              100 / 100 / 100 |      60 / 60 / 60 |
| Return to Expedition                      |                          100 |                60 |

One canvas remains throughout and no page errors occur. The same protocol's endpoints match 0.6. This is bounded cache evidence: temporary textures still allocate/delete, and handle counts do not measure GPU/heap memory or prove absence of leaks. Original artwork remains deferred until requested; no new first-play image is introduced. No frame-rate, decoding, physical-device memory, thermal or mobile-network claim is made.
