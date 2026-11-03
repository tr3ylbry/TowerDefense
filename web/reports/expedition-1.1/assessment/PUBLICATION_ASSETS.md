# Publication assets and permissions

This is an evidence inventory, not a legal clearance. The machine-readable `publication-assets.json` cross-checks every raster physically present in the fresh production output, current loader plans for all three destinations/both styles, Field Guide/preview references, and measured initial requests. `production-output.json` covers every output file, including code, manifests, notices and audio. Shipped files and initial downloads are separate columns.

| Family | Current use and loading | Evidence and unresolved work |
| --- | --- | --- |
| Nine Expedition defenders | Initial cards and battlefield;192px proportional derivatives reuse each URL. | Preserved PNG source, generation records, source/output hashes and unchanged quality 90 encoding in `art-source/expedition-1.1/defender-delivery.json`. Sufficient derivation evidence; owner must still review applicable generation terms and identity concerns. |
| Six alien atlases | All six required before Begin for every mission. |699,038B,248 poses; byte-identical to1.0. Prompts, rig sources and conversion evidence retained. No school art used as a generation reference. |
| Six static Expedition alien portraits | Field Guide on demand; no battlefield preload. | Necessary readable portraits;1.0 had already removed175,992B of redundant initial loading. Not a new1.1 saving. |
| Expedition environments / acid | Selected map initially; other destinations/mission previews on demand; acid only Bridge/Nest. | Recorded independent generation/derivation. Old full-size Canyon and unused PNG delivery copies remain distinct from the optimized current map. |
| Retained school projectiles | Five small PNGs used in both styles, including initial Expedition. |4,929B combined. Source file references exist; asset-specific authorship/license evidence remains absent. Replace or obtain explicit permission. Size and attribution do not establish permission. |
| Original-school sheets and scenery | Comparison on demand, all 419 retained animation frames are separately verified. | Historical repository and contributor attribution establish custody, not every image's authorship or redistribution rights. Original character sheets, scenery, acid and comparison names need specific evidence or exclusion. |
| Unused retained derivatives | Converted menus, alternate/ambient sheets and other entries still copied by `public/`. | No current loader/UI use does not mean not distributed. Machine inventory identifies exact files/bytes. Keeping them in Git does not require shipping them. |
| Historical franchise references | Millennium Falcon comparison media/name and retained TARS identity. | Independent Frontier Flagship generation does not clear these separate materials. Review naming/design as well as raster permissions. |
| Effects and Orbital Drift | FX synthesized at runtime; music661,544B only after gesture, off initially. | Source-authored tones and music generator, no third-party recordings or samples. Sufficient composition/derivation evidence for this continuation; no claim over historical WAVs. |
| Original sounds | Preserved under repository `assets/sounds`. | Outside browser output. Do not add without provenance review. |
| Code/dependencies | Browser-only continuation; pinned Phaser runtime. | Preserve original team attribution and applicable dependency notices; package licenses are not image licenses. No blanket license is inferred for the school project. |

All 67 retained raster derivatives remain unresolved at the asset-specific permission level. No contributors were contacted or permissions invented. Adrian Bao, Mauricio Herrera, Trey Bryant and Tim Lukau remain credited. Generated provenance and original source-authored music are documented independently; neither establishes blanket publication rights for school or franchise material.

## Minimum future public-build decision

Recommended: preserve all historical Java/assets/docs in the repository, replace the five projectile images with independently authored equivalents, and decide whether the public build should offer Original comparison. If permissions cannot be established, a publication-approved Expedition-only build can omit the Original switch and all legacy output **together**, and trim manifest/portrait fallback paths accordingly. Keep the comparison available in development for historical review. This changes visible functionality and therefore remains a product decision; it is not implemented silently here.

Simply hiding the switch would still ship files copied from `public/`. A future build should explicitly select approved output and verify the final folder and network paths. Remove unused generated PNG/source copies and old Canyon derivative from that distribution while preserving sources elsewhere in Git. Exclude unused legacy menus/alternate sheets regardless of comparison choice unless there is a specific historical-display requirement. These exclusions reduce delivery and rights surface; they do not grant rights to remaining assets.

An optional separate legacy bundle is possible only after its own approval; without permission it merely relocates the problem. It adds versioning, loading/failure, hosting and caching work, so avoid that packaging until there is a concrete approved need. No new packaging system or exclusion of visible historical comparison is part of1.1.

Before public publication: resolve remaining naming/design concerns, review generation terms, choose the approved assets, retain contributor/dependency notices, verify no unapproved copies remain in output, and coordinate Treydmark hosting separately. No public deployment, website, Labs, DNS or Vercel change was made.
