# Original art and authorship

The original Astronauts vs Aliens school project was created by **Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau** for CSC 335 in 2019. The browser edition is Trey Bryant's independent continuation. The original team credits are retained in the application and repository.

## Retained artwork

The browser sprites and backgrounds are derived from the original repository's `assets/` directory. `public/art/manifest.json` records each output's source path, dimensions, animation frame count and rate, and size. `scripts/prepare-assets.py` reproduces the conversion. It crops consistent animation bounds, scales frames into transparent tiles, and optimizes the outputs without modifying source assets.

Additional original artwork is prepared for future encounters; the first mission loads only the art it uses. The armored grunt uses the original grunt art with a renderer tint.

The school repository did not include a separate art/music attribution file or license. These files are therefore recorded as **retained school-project assets, external provenance not yet established**. This document does not assert that the team created every image or grant new rights to third-party art. Document their original creators and applicable terms, or replace the relevant assets, before a public website launch.

## New browser work

The browser interface, geometric field markings, helmet icon, effects, and synthesized sound are part of the new implementation. No original music recording is included in the browser's initial download. Phaser is MIT licensed; Vite, TypeScript, and other dependencies retain their respective package licenses.
