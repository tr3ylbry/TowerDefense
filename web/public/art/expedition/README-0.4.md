# Expedition 0.4 defender cutouts

Created 2026-10-31 with the built-in OpenAI image generation tool, following the imagegen skill and the Expedition art direction.

## Scope and provenance

This bounded asset task created exactly three original AI-generated static defender illustrations: Money Bush, Asteroid, and Moon Zeus. Each asset used one independent built-in text-to-image call with `transparent_background: true`. There was no fallback CLI, external stock art, extra defender group, or authored animation-cycle generation.

The Expedition Ranger and TARS cutouts, original school Money Bush/Asteroid/Moon Zeus strips, the 0.4 brief, and `web/docs/ART_DIRECTION.md` were inspected before prompt creation. These supplied role/style context in the prompts; no existing graphic was submitted as a generation edit target or redrawn. Legacy assets, existing Expedition artwork, the art registry, gameplay/UI code, tests, Git history and the art guide were not modified by this asset task.

This document records generation provenance, not a separate copyright or licensing claim.

## Inventory

| File | Use | Dimensions | Bytes | Alpha extrema |
|---|---|---:|---:|---:|
| `money-bush-original.png` | Preserved source | 1295 × 1214 | 1,439,301 | 0–255 |
| `money-bush.png` | Browser | 448 × 420 | 201,472 | 0–255 |
| `asteroid-original.png` | Preserved source | 1408 × 1117 | 1,801,925 | 0–255 |
| `asteroid.png` | Browser | 448 × 355 | 205,148 | 0–255 |
| `moon-zeus-original.png` | Preserved source | 1330 × 1182 | 1,431,065 | 0–255 |
| `moon-zeus.png` | Browser | 448 × 398 | 200,985 | 0–255 |

Untouched full-resolution selected sources live under `web/art-source/expedition-0.4/`, outside `public/` and the production image payload. These copies were verified byte-for-byte against the built-in tool outputs. Browser PNGs live under `web/public/art/expedition/`.

The browser group totals **607,605 bytes** (about **593.4 KiB**), below the 650 KiB target. All use a maximum side of **448 pixels**. Proportional 512-pixel versions would total 770,413 bytes; 384-pixel versions would total 464,657 bytes. The 448-pixel group keeps ample detail for the approximately 65–80-world-unit display sizes while fitting the agreed image budget.

Suggested renderer keys and browser paths:

- `expedition-money-bush`: `art/expedition/money-bush.png`
- `expedition-asteroid`: `art/expedition/asteroid.png`
- `expedition-moon-zeus`: `art/expedition/moon-zeus.png`

## Conversion and alpha verification

Served PNGs use proportional Pillow `thumbnail((448, 448), Image.Resampling.LANCZOS)` followed by optimized PNG encoding. No semantic scripted editing, crop, flip, mask, quantization, recoloring, or shape change was applied. Generated originals retain their exact bytes. Alpha is retained through normal proportional resampling.

All six original/served files were checked for RGBA mode, fully transparent pixels, opaque figure pixels, source-copy integrity, dimensions and byte sizes. Alpha threshold bounds were measured at 1, 16, 32, 64, 128 and 224. Generated-output previews and resized served files were visually reviewed; served PNGs were opened with `view_image`. Complete silhouettes, base/feet, right-facing Moon Zeus weapon orientation, and absence of visible exterior ground/shadow/glow were checked.

## Grounding and suggested dimensions

Use the half-open bottom edge of the served alpha >= 32 bounds as the base/foot origin, divided by canvas height. This ignores isolated nearly transparent generated edge noise without changing the image. Place that point on the shared ground line 29 world units below lane center.

| Unit | Alpha >= 32 bounds (left, top, right, bottom) | Exact proportional foot/base origin | Suggested full-canvas display | Visible silhouette at suggested display |
|---|---|---:|---:|---:|
| money-bush | `23, 34, 432, 382` | 382/420 = 0.9095238095 | 68 × 63.75 | 62.0804 × 52.8214 |
| asteroid | `11, 43, 438, 318` | 318/355 = 0.8957746479 | 82 × 64.9776785714 | 78.1563 × 50.3348 |
| moon-zeus | `24, 30, 432, 376` | 376/398 = 0.9447236181 | 90 × 79.9553571429 | 81.9643 × 69.5089 |

The full-canvas sizes preserve the served image aspect ratio and fit the requested approximate limits of 68×64 for Bush, 82×65 for Asteroid and 90×80 for Moon Zeus. The barrier is intentionally lower/wider, while Moon Zeus has more substantial height and an obvious right-facing muzzle.

The parent implementation integrated these dimensions/anchors and accepted all three in an actual Canyon battlefield capture at game size. Money Bush reads clearly as an economy unit, Asteroid is grounded and distinct, and Moon Zeus faces right with its bulk/cannon fitting adjacent cells and the health area. The asset worker also opened the parent's 1280×900 capture with `view_image` and confirmed those visible results.

