# Final matched production performance

Frozen before: `b0ece92e4284ccb9919e5368cd18049a4d76a251` (Expedition 1.0), freshly built from its archived web tree. After: completed1.1 runtime, including audio recovery, state highlights, centered dialog actions and header capitalization. `source-sha256.json` binds runtime/art/package sources; final output hashes are in `../assessment/production-output.json`.

## Cold loading

Installed headless Chrome 156.0.8078.74 on Apple M5/macOS;1280×900, serial alternating before/after, three fresh contexts per condition. No unrelated heavy browser tests ran during these measurements. Normal has no throttling. Constrained uses4× CPU,150ms latency,200000B/s download and75000B/s upload. Ports4174/4175 serve independent production output, not a development server. The same actual Begin mission readiness observer, navigation origin and cold-context definitions apply to both builds. `startup.json` retains every sample/resource entry.

| Metric | Frozen1.0 | Final1.1 | Interpretation |
| --- | ---: | ---: | --- |
| Unique initial images |21|21|No required roster image disappears|
| Initial image bodies |1,123,743B|917,115B|−206,628B /18.4%|
| Total transfer including navigation |1,540,208B|1,334,215B|−205,993B /13.4%; includes final code/CSS|
| Requests including navigation |37|37|CSS portraits/Phaser revalidation entries included|
| Unique request paths including navigation |28|28|Same count; smaller bodies|
| Normal median ready |177.0ms|172.9ms|Small/noisy; no meaningful desktop speedup claim|
| Constrained median ready |8,698.8ms|7,654.9ms|−1,043.9ms /12.0%|

Normal before samples258.9/176.8/177.0ms, after166.1/191.2/172.9ms. Constrained before 8702.5/8688.2/8698.8ms, after 7647.8/7661.1/7654.9ms. This is a bounded desktop experiment, not a population estimate or real network guarantee.

The nine192px maximum defender derivatives save206,628B at unchanged WebP quality 90 and world dimensions. Remaining initial image costs:699,038B six alien atlases,125,742B nine defenders,87,406B Canyon,4,929B five projectiles. All missions can spawn every alien; retaining complete readiness is simpler and safer than late-wave streaming. Guide portraits, other scenery/acid, Original comparison, previews and661,544B music remain deferred by actual use/gesture. The static-portrait preload removal175,992B already belonged to1.0.

The 8s target is regained in this profile. The 900,000B image target is still exceeded by 17,115B/1.9%; this is an explicit exception, not a raised budget. Historical0.9 readiness6.65s used an earlier animation roster and is context, not a matched before-state here. No meaningful saving justifies degraded poses or a new streaming architecture.

## Atlas, decode and rendering

`../assessment/atlas-investigation.json` records all crop/repack trials against preserved RGBA poses at the original encoder settings. Cropping increased aggregate output; best per-kind repacking saved about 2.6KB and required metadata/preview changes. Lossless Scout/Sprinter trials were161,216/233,574B versus92,306/119,184B. Keep all six accepted atlas bytes and248 poses. Duplicate idle/hold poses preserve authored sequence timing and are not removed for a marginal saving.

`roster-animation.json` is three serial alternating production-bundled fixture runs per build. Both use the full six-atlas path (`group=roster&variant=after`), avoiding the lab's historical0.9/static option. Its tested battlefield/pose-selector/atlas paths remain byte-identical in the final game; the fixture does not exercise the main HTML/audio UI or defender rendering.

Each fixture has50 world-size aliens,51 display objects and10 textures including defaults. Median frame intervals remain16.7ms. Before p95 intervals17.5/17.0/16.9ms; after17.6/16.9/17.5ms; no sampled interval exceeds33.3ms. Sprite creation costs0.5–0.6ms and sampled pose-selection p95 is0.1ms (one0.2ms sample). Synchronous sheet parsing is recorded per sheet; it excludes deferred GPU upload. Six blob/image decode trials per image exclude fetch and include initialization. Ranger/Tree decode medians improve1.70→0.80ms and1.95→0.90ms; unchanged alien decodes vary about 4–8ms without a supported speedup conclusion. These measurements have coarse timing and a small sample, not phone performance claims.

`actual-combat.json` separately observes the production Heart of the Swarm mission with public2× speed, earned-credit Asteroid barriers and legal early calls. An all-unlocked save is only navigation setup; no injected spawns, credits, wins or clock changes. Each build runs once until a legitimate defeat, roughly43 seconds. Both actual runs peak at 48 public hostiles. Median intervals are16.7ms; p95 is16.7ms before/16.8ms after, with 1/0 intervals above33.3ms. This small difference is not a rendering improvement claim. Raw whole-app rAF and the≥20-hostile dense subset include controller/screenshot/video overhead. The recording shows actual movement, contact, destruction and crowded lanes. Descriptive frame distributions and heap samples are not a controlled rendering or memory benchmark. Exact live peaks and percentiles are in that file.

## Cache, restarts and memory limits

`cache.json` follows36 ready-state mission selections: all six campaign missions, three cycles per style, followed by ten restarts. Active WebGL handles warm from 45 initial to 64 after all Expedition maps and 100 after Original, then plateau 100 through return/restarts. Unique requested images plateau 60; one canvas and no page errors are observed. Created/deleted totals are retained separately. This checks obvious bounded lifecycle accumulation; it does not quantify VRAM, guarantee long-session behavior or prove no leaks.

Uncontrolled JS heap observations cannot establish a memory saving because garbage collection timing differs. The new continuous music loop allocates decoded PCM only after opt-in (about 2.65MB mono at44.1kHz,2.88MB at 48kHz); source stops/disconnects while the reusable buffer remains cached. Default startup still downloads/decodes no music.

Real iPhone17/Safari listening feedback confirms a smoother loop and later functional toggles. Final color/background/route-interruption, heat, FPS and extended-session checks remain external. See the device checklist. No automated CPU throttle is represented as a physical phone result.

## Reproduce

Use the pinned lockfile/tools and serve frozen 1.0 and final 1.1 fresh production folders at4174/4175. With installed Chrome, run `AVA_PROFILE_CHANNEL=chrome node scripts/research/profile-1.1.mjs`, followed serially by `combat-performance-1.1.mjs`. Production-bundle the unchanged density lab separately at4176/4178 for `animation-cost-1.1.mjs`. Keep heavy regression work separate from profiling. Port overrides for cold profiling are `AVA_BEFORE_URL`/`AVA_AFTER_URL`. The scripts retain raw samples/hashes rather than modifying simulation rules.
