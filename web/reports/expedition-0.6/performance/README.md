# Expedition 0.6 delivery and cache evidence

`profile-0.6.mjs` compares the frozen final 0.5 production build (`5647f09`) with 0.6 runtime commit `ff1bc66`, both served by the same pinned Vite preview implementation on separate loopback ports. No other browser test ran concurrently during this measurement. Each sample uses a fresh Chromium context. Before/after samples alternate, three per condition. Readiness is a MutationObserver of the actual enabled Begin mission control, using `performance.now()` from navigation, rather than a host wait timer. Production and source boundaries are identified by the source hash inventory.

Host: Apple M5/macOS, headless Chromium 156.0.8078.4 (see raw browser value in JSON). Normal is unthrottled. Constrained uses CDP 4× CPU, 150 ms latency, 200,000 B/s down and 75,000 B/s up. This is a repeatable desktop emulation profile, not a physical phone or real mobile network.

| Measure                                |                  Frozen 0.5 |                         0.6 |
| -------------------------------------- | --------------------------: | --------------------------: |
| Unique initial image bodies            |        600,697 B / 21 files |        600,697 B / 21 files |
| Reported transfer including navigation |                 1,003,056 B |                 1,009,871 B |
| Entries including navigation           |                          36 |                          36 |
| Normal samples, ms                     |       219.4 / 144.0 / 144.5 |       172.9 / 144.7 / 145.6 |
| Normal median, ms                      |                       144.5 |                       145.6 |
| Constrained samples, ms                | 5,989.2 / 6,005.6 / 5,989.5 | 6,030.8 / 6,029.4 / 6,039.8 |
| Constrained median, ms                 |                     5,989.5 |                     6,030.8 |

Campaign functionality adds 6,815 reported bytes (0.68%) to initial delivery, without adding an initial image or resource entry. Constrained readiness changes by +41.3 ms / 0.69% in these samples. Normal variation is only milliseconds. This supports preserved initial loading efficiency, not a new speedup claim. The existing 0.5 image reduction remains intact.

`startup.json` preserves the raw entries and all twelve samples. Image bodies are deduplicated by path because CSS portraits and Phaser can create two resource entries for the same file. Actual reported transfer retains cache-revalidation/header overhead; it is not interchangeable with unique image file bytes. The normal and constrained cohorts agree on these byte/count measures. There is no new decode, GPU upload, heap or combat FPS speedup claim.

## Bounded campaign cache probe

A separate context uses a clearly labeled all-unlocked validated save fixture solely to reach navigation targets. It does not supply victory evidence. Thirty-six public ready-state mission preparations cycle all six missions three times in Expedition and three times in Original mode, followed by returning to Expedition. One canvas remains throughout; no page errors occur.

| Observation                            | Active WebGL texture handles | Unique image URLs requested |
| -------------------------------------- | ---------------------------: | --------------------------: |
| Initial standalone                     |                           45 |                          21 |
| Campaign board only                    |                           45 |                          23 |
| Same Canyon environment mission        |                           45 |                          23 |
| Expedition complete six-mission cycles |                 64 / 64 / 64 |                24 / 24 / 24 |
| Original complete six-mission cycles   |              100 / 100 / 100 |                60 / 60 / 60 |
| Return to Expedition                   |                          100 |                          60 |

Opening the board adds two existing scene thumbnails and no Phaser texture handles. The same-environment mission adds neither a URL nor texture handle. Other environments add their shared terrain/background resources only as needed. Original sheets remain deferred until comparison. After warmup, no additional unique image URL appears and handle counts plateau in both repeated sets. Temporary texture creation/deletion continues during redraws; this probe does not claim zero allocations. The finite cache plateau is bounded evidence, not proof of no leaks or measured GPU memory.

These handle samples are a different navigation protocol from the 0.5 profiler's 81-handle endpoint; do not report 100 versus 81 as a matched memory-regression measurement or compare unmatched snapshots as if equivalent. Renderer code, image bytes and asset plans are unchanged; actual native/device memory pressure remains outstanding. The first optional Original comparison retains its documented deferred cost; this milestone does not advertise an improvement to it.

Reproduce after building current `web/dist` and serving the frozen baseline/current builds on ports 4174/4175:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ava-playwright node scripts/research/profile-0.6.mjs
```

`AVA_BEFORE_URL` and `AVA_AFTER_URL` override the local URLs. Never point the baseline at an unfrozen current build. The script requires the pinned Playwright Chromium installed for that path. It instruments browser texture-creation/removal APIs and observes public controls; it never changes authoritative gameplay, credits, spawns or clocks.

The [earlier 484963d sample](prior-to-outcome-scroll-fix/README.md) remains archived with its raw values. It is not substituted for this final corrected-runtime measurement.
