# Expedition 1.0 animation derivatives

Only optimized atlases are served. Source PNGs, extracted parts, full-resolution baked PNGs, previous accepted Sprinter atlas and rejected Gargantua draft remain outside public delivery in `web/art-source/expedition-1.0/`.

- Sprinter: 1280×720, 48 cells at160×120, WebP quality85/method6, 119,184 bytes. Existing 0.9 source parts; smooth swing/landing, restrained torso shift and eased attack.
- Gargantua: 1280×600, 40 cells at160×120, WebP quality82/method6, 169,044 bytes. Built-in generated parts derivative of the existing Expedition Gargantua; lateral four-beat walk, idle and authoritative contact attack.

Both encodings preserve the baked alpha exactly. Conversion manifests include source/output hashes, frame ranges, grounding bounds and settings. Reproduce with `python3 scripts/build-alien-animations.py` from `web/`. Runtime is simulation-driven and uses one Sprite per alien. Original art comparison and static portraits remain.

Canonical evidence: `web/art-source/expedition-1.0/prompts.md`, `sprinter-conversion.json`, `gargantua-conversion.json`, `web/docs/ANIMATION_ARCHITECTURE.md`, `web/docs/EXPEDITION_1_0.md`. The 0.9 records describe their historical hash; its previous WebP is archived outside public. No school artwork was used as a generation reference. Provenance does not resolve publication permissions for retained school/projectile/comparison material.

## Owner-requested completion of alien locomotion

Scout92,306B; Grunt97,096B; ManHunter84,518B; Tank136,890B. Each atlas is1024×480 with40 cells at128×96 (16 walk/eight idle/16 contact). All preserve decoded alpha exactly and pass the same clipping/grounding/hash gates. These four add410,810B before removing redundant static battlefield preloads. Run `python3 scripts/build-roster-animations.py`; [prompts](../../../art-source/expedition-1.0/roster/prompts.json), [generation IDs](../../../art-source/expedition-1.0/roster/generation.json), raw source parts and per-kind conversion manifests remain outside public delivery. The existing Expedition illustrations are the only generation references. All six kinds reuse one Sprite and the authoritative pose selector. Final loading/rendering costs and the provisional startup-budget exception are documented in the performance report, not inferred from the earlier two-pilot result.
