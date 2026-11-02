# Expedition 1.0 animation derivatives

Only optimized atlases are served. Source PNGs, extracted parts, full-resolution baked PNGs, previous accepted Sprinter atlas and rejected Gargantua draft remain outside public delivery in `web/art-source/expedition-1.0/`.

- Sprinter: 1280×720, 48 cells at160×120, WebP quality85/method6, 119,184 bytes. Existing 0.9 source parts; smooth swing/landing, restrained torso shift and eased attack.
- Gargantua: 1280×600, 40 cells at160×120, WebP quality82/method6, 169,044 bytes. Built-in generated parts derivative of the existing Expedition Gargantua; lateral four-beat walk, idle and authoritative contact attack.

Both encodings preserve the baked alpha exactly. Conversion manifests include source/output hashes, frame ranges, grounding bounds and settings. Reproduce with `python3 scripts/build-alien-animations.py` from `web/`. Runtime is simulation-driven and uses one Sprite per alien. Original art comparison and static portraits remain.

Canonical evidence: `web/art-source/expedition-1.0/prompts.md`, `sprinter-conversion.json`, `gargantua-conversion.json`, `web/docs/ANIMATION_ARCHITECTURE.md`, `web/docs/EXPEDITION_1_0.md`. The 0.9 records describe their historical hash; its previous WebP is archived outside public. No school artwork was used as a generation reference. Provenance does not resolve publication permissions for retained school/projectile/comparison material.
