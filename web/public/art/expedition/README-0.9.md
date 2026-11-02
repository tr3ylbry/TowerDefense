# Sprinter articulated atlas

Production file: `sprinter-animation.webp`, 1280×720, 118,434 bytes. Forty-eight 160×120 cells, eight columns; walk 0–23, idle 24–31, attack 32–47. Runtime display 128×96, foot anchor 0.875. It is decoded as a conventional Phaser sprite sheet, with explicit simulation-driven frame selection rather than autoplay.

[Exact built-in edit prompt, original reference, raw generated sheet and extraction/encoding provenance](../../../art-source/expedition-0.9/prompts.md). [Production dimensions, sequence ranges and SHA-256](../../../art-source/expedition-0.9/conversion.json). [Source hashes](../../../art-source/expedition-0.9/sources.json). Reproduce with `python3 scripts/build-sprinter-animation.py` from `web/`, using the existing Pillow installation. Original static Sprinter and all school sheets remain unchanged.

The raw parts and baked lossless PNG stay outside the public bundle. The existing per-scene/style asset plan requests only this pilot; it does not preload hypothetical future atlases. Original art defers Expedition imagery. Failed loading retains the existing retry/cancel behavior. [Visual review](../../../reports/expedition-0.9/visual/README.md) and [measured cost](../../../reports/expedition-0.9/performance/README.md) document selection and limits.
