# Expedition 0.5 artwork and production derivatives

Created 2026-10-31 with the built-in OpenAI image-generation tool. This record describes generation and integration provenance, not a grant of rights to retained third-party school assets or a trademark clearance.

## Selected assets and preserved sources

The four remaining defenders, Bridge/Nest environments and an acid decal are now illustrated. Seven new selected illustrations use seven text-to-image calls plus one targeted edit of the first flagship candidate. There is no CLI/API fallback, external stock download, generated animation sheet or scripted semantic image editing.

Every exact prompt, tool output path and edit reference is in [generations.json](../../../art-source/expedition-0.5/generations.json). [Source inventory](../../../art-source/expedition-0.5/source-inventory.json) records all eight untouched PNG copies, their SHA-256 hashes, sizes, alpha extrema and byte-for-byte comparison with tool outputs. All high-resolution sources remain under `web/art-source/expedition-0.5/`, outside the public build. The existing Ranger, Zeus, Bush, Canyon and school Startrell strip were inspected for style/role context; the compact flagship edit specifically used the preserved wide flagship PNG as its edit target.

| Browser file                     | Dimensions |   Bytes | Display bounds / foot origin                        |
| -------------------------------- | ---------: | ------: | --------------------------------------------------- |
| `explosive-astro-joe.webp`       |    384×355 |  45,474 | 86×79.51; 351/355                                   |
| `startrell-cluggins.webp`        |    384×365 |  32,074 | 78×74.14; 355/365                                   |
| `money-tree.webp`                |    339×384 |  46,416 | 70×79.29; 376/384                                   |
| `frontier-flagship-compact.webp` |    384×274 |  38,514 | 96×68.5; 267/274                                    |
| `acid-pool.webp`                 |    384×256 |  12,356 | 90×64 terrain canvas, centered; no character foot   |
| `sky-bridge.webp`                |   1080×660 | 109,530 | Perimeter registered with 1.3× background zoom      |
| `nest.webp`                      |   1080×660 |  82,124 | Full field backdrop                                 |
| `canyon-0.5.webp`                |   1080×608 |  87,406 | Compressed derivative of retained Expedition Canyon |

Four selected defender derivatives total **162,478 bytes**. All fifteen character cutouts together total **508,362 bytes**. The three environment derivatives total **279,060 bytes**. These are file sizes, not the total initial transfer; only the current scene/style loads. Measured initial imagery is recorded separately in the [performance report](../../../reports/expedition-0.5/performance/README.md).

## Conversion and integrity

[prepare-expedition-0.5.py](../../../scripts/prepare-expedition-0.5.py) reproduces the derivatives with installed Pillow 12.2.0 / libwebp 1.6.0. Characters/terrain use proportional LANCZOS thumbnails at maximum 384 px and WebP quality 90, method 6, exact transparent RGB handling and alpha_quality100. Environments use maximum 1080 px and quality 85. RGB compression is lossy; alpha is verified pixel-exact against the proportionally resampled image. No generated shape is programmatically cropped, flipped, recolored, repainted, masked or reconstructed.

[derivatives.json](../../../art-source/expedition-0.5/derivatives.json) records all nineteen source/served SHA-256 pairs, dimensions, byte counts, encoding settings, alpha bounds and foot ratios. Existing PNGs and all school assets remain unchanged. The eleven older cutout derivatives reduce their group from 2,175,882 to 345,884 bytes. [The format experiment](../../../reports/expedition-0.5/performance/compression-candidates.json) retains full-resolution lossless and lossy alternatives; byte counts/PSNR alone did not establish acceptance. Field screenshots and browser checks provide the visual review.

The installed standalone cwebp executable could not run on this ARM64 host. The existing Pillow/libwebp installation performed the encoding; no runtime dependency, browser codec polyfill or new package was added.

## Role and field review

- **Explosive Astro Joe:** a heavy cream/mint demolition astronaut with orange shell canisters and a short mechanical launcher. Warm release/impact cues distinguish shells from Zeus's cyan plasma. Full boots, hands and muzzle remain visible.
- **Startrell:** a narrower agile scout with a small orange star insignia and compact rapid-fire carbine. Smaller two-pixel recoil and short three-pixel release flashes prevent repeated shots from dominating the field.
- **Money Tree:** a tall branching trunk, two leaf tiers, five amber resource pods and cream cultivation base. It remains narrower than a cell and distinct from the squat Bush. Real income events produce a restrained 3% growth cue; no artificial production clock exists.
- **Frontier Flagship:** original compact cream/mint armored lander with a centered bridge, grounded landing pads and three distinct right-facing weapons. It retains the internal `falcon` key, original ammunition, price and combat role. The public browser name avoids reusing the school-era franchise name. Historical source/name/art remain preserved. See the [identity review](../../../reports/expedition-0.5/assessment/FLAGSHIP_IDENTITY.md); this is not comprehensive IP clearance.
- **Bridge:** slate/cyan elevated platform and distant atmospheric structures. Its zoom registers the rails above/below the unchanged playable rectangle rather than allowing scenery to resemble an obstacle across the first/last lane.
- **Nest:** quiet plum ground, peripheral alien formations and restrained violet/teal growths. The new pale-edged acid decal and stroked `×` marker keep every restricted cell legible on both backgrounds. Original mode restores the retained acid texture.

The wide first flagship was rejected after an actual mixed formation showed that its low silhouette made the expensive defender look too small. Both its PNG and [field review](../../../reports/expedition-0.5/visual/flagship-wide-review.png) are preserved outside public assets. One targeted built-in edit shortened the hull and increased its visible height; the compact replacement was reviewed in the actual Canyon field before final mixed-map regressions. No generated animation experiment was accepted or shipped; the earlier rejected Sprinter frame remains excluded.

Final map/roster captures and their review conditions are indexed in [visual evidence](../../../reports/expedition-0.5/visual/README.md). Full automated results, limitations and external playtest gaps belong to the [0.5 milestone report](../../../docs/EXPEDITION_0_5.md).
