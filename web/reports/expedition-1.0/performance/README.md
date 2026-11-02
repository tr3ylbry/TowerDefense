# Expedition 1.0 measured delivery and animation budget

Final owner-requested **six-alien** source is identified by [source-sha256.json](source-sha256.json). Frozen0.9 production reference: `feae81d`. Both use the same pinned dependencies. Apple M5/macOS, installed Chrome156.0.8078.74 headless/default working WebGL, serial alternating builds and fresh contexts. Tests/builds were stopped for timing. Three startup samples per version/condition; constrained=150ms latency,200000B/s download,75000B/s upload,4× CPU. [Raw startup](startup.json), [warm retention](cache.json), [all-six render/decode including raw intervals](roster-animation.json), and reproducible [startup](../../../scripts/research/profile-1.0.mjs)/[render](../../../scripts/research/animation-cost-1.0.mjs) scripts are committed.

| Measure | 0.9 reference | Final six-alien candidate | Interpretation |
| --- | ---: | ---: | --- |
| Initial imagery | 719,131B | 1,123,743B | +404,612B /56.3% |
| Initial transfer including navigation | 1,131,457B | 1,540,202B | +408,745B /36.1%; includes response overhead |
| Normal desktop median enabled Begin | 246.5ms | 280.3ms | Small noisy desktop difference; no speedup claim |
| Constrained median readiness | 6,741.2ms | 8,775.2ms | +2,034.0ms /30.2%; explicit loading cost |
| 50-alien roster median frame interval | 16.7ms | 16.7ms | Same sampled cadence |
| Roster p95 range, three runs | 17.3–17.5ms | 17.4–17.5ms | No material tail change observed here |
| Sampled intervals>33.3ms | 0 | 0 | Desktop fixture observation only |
| Display objects | 51 | 51 | 50 Sprites plus one background rectangle |
| Textures including Phaser defaults | 10 | 10 | Six character textures in each variant |

## Rendering, decode and retention limits

The separately production-bundled fixture renders50 world-size aliens distributed across all six kinds, with actual-distance walking and some contact poses. It has no combat, collision, projectiles or health bars and is not a mission. Before uses the retained0.9 Sprinter atlas plus the five static cutouts and their original procedural gaits; after uses all six1.0 atlases. Three serial alternating before/after samples,2s warm-up+10s observation. Raw Scene update intervals include scheduling. Pose-loop p95 CPU=.1ms except one .2ms run, near timer resolution. Sprite creation=.5–.7ms. [Dense capture](../visual/dense-50-roster.png) shows fixture scale/overlap.

Six blob decode samples each give current medians: Scout4.45ms, Grunt4.55ms, Sprinter6.20ms, ManHunter4.15ms, Tank6.00ms, Gargantua7.45ms. Median synchronous sheet parsing: Scout5.0ms, Grunt4.8ms, Sprinter6.9ms, ManHunter4.7ms, Tank6.4ms, Gargantua8.3ms. Decode excludes fetch and includes blob/image initialization. Synchronous texture parsing excludes deferred GPU upload/draw. These are not total startup or physical-phone numbers.

The real application has45 active WebGL handles initially,64 after all Expedition environments and100 after Original comparison. Three complete six-mission navigation cycles per style retain those plateaus, with one canvas, no page errors and no repeated per-cycle image growth. The navigation probe uses explicitly labeled all-unlocked storage, not win evidence. Counts indicate bounded retention, not measured VRAM or proof of zero leaks. Actual public-control combat/restart tests remain separate.

## Provisional budget and explicit expansion tradeoff

The initial two-pilot guardrails were100–175KB per character (review>180KB), one Sprite/entity, desktop fixture p95≤20ms and<1% intervals>33.3ms, initial imagery≈900KB and constrained readiness≈8s on this same profile. **The owner-requested full roster exceeds the imagery target by223,743B and the readiness target by775.2ms. Those targets have not silently been raised or reported as passed.**

The four requested new atlases total410,810B; all use40 cells at128×96 in1024×480. Scout92,306B, Grunt97,096B, ManHunter84,518B, Tank136,890B. Sprinter119,184B and Gargantua169,044B retain160×120 cells. Removing all six redundant static cutouts from battlefield preload recovers175,992B relative to simply adding the four sheets to the prior two-pilot plan. Static guide portraits remain deferred. Every authored mission contains all six kinds, so all six required sheets load before Begin, with visible preparation/retry/cancel. No risky late-wave loading or silent degraded animation is introduced.

Accept the explicitly requested motion functionality as an engineering candidate with a **documented loading-budget exception**, not an unqualified performance pass. Initial-delivery optimization and direct target-phone measurements precede further art expansion/public release. The same50-unit desktop fixture stays within the runtime guardrails. One Sprite per alien, no runtime bones/listeners/independent clocks. Finite-frame contacts and enlarged softness remain visual limitations.

Approximate raw RGBA surfaces: original two atlases6.45MiB plus four1024×480×4 surfaces7.5MiB≈13.95MiB. This arithmetic is **not actual GPU/process-memory measurement**; driver format, copies, lifetime and browser behavior differ. Phone memory pressure, thermals, long sessions and FPS remain unmeasured.

Music adds661,544B only after an explicit Music gesture, with no initial audio request. It is default-off and does not enter the loading table. Both user levels start65%, routed through independently calibrated real gains; owner iPhone17/Safari feedback confirms balance/sliders, not performance. [Generator/hash evidence](../assessment/phone-assets.json) records reproducibility.

## Preserved historical comparisons

[animation.json](animation.json) retains the original two-pilot experiment:50 Sprinters,50 Gargantuas and25+25 mixed, three serial alternating samples per group. Median16.7ms both; mixed p95 rose16.8–16.9→18.2–18.4ms, zero sampled intervals>33.3ms. Its sprite/atlas/source hashes identify that earlier scope. It must not be relabeled as the final six-roster benchmark.

[pre-roster startup](probes/pre-roster-startup.json), [cache](probes/pre-roster-cache.json) and [source hashes](probes/pre-roster-source-sha256.json) preserve the preceding two-pilot/phone-music build:888,925B imagery,1,304,544B total transfer,7.556s constrained median. Separate sessions are not matched timing comparisons between follow-up revisions. Earlier snapshots under `pre-paused-phone-*`, `pre-phone-ui-*` and `pre-crew-music-*` also retain their original boundary.

An initial headless-shell WebGL failure is preserved under `probes/headless-shell-*`; Canvas fallback worked but the WebGL-only fixture could not become ready. It is excluded from final comparisons/texture conclusions. Installed Chrome works with default graphics and no security weakening. This report makes no physical-device frame-time, memory-leak or human motion-quality claim.