The inspected capture is `new-defenders-canyon.png`, initially stored in the task's `review/expedition-0.4/` folder; the parent milestone report owns the repository report copy. At this integration checkpoint the parent reported 98 rule tests and the production build passing; this asset task did not execute those checks independently. Full dense-combat, other-environment, desktop/mobile, event-effect, failure-recovery and original-art-switch verification remain part of the parent milestone's broader QA rather than being implied by this one capture.

## Visual assessment and event cues

- **Money Bush:** a rounded mint/olive canopy with three amber resource pods and a cream/navy cultivation cradle. It has no weapon, animal face, projectile barrel or combat stance. The broad leaf/pod groups communicate cultivation and resource generation with restrained detail. Internal pod illumination is part of the static illustration; exterior production motion/effects must come from actual income events.
- **Asteroid:** one grounded cool-slate moon-rock mass, large readable crater rims, broad fractures, pale warm upper-left ridges and restrained mineral seams. Its stable underside and lack of weapons distinguish the defensive barrier from offensive defenders. Surface fractures offer a readable target for event/health-driven damage presentation without a separate generated damage cycle.
- **Moon Zeus:** a compact broad cream/navy/mint robot with a warm amber sensor, braced stance, heavy short plasma system and contained mint/cyan chamber. Its rounder broad chassis differs from the tall narrow TARS, while the larger cannon reads as heavier support than Ranger. The entire muzzle and rear pack remain visible.
- Shared soft painted shading, navy contour shadows, warm upper-left light and restrained cream/mint/orange equipment colors connect the three to the Expedition roster. The plant and stone deliberately retain their own botanical/geological materials rather than becoming three recolored robots.
- All are static cutouts, not sprite sheets or animation frames. No authored action cycle was generated. Simulation-clock income/shot/health events can drive bounded procedural presentation in the parent implementation.

## Selected built-in generation sources

The tool saved outputs under `/Users/Tr3y/.codex/generated_images/01a184ee-d43f-7593-a004-7b14976f6131/`:

- Money Bush: `exec-1c8c5fee-8ab8-4520-95ef-bcbc22638bec.png`
- Asteroid: `exec-1b60adee-62cf-4640-b5f3-799fbae1e793.png`
- Moon Zeus: `exec-3858300d-8cb7-4569-9c4a-dd4ae4d89e6d.png`

Runtime paths use project-owned public PNGs; no runtime dependency points at the outside generation directory.

## Money Bush prompt

```text
Use case: stylized-concept
Asset type: original transparent static economy defender cutout for the Expedition 0.4 browser lane-defense game.
Primary request: ONE ORIGINAL MONEY BUSH, a compact futuristic resource-producing botanical organism. A broad softly rounded canopy of five or six large grouped mint/olive leaves grows from short visible stems in a squat sturdy cream cultivation cradle with dark navy base and tiny mint technical panels. Three plump amber resource pods sit naturally among the leaves, clearly readable at small size, with subtle INTERNAL warm illumination suggesting production. No weapon, no barrel, no combat posture. Its identity should immediately suggest cultivation and resources.
Shape and palette: low friendly botanical silhouette, slightly wider than tall, canopy contained within one tile. Matte sage/mint and muted olive foliage, cream/navy planter, restrained warm amber pods, perhaps one small orange service tab. Broad readable shapes, limited leaf veins and texture, no busy tiny decoration. The cradle has a flat stable ground contact.
Style cohesion: polished hand-painted 2D illustrated science-fiction expedition art. Soft restrained cel shading, confident dark navy contour shadows, warm upper-left light. Match an existing chunky cream/mint/orange astronaut Ranger and a tall cream/navy/mint utility robot, alongside whimsical painted alien creatures on a terracotta canyon battlefield. Not photorealistic, not glossy 3D, not pixel art.
Composition: exactly one complete bush-plus-cradle, side-on slightly elevated lane camera. Keep all leaves, stems, pods and the entire planter base visible with generous transparent padding. Compact width-to-height balance suitable for a roughly 68 by 64 world-unit display. No broad roots or huge leaves reaching into adjacent tiles.
Constraints: genuinely transparent RGBA background. No environment, ground plane, dirt patch outside the planter, external cast shadow, external glow, haze, floating resource particles, text, letters, currency symbols, numbers, logos, watermark, UI, character sheet or multiple views. No human, animal face, arms or weapons. Invent an original expedition organism, no recognizable franchise design.
```

## Asteroid prompt

