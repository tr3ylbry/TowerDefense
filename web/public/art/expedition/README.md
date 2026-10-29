# Expedition visual prototype assets

Created 2026-10-29 with the built-in OpenAI image generation tool using the imagegen skill. These are original AI-generated prototype illustrations, created from the text prompts below without external reference images or school-project graphics. The original school asset collection was not modified. This document records provenance rather than making a separate copyright or licensing claim.

## Files and renderer use

| File                          |  Dimensions |     Bytes |
| ----------------------------- | ----------: | --------: |
| `canyon-original.png`         |  1672 × 941 | 2,244,809 |
| `canyon.webp`                 |  1672 × 941 |   159,894 |
| `ranger-original.png`         | 1301 × 1209 | 1,241,203 |
| `ranger.png`                  |   512 × 476 |   238,090 |
| `plated-crawler-original.png` | 1536 × 1024 | 2,182,936 |
| `plated-crawler.png`          |   512 × 341 |   229,934 |

Suggested renderer keys: `expedition-canyon`, `expedition-ranger`, and `expedition-plated-crawler`. Browser URLs relative to the web public directory are `art/expedition/canyon.webp`, `art/expedition/ranger.png`, and `art/expedition/plated-crawler.png`.

The two character files are static full-body cutouts, facing right and left respectively. They are suitable for portraits and procedural breathing or recoil. They contain no animation frames and are not sprite sheets.

The `*-original.png` files are preserved under `web/art-source/expedition/`, outside the public build, and are byte-for-byte copies of selected generated images. Served files use format conversion and proportional resizing only: the canyon remains at generated dimensions and is encoded as WebP quality 82; the RGBA character images are proportionally resized to a 512-pixel maximum side with Lanczos resampling and saved as optimized PNG. No semantic image edits, background masks, flips, or figure redraws were performed in scripts. Original alpha was retained through the normal resize operation.

The first crawler generation visually appeared to have a brown background halo in image previews, prompting one targeted imagegen background-extraction edit. Pixel inspection showed that surrounding brown RGB values were stored beneath alpha 0 and do not render in the browser. The final selected source is the edited result; the compact served cutout was inspected again after resizing. Transparent regions, intended orientations, complete figures, and board clearance were checked.

## Selected generation sources

- Canyon: `exec-ce3af3dd-594b-4775-a865-1bb9f5fb6015.png`
- Ranger: `exec-50492241-b56b-4de5-b003-3714443c2eed.png`
- Crawler, first candidate: `exec-c3c9901b-bc96-437c-b9a4-13463dbd0ff0.png`
- Crawler, selected extraction edit: `exec-769a1bfa-20fa-4915-80b5-92d43f4ba27c.png`

The built-in tool saved source files under `/Users/Tr3y/.codex/generated_images/01a184ee-d43f-7593-a004-7b14976f6131/`. Selected copies are preserved in this project so no runtime reference relies on that outside location.

## Canyon prompt

```text
Use case: stylized-concept
Asset type: production background art for an original 2D browser lane-defense game, wide landscape 16:9.
Primary request: an ORIGINAL illustrated sci-fi canyon expedition environment. Warm terracotta sandstone cliffs frame the upper and lower edges; a distant twilight blue sky occupies a shallow band across the top. Very subtle mint technological colony accents belong only on the far upper rim or outer edges. The scene belongs to an optimistic space expedition.
Style/medium: clean, polished hand-painted 2D game environment with simplified strong silhouettes, restrained texture, clear readable shapes, no photorealism and no existing game imitation.
Composition/framing: side-on, slightly elevated orthographic game-board camera. A broad, flat, horizontal dusty sandstone plateau spans the entire width across the middle, occupying roughly 70 percent of the image height. This broad open plateau will hold six horizontal gameplay lanes. Keep the entire central playable rectangle visually quiet with small low-contrast dust texture and gentle tonal variation. Upper cliffs sit beyond the top boundary of this plateau; a narrow lower rock lip frames the very bottom. All lanes should read at the same scale, without strong perspective or a central vanishing point. Cliffs and decorative technology stay along outer edges and do not cut into the middle.
Lighting/mood: soft twilight, gentle warm bounced light, a little atmospheric depth in distant rocks, inviting expedition mood.
Color palette: warm muted terracotta and dusty orange ground, navy and desaturated blue distant sky/shadows, tiny mint lights. Enough value separation for colorful sprites and a navy/mint/orange interface on top.
Constraints: environment art only, no characters, no creatures, no weapons, no lettering, no text, no logos, no UI, no grid, no lane lines, no watermarks. No strong foreground props or large rocks obstructing the playable middle. No winding trail, no chasm through the board, no diagonal canyon corridor, no giant center focal object. Preserve a readable calm board at actual gameplay size.
```

## Ranger prompt

The built-in tool was called with `transparent_background: true`.

