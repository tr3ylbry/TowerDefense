# Expedition 0.3 browser performance evidence

## Result

Initial unique gameplay image payload drops **57.24%**, from **4,159,355 bytes / 47 images** at `2bb30a8` to **1,778,361 bytes / 24 images** in 0.3. This is a measured 2,380,994-byte reduction despite adding three illustrated aliens. Optional comparison sprites and unused environments no longer block the initial mission.

| Metric                                         |       0.2 baseline |     Expedition 0.3 | Interpretation                                                        |
| ---------------------------------------------- | -----------------: | -----------------: | --------------------------------------------------------------------- |
| Initial image payload, each of 3 cold contexts |        4,159,355 B |        1,778,361 B | Repeatable reduction                                                  |
| Unique initially requested images              |                 47 |                 24 | Includes renderer XHR and CSS portraits                               |
| First-playable times                           | 871 / 719 / 710 ms | 870 / 703 / 587 ms | Medians 719 / 703 ms; too small a sample for a meaningful speed claim |
| Median animation-frame gap, 45 s combat        |            16.7 ms |            16.7 ms | Broadly similar                                                       |
| 95th-percentile frame gap                      |            33.4 ms |            33.3 ms | Broadly similar                                                       |
| Frame gaps over 50 ms                          |                 20 |                 15 | No causal FPS improvement claim                                       |
| Observed JavaScript heap                       |       26,597,888 B |       28,902,976 B | No memory reduction claim                                             |
| Canvas count after 5 restarts                  |                  1 |                  1 | Lifecycle retained                                                    |
| Unhandled browser errors                       |                  0 |                  0 | Observed benchmark runs                                               |

## Reproduction and conditions

Run the same committed `scripts/research/browser-performance.mjs` against the desired checkout's local Vite server on port 4173:

```sh
PLAYWRIGHT_BROWSERS_PATH=/path/to/installed/browsers node scripts/research/browser-performance.mjs current
```

The optional label determines the report filename. Start the baseline server from a separate owned checkout at `2bb30a8`; invoke this same 0.3 script against it, then repeat against 0.3. The runner uses normal controls and earned currency: three fresh Chromium browser contexts for startup, followed by a 45-second 2× mission window deploying two Bushes, six Astros, and six TARS, then five restarts. It never edits hidden game state. Baseline and current raw JSON are checked in beside this report.

Measurements used local macOS ARM64, headless Playwright Chromium, a 1280×800 viewport, and no CPU or network throttling. The first-play timer starts before navigation and stops when the initial mission control is visible and enabled. It includes Vite development startup/module work; it is not a production-hosting benchmark. Local filesystem/network caches, host scheduling, and controller overhead affect timings.

Image bytes are decoded HTTP response-body lengths for unique `/art/*.png` and `.webp` paths, including Phaser XHR and CSS images. Internal `blob:` decode URLs are excluded so they are not counted twice. This is image payload, not compressed wire traffic, JS/CSS/manifest size, total application download, or GPU texture memory. Three initial repetitions produced identical byte counts.

Frame gaps are sampled from an observer `requestAnimationFrame` during normal combat. They include controller and host noise. A 45-second window exercises real attacks and effects but is not an exhaustive maximum-density stress test or physical-phone benchmark. CDP `Runtime.getHeapUsage` is a single uncontrolled-GC JavaScript-heap sample; it excludes native image/GPU memory. Retaining one canvas and bounded existing effect cleanup does not prove that every possible leak is absent.

## Destination and comparison loading

The first Bridge selector/selection in 0.3 adds `stage-two.webp`, `stage-three.webp`, and `acid-pool.png`: **133,663 bytes**. Both backgrounds are needed as selector thumbnails; only the chosen one is registered for gameplay. Selecting Nest next and returning to Canyon add zero new unique image payloads in this run. This does not mean Nest is preloaded before opening the selector.

School-only comparison sheets download on the first art switch. Subsequent successful switches reuse cached textures/animations. The automated browser suite separately aborts or delays required files and verifies pause, retry, cancellation, retained credits/map, and eventual completion. It distinguishes actual renderer downloads from browser-cached CSS requests.

## Limits

The evidence supports a smaller initial image download. It does **not** establish a meaningful local startup, FPS, memory, Safari/iOS, or physical-device improvement. Independent users, slower-device profiles, production network measurements, and longer high-density sessions remain useful future checks.
