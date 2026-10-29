# Original art and authorship

The original Astronauts vs Aliens school project was created by **Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau** for CSC 335 in 2019. The browser edition is Trey Bryant's independent continuation. The original team credits are retained in the application and repository.

## Retained artwork

The browser sprites and backgrounds are derived from the original repository's `assets/` directory. `public/art/manifest.json` records each output's source path, dimensions, animation frame count and rate, and size. `scripts/prepare-assets.py` reproduces the conversion. It crops consistent animation bounds, scales frames into transparent tiles, and optimizes the outputs without modifying source assets.

All nine original defenders, six alien types, and three map backgrounds now appear in the browser game with their converted original animations. The original five projectile images and acid-pool image are also used. Unused alternate, menu, and decorative art remains available in the converted collection. The former tinted armored-grunt placeholder has been replaced by the actual original alien roster.

The school repository did not include a separate art/music attribution file or license. These files are therefore recorded as **retained school-project assets, external provenance not yet established**. This document does not assert that the team created every image or grant new rights to third-party art. Document their original creators and applicable terms, or replace the relevant assets, before a public website launch.

## New browser work

The browser interface, geometric field markings, helmet icon, effects, and synthesized sound are part of the new implementation. No original music recording is included in the browser's initial download. Phaser is MIT licensed; Vite, TypeScript, and other dependencies retain their respective package licenses.

## Expedition prototype (2026-10-29)

The new Canyon environment, Astro Joe ranger cutout, and plated Tank crawler are original AI-generated illustrations made with the built-in OpenAI image generation tool. No school artwork or third-party references were supplied to those generations. Served assets, full prompts, and conversion notes are documented in [the Expedition provenance record](public/art/expedition/README.md); untouched selected sources live in `art-source/expedition/`. The cutouts are static images animated procedurally in Phaser. The art comparison switch changes presentation only.