```text
Use case: stylized-concept
Asset type: original transparent character cutout for a 2D sci-fi browser game; used at small game-board size and in a unit portrait.
Primary request: one ORIGINAL chunky astronaut expedition ranger, full body, strict side view facing RIGHT. A rounded helmet with a deep navy visor, warm cream padded suit, broad mint technical panels, restrained orange safety accents, compact boots and gloves. A simple practical expedition design, not a recognizable existing franchise character. Hold a small compact plasma tool pointing to the RIGHT in a neutral firing-ready stance.
Style/medium: clean polished hand-painted 2D game illustration, simplified strong shapes, crisp readable silhouette, soft restrained cel-shading, confident dark navy contour accents. Optimistic frontier expedition aesthetic. Match a warm terracotta canyon, twilight blue sky and mint colony light palette.
Composition/framing: exactly one character, full body entirely visible including helmet and boots and the plasma tool tip. Side profile oriented to the right; helmet visor and tool barrel visibly point right. Slightly chunky proportions with large readable helmet and hands, compact body and sturdy stance. Isolated centered figure with comfortable transparent padding on all sides. Neutral ready posture suitable for subtle procedural breathing and recoil.
Lighting/mood: soft warm light from upper left with subtle cool mint accents, no extreme gloss.
Constraints: genuinely transparent background with preserved alpha; no background color, no environment, no ground plane, no cast shadow outside the figure, no glow or particle plume extending beyond the figure, no text, no logos, no watermark, no UI, no multiple views, no character sheet. Do not crop any part. Keep the design readable at around 96–128 pixels tall.
```

## Plated crawler prompt

The built-in tool was called with `transparent_background: true`.

```text
Use case: stylized-concept
Asset type: original transparent creature cutout for a 2D sci-fi browser lane-defense game, used both on the game board and as a unit portrait.
Primary request: one ORIGINAL squat alien plated crawler, full body, strict side view facing LEFT. A low compact armored creature with four short sturdy jointed legs, an olive and desaturated teal shell, overlapping copper armor plates across its broad back, and one clearly readable bright amber weak-point eye on its left-facing head. Rounded chunky forms with a distinctive readable silhouette. A curious hardy frontier creature, formidable but not horror or gore. Invent an original design, not a recognizable existing franchise creature.
Style/medium: clean polished hand-painted 2D game character illustration with simplified strong shapes, crisp silhouette, restrained soft cel-shading and confident dark navy contour accents. Match an expedition astronaut with cream/mint/orange equipment and a terracotta canyon with twilight blue shadows. Render the shell materials clearly without tiny noisy markings.
Composition/framing: exactly one complete creature centered with generous transparent padding; all limbs, shell, head, antennae and tail if any remain fully within image. Low wide body, short grounded limbs. Strict side profile, head and bright eye at the LEFT, rump at the right. Neutral ready-to-crawl stance suitable for small procedural breathing, no motion streaks. Readable when displayed around 110 pixels wide.
Lighting/mood: soft warm light from upper left, subdued cool teal shadows, amber eye as the strongest small color accent.
Constraints: genuinely transparent background with preserved alpha. No ground plane, no cast shadow outside the creature, no environment or color backdrop, no glow plume outside the silhouette, no lettering, logos, text, watermark, UI, duplicate views or character sheet. No rider, tools or humanoid clothing. Do not crop any part.
```

## Crawler extraction edit prompt

The first crawler image was inspected and then supplied as the sole local edit target, with `transparent_background: true`.

```text
Use case: background-extraction
Asset type: transparent cutout of the existing original sci-fi game creature.
Edit target: the supplied plated crawler image.
Primary request: remove the entire brown lighting halo, dark ground shadow, and all background haze outside the creature's actual silhouette. Return a genuinely transparent RGBA cutout: every pixel outside the creature silhouette must be fully transparent. Keep the complete crawler, including all legs, head, eye, antennae and copper plates.
Invariants: preserve the creature's exact design, olive/teal shell colors, copper armor, bright amber eye, pose, LEFT-facing orientation, proportions, internal shading and clean painted illustration style. Do not redraw or redesign the creature. Do not change its framing or crop any part.
Constraints: no background of any color, no cast shadow or glow outside the figure, no ground, no scene, no lettering, no watermark. Transparent padding around the full creature.
```

## Integrity hashes

```text
842d2682e26a2f082616e3136ab40ad891994fa4f52962c49f9c12d9aeea0ab0  canyon-original.png
247a02aef7e634fd912c3122dd249807eb7b1ba7c9fefeadacbe9f8a79a6a2a5  canyon.webp
89ad5462ee7532d9afdd3216e2c6668c2438dcf29ded5b487bcaeeab4860c889  ranger-original.png
d3880233055291293ff654d279fde01ea8005f3e8b3c6fa9a945e7ccf18a7139  ranger.png
c54b0f81932a4e4f3475e6ad7759fdf3cbbbd8c27bcd2374fab636e28b61d7cf  plated-crawler-original.png
cbbfb070969e066c4f4af081ee822adfc43e503e83bc79a1d62e8ecf438037e5  plated-crawler.png
```
