# Expedition 0.4 production-build reliability measurements

[Raw completed measurements](reliability.json) and [reusable runner](../../../scripts/research/reliability-0.4.mjs).

## Conditions

Measured 2026-10-31 on local macOS ARM64 / Apple M5, Node 24.14.1, headless Playwright Chromium 156.0.8078.4, 1280×900. App source is game commit `da0798f59866cd23ae6fb59cab89218b9a4f6e57`. No game rules changed after this capture.

Use the production build, then keep its local preview running on port 4174:

```sh
npm run build
npm run preview -- --port 4174 --strictPort
# In another terminal, with Playwright Chromium installed:
node scripts/research/reliability-0.4.mjs
```

Each condition uses three fresh browser contexts. No other agent combat or test suite ran during these captures. The normal control has no artificial network/CPU limit. The constrained condition uses 4× CPU slowdown, 150ms network latency, 200,000B/s down (approximately 1.6Mbps) and 75,000B/s up. This is browser emulation on a fast host, not hardware replication.

Startup means navigation until the actual Begin mission control becomes usable. Image payload is the sum of unique HTTP PNG/WebP response bodies, excluding JS/CSS/manifest, headers and derived blob portraits. Both conditions request the same 23 images / **2,369,834 bytes**. The 0.3 historical image payload was 1,778,361 bytes: the three new illustrations cost 591,473 additional initial bytes. No download or startup improvement over 0.3 is claimed. Original sheets and other environments remain deferred.

## Results

| Measure                                |                Local control |                    Constrained |
| -------------------------------------- | ---------------------------: | -----------------------------: |
| Startup samples                        |              624 /556 /580ms |       15,199 /15,371 /15,443ms |
| Median startup                         |                        580ms |                       15,371ms |
| First original-art comparison          |  341ms /27 new unique images | 15,015ms /27 new unique images |
| Subsequent three cached switches       | 207 /163 /116ms;0 new images |   373 /409 /393ms;0 new images |
| Nest transition after opening selector |   260ms /3 new unique images |   1,509ms /3 new unique images |
| Nest late-wave RAF samples             |                        1,822 |                          1,036 |
| Median /p95 frame gap                  |                 16.7 /33.4ms |                   33.4 /50.1ms |
| Gaps over50ms                          |                            4 |                             54 |
| Combat wall duration /outcome          |             83.921s /victory |               83.803s /victory |
| Purchased defenders                    |                           20 |                             20 |
| JS heap before five restarts           |                  26,296,616B |                    36,693,460B |
| JS heap after five restarts            |                  37,690,324B |                    27,092,016B |
| Canvases after five restarts           |                            1 |                              1 |
| Uncaught page errors                   |                            0 |                              0 |

The public-control combat plan buys two Bushes, six Astros, six Zeus and six far-right barriers using only earned credits, at 2× speed and automatic Nest timing. RAF gaps are recorded only while waves 3 or 4 is actively playing. The script observes DOM state and attaches an independent RAF sampler; it never changes private simulation state, credits or clocks. [Normal](combat-local-control.png) and [constrained](combat-constrained.png) field captures show the new group in actual final-wave combat, including barriers taking contact damage. These were inspected after the run.

Every art switch preserved the paused credit bank. Each fresh destination began with 230 credits. Cached switches added no new unique image payload. Map transition timing starts after opening the selector, so thumbnail loading before selection is excluded. Transition timing includes controller overhead and the network-idle check; it is not a pure renderer timer.

## Interpretation and limits

The constrained run stays playable through a complete mission, but has visibly larger sampled frame gaps. These are two bounded combat samples, not a worst-case FPS benchmark, a hardware guarantee, a statistical performance distribution or a comparison against 0.3. The formation is representative of specialist late play rather than every cell occupied. No remote hosting, physical phone, GPU/thermal, native Safari or memory-pressure suspension claim is made.

Heap samples use `Runtime.getHeapUsage` without forcing collection and exclude GPU/native allocations. Normal heap grows while constrained heap falls, demonstrating garbage-collection timing noise. One surviving canvas, working restart controls and zero page errors support bounded lifecycle correctness; they do **not** prove absence of memory leaks. Longer retained-heap profiling and real-device sessions remain future work.

## Development-server diagnostic

An earlier throttled development-server attempt exceeded its 60-second startup wait while still showing Preparing the mission. The standalone normal startup probe succeeded. The development Phaser module alone is 7,085,411 bytes, versus approximately 1.37MB in the production bundle, making it unsuitable for a representative deployment-download comparison. Final measurements therefore use the deployable production build and a 120-second measurement timeout; all completed startup samples finish within 15.5 seconds.

The retained `development-*` images/JSON document that investigation and are excluded from the completed production metrics. The original measurement-path handling was corrected to decode filesystem URLs before screenshot output; only its own generated files were moved. No product rule, security setting or browser assertion was weakened to obtain these measurements.