```text
Use case: stylized-concept
Asset type: original transparent static fortification defender cutout for the Expedition 0.4 browser lane-defense game.
Primary request: ONE ORIGINAL ASTEROID barrier, a squat heavy moon-rock boulder that clearly communicates durability, physical mass and protection rather than offense. A single rounded but irregular stone mass, slightly wider than tall, with a broad flattened stable underside. Five or six large readable impact craters and a few broad geological fractures give an expressive silhouette and recognizable asteroid identity. Keep all pieces part of the same grounded rock; no floating fragments.
Palette/materials: cool matte slate/blue-gray stone, soft muted violet/navy crater shadows, warm pale-gray upper-left ridges and restrained dusty terracotta weathering. At most a few tiny muted mint mineral seams INSIDE the stone cracks, not a glowing energy object. Broad simple planes, chunky crater rims and limited texture. No tiny speckle noise covering every surface.
Style cohesion: clean polished hand-painted 2D illustrated science-fiction expedition art, strong readable painted shapes, soft restrained cel shading, confident dark navy contour shadows and warm upper-left light. Match cream/mint expedition equipment and whimsical painted creatures on terracotta canyon ground. The stone should feel substantial and friendly to the same world, not photorealistic, not glossy 3D and not pixel art.
Composition: exactly one complete boulder, side-on slightly elevated lane camera. Approximate silhouette width-to-height around 5:4, calm broad posture and clear ground contact. Entire rock base and highest ridge are visible with generous transparent padding. Designed for roughly 82 by 65 world units; remains readable while enemies crowd around it. No cannon, machine, face, arms or legs, no dramatic external spikes or tall spires.
Constraints: genuinely transparent RGBA background. No environment, ground plane, dirt patch, loose exterior rocks, cast shadow outside the stone silhouette, external glow, haze, particles, explosion, lettering, text, logos, watermark, UI, multiple views or character sheet. Do not crop any part. Invent original artwork rather than copying another game's obstacle.
```

## Moon Zeus prompt

```text
Use case: stylized-concept
Asset type: original transparent static heavy-support defender cutout for the Expedition 0.4 browser lane-defense game.
Primary request: ONE ORIGINAL MOON ZEUS expedition heavy plasma robot, full body side-on facing RIGHT. A compact stout bipedal crew machine with a broad torso, low wide shoulders, thick short articulated legs and two large stable feet. A small squared-off helmet/cabin has a dark navy faceplate and a single warm amber horizontal optical sensor. Both robust arms brace ONE large short plasma cannon aimed horizontally RIGHT. The cannon has a fat contained mint/cyan energy chamber, two readable ring coils and a broad emitter; its muzzle is visible. A compact rear power pack balances the weapon. This is heavy-impact support, not a thin utility robot or a light astronaut.
Design/materials: brushed matte cream armor panels over navy structure, broad mint technical insets, a few restrained orange safety accents. Warm amber sensor, contained mint/cyan plasma core. Clear simple forms and readable negative space between legs and under the cannon. Slightly whimsical practical expedition machinery rather than a grim military mech. Invent an original robot design, not a recognizable franchise character, no Greek-god costume, cape or lightning crown.
Style cohesion: clean polished hand-painted 2D science-fiction expedition game illustration with strong painted shapes, soft restrained cel shading, confident navy contour shadows and warm upper-left light. Match a chunky cream/mint/orange astronaut Ranger and a tall cream/navy/mint TARS utility robot. More substantial and broad than Ranger; clearly lower and wider than TARS. Limited grouped detail, no tiny busy controls, no glossy 3D or pixel art.
Composition: exactly one complete right-facing robot with the entire cannon tip, rear pack, head, arms and both feet visible. Side-on slightly elevated lane camera, only slight three-quarter depth for readability. Broad grounded ready-to-fire stance, no giant attack pose. Keep the cannon compact enough for a full-canvas display of about 90 by 80 world units, without a long barrel extending across neighboring cells. Generous transparent padding; no crop.
Constraints: genuinely transparent RGBA background. No environment, backdrop color, ground plane, exterior cast shadow, external plasma bolt or beam, external glow halo, sparks, haze, particles, motion blur, text, letters, numbers, logos, watermark, UI, multiple views or character sheet. Energy stays inside the cannon; game events will add firing effects later.
```

## Integrity hashes

```text
2e88b6454fd4af5cb83fe546b0838a6c875bd96131eff55df0d374210573193b  money-bush-original.png
7ce948bbdb581ae350fefd0d67db5a337e27e4171255f81dfd27bed8ff28cd12  money-bush.png
1807853eab244ade4d0a86078d0a61ea4517e56a13b06c76032b06d48d9d6724  asteroid-original.png
f799bcc8c8618b6c3c3a99f4cf5be3f049875e0719c70af24c444b04874087d9  asteroid.png
8140be53e7d266d17a0c7da3598e232ea000582e1e9368009d1efc44c5fa42ee  moon-zeus-original.png
a88d84c4c223af37a2eb3247a268f4507c66b76bc9e491a0024739ee86c5697e  moon-zeus.png
```

