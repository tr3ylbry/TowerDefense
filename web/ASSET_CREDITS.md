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

## Expedition 0.2

Three additional original AI-generated transparent cutouts—Scout, Grunt, and TARS—form a small matched combat group. [Complete prompts, hashes, generation sources, alpha inspection, and conversion notes](public/art/expedition/README-0.2.md) are preserved. Their unchanged full-resolution sources live in `art-source/expedition-0.2/`, outside the public build. School assets are not overwritten. All five Expedition character cutouts use proportional display bounds and explicit foot anchors; these remain static artwork with procedural motion, not generated animation sheets. Bridge/Nest perimeter effects are code-drawn presentation applied over retained backgrounds.

## Expedition 0.3

Sprinter, ManHunter, and Gargantua complete the illustrated alien roster. These original AI-generated transparent cutouts use the built-in image tool; [prompts, exact alpha-derived foot anchors, source IDs, conversion and integrity hashes](public/art/expedition/README-0.3.md) are recorded. Unchanged full-resolution sources and one rejected authored-stride experiment live in `art-source/expedition-0.3/`, outside the public build. The experiment is not a shipped animation frame. All school sheets remain intact and load when original-art comparison needs them. Seven defenders and Bridge/Nest scenery continue to use retained school art with the provenance limitations above.

## Expedition 0.4

Money Bush, Asteroid, and Moon Zeus add three original AI-generated transparent illustrations using the built-in image tool. [Prompts, untouched source hashes, alpha measurements, proportional conversion, and field review](public/art/expedition/README-0.4.md) document the group. Full-resolution sources live in `art-source/expedition-0.4/`, outside the public build. These remain static cutouts with event-driven procedural feedback. Four defenders (Explosive Astro Joe, Startrell Cluggins, Money Tree, Millennium Falcon) and Bridge/Nest scenery retain school art; the external provenance limits above still apply. Original assets and contributor credits are preserved.

## Expedition 0.5

Explosive Astro Joe, Startrell Cluggins, Money Tree and the original **Frontier Flagship** complete all nine illustrated defenders. Sky Bridge, Nest and a small acid decal complete the new environment treatment. [Prompts, selected sources, rejected wide flagship, alpha/conversion details and hashes](public/art/expedition/README-0.5.md) are preserved. The compact flagship is one targeted edit of the new wide prototype; no school/franchise artwork was supplied as an edit target. All high-resolution outputs remain outside `public/`.

All fifteen Expedition characters now serve proportionate WebP derivatives; Canyon receives a smaller WebP derivative of the existing illustration. Old PNGs, source originals, all school sheets/backgrounds, historical names and contributor credits remain intact. Original comparison loads them on demand. Five retained small projectile images remain part of the Expedition renderer; retained-art rights still need resolution before publication.

The school unit named Millennium Falcon is publicly presented as Frontier Flagship with an original non-franchise lander silhouette. Its internal `falcon` key and combat statistics do not change. [The primary-source identity review](reports/expedition-0.5/assessment/FLAGSHIP_IDENTITY.md) explains the naming/design choice and remaining clearance limits. Attribution preserves history and does not by itself establish third-party permission. No hosting or public release is part of 0.5.

## Expedition 0.9 animation derivative

The articulated Sprinter is a built-in image-generation derivative of the existing original Expedition Sprinter, supplied as the edit reference. Nine separated cutouts are articulated and baked offline; no school asset is used as a generated reference or overwritten. [Exact prompt, raw source, component extraction, pivots, hashes and production atlas manifest](art-source/expedition-0.9/prompts.md) are retained. Only one 118,434-byte WebP atlas is added to production. [Architecture and limitations](docs/ANIMATION_ARCHITECTURE.md) distinguish this pilot from the unchanged single-image presentation of the other aliens and the retained school animation sheets.

## Expedition 1.0 animation foundation and publication inventory

Sprinter reuses its accepted 0.9 painted parts with refined offline motion. Its prior accepted atlas is preserved outside public delivery. Gargantua uses one new built-in generation edit of the existing Expedition Gargantua illustration, separated into torso and four complete limbs; a continuous source-pixel deformation is baked offline into 40 poses. [Exact prompt/source](art-source/expedition-1.0/prompts.md), [Sprinter conversion](art-source/expedition-1.0/sprinter-conversion.json), [Gargantua conversion](art-source/expedition-1.0/gargantua-conversion.json) and a rejected joint-slice preview retain the production evidence. No original school file is replaced.

The [release inventory](reports/expedition-1.0/assessment/RIGHTS.md) covers all 100 deployable raster files, including unused retained files, with per-file source/permission status in JSON. Sixty-seven retained derivatives still have unresolved provenance/permissions; 33 generated derivatives have recorded provenance rather than blanket clearance. Five retained projectile images remain in Expedition. Original WAVs are outside browser delivery. Public-release readiness remains separate from engineering readiness.
