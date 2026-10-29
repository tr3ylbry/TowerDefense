# Expedition 0.3 alien cutouts and stride experiment

## Scope and provenance

Three original AI-generated character cutouts were created using the built-in OpenAI image generation tool and the imagegen skill: Sprinter, ManHunter, and Gargantua. Each base used one independent text-to-image call with `transparent_background: true`. No CLI fallback, external stock assets, or external reference images were used.

The current Expedition canyon, ranger, Scout, Grunt, Tank and TARS artwork, the original three alien sprite strips, and `web/docs/ART_DIRECTION.md` were inspected to guide palette, role identity and silhouette choices. Existing figures were not supplied as base-generation edit targets or redrawn. Visual references informed the text prompts below. All legacy art and existing Expedition assets remain unchanged. This records provenance rather than making a separate copyright or licensing claim.

One optional precise Sprinter leg-pose edit was attempted after all three bases were complete. It is preserved as a rejected experiment outside the public build; see the evaluation below. No generated animation sheet or defender group was created.

## Asset inventory

| File                                      | Use                        |  Dimensions |     Bytes | Alpha extrema |
| ----------------------------------------- | -------------------------- | ----------: | --------: | ------------: |
| `sprinter-original.png`                   | Art source                 | 1536 × 1024 | 1,626,780 |         0–254 |
| `sprinter.png`                            | Browser                    |   512 × 341 |   110,599 |         0–255 |
| `manhunter-original.png`                  | Art source                 | 1312 × 1199 | 1,219,404 |         0–255 |
| `manhunter.png`                           | Browser                    |   512 × 468 |   216,942 |         0–255 |
| `gargantua-original.png`                  | Art source                 | 1470 × 1070 | 1,767,983 |         0–255 |
| `gargantua.png`                           | Browser                    |   512 × 373 |   240,916 |         0–255 |
| `sprinter-stride-experiment-original.png` | Rejected source experiment | 1536 × 1024 | 1,658,847 |         0–254 |

Selected untouched full-resolution sources live under `web/art-source/expedition-0.3/`, outside `public/`. The source copies were checked byte-for-byte against the built-in tool outputs. Served base files live under `web/public/art/expedition/`.

The three served files total **568,457 bytes** (approximately **555.1 KiB**), below the 650 KiB target. All have a maximum side of 512 pixels. Encoding proportional copies at 448 and 384 pixels would have totaled 449,341 and 344,036 bytes respectively, but the 512-pixel versions already fit the target and retain more detail.

Suggested texture keys and paths:

- `expedition-sprinter`: `art/expedition/sprinter.png`
- `expedition-manhunter`: `art/expedition/manhunter.png`
- `expedition-gargantua`: `art/expedition/gargantua.png`

These are static left-facing cutouts suitable for procedural travel/breathing/hit reactions. They are not authored walk cycles.

## Conversion and alpha checks

Served files use proportional Pillow `thumbnail((512, 512), Image.Resampling.LANCZOS)` and optimized PNG encoding. No crop, flip, mask, quantization, color correction, or semantic image edit was applied in scripts. The original generated alpha channels are preserved through normal resampling.

All six accepted source/served images are RGBA, contain fully transparent pixels and near-opaque/opaque figure pixels, and have complete visible figures. Some generated originals retain colored RGB beneath alpha 0; these values do not render and were not treated as visible background. Served PNGs were inspected separately after resizing.

## Exact grounding and suggested dimensions

Foot origins use the half-open bottom edge of the served alpha bounding box at **alpha >= 32**, ignoring isolated nearly transparent generated edge noise. This is a reproducible pixel measurement, not a crop or image modification. The renderer should put that foot origin on the existing common ground line, 29 world units below lane center.

| Unit      | Alpha >= 32 bounds (left, top, right, bottom) | Proportional foot origin | Suggested full-canvas display size | Visible body height at suggested size |
| --------- | --------------------------------------------- | -----------------------: | ---------------------------------: | ------------------------------------: |
| sprinter  | `31, 34, 497, 310`                            |   310/341 = 0.9090909091 |                  102 × 67.93359375 |                               54.9844 |
| manhunter | `25, 16, 487, 459`                            |   459/468 = 0.9807692308 |                         96 × 87.75 |                               83.0625 |
| gargantua | `5, 6, 505, 363`                              |   363/373 = 0.9731903485 |                  122 × 88.87890625 |                               85.0664 |

Suggested sizes preserve source aspect ratio exactly. The Sprinter is low and elongated relative to Scout; ManHunter is taller than Grunt; Gargantua is wider and heavier than Tank. Gargantua intentionally extends slightly beyond one 100-world-unit column, while its roughly 85-world-unit visible height limits row occlusion. Integration should keep health bars attributable to the correct lane below the shared foot line within the same lane; this avoids attaching a tall enemy’s bar visually to the lane above.

Full alpha threshold bounds at 1, 16, 32, 64, 128 and 224 were inspected during measurement. The alpha >= 128 bottom edge is one pixel above the chosen edge for Sprinter and ManHunter and identical for Gargantua; the resulting anchor variation is below one world unit at these display sizes.

## Visual assessment and limits

- Sprinter: coral/teal rather than Scout lime; a forward-leaning body, long sprung legs, tucked arms and a balancing tail communicate speed. The eye remains the focal point. It is more elongated than Scout, so preserve the recommended proportional scale instead of stretching it to a square.
- ManHunter: dark teal/sage/plum planes, stronger forearms and angular head/crest create a taller aggressive frontline silhouette. Terracotta ridges are natural bone accents, not hidden gameplay armor; only explicit rule/UI armor indicators should communicate plating.
- Gargantua: high shoulder mass, broad plum/slate body, four readable feet and terracotta dorsal ridges create a mountain-like heavy enemy. Its natural ridges differ from Tank's overlapping copper shell, and its quadrupedal silhouette differs from Grunt and ManHunter.
- Shared upper-left light, navy outlines, warm amber eyes, teal/plum shadow families and terracotta accents tie the new group to the existing illustrated roster. The group is not one recolored creature.
- Generated originals and served PNGs were inspected with `view_image`. All face left, show full feet/appendages, and have no visible external ground, shadow or glow in the served transparent cutouts.
- Integration was reviewed in actual Canyon, Bridge, and Nest missions at desktop, tablet, and phone scale. Role silhouettes, grounding, below-foot health bars, procedural movement, and cached original-art comparison were checked. Browser emulation is not physical-device validation.

## Optional Sprinter stride experiment: rejected for shipping

After the three bases were complete, a single built-in imagegen edit requested an opposite leg contact while locking the head, upper body, tail, framing, palette and original 1536 × 1024 canvas. The existing full-resolution Sprinter source was the sole edit target.

The edit preserved canvas size and much of the outer silhouette, but mostly recolored/retraced a similar leg arrangement rather than creating a clearly opposite contact pose. It also repainted upper-body contrast. In the fixed original image region `x=0..1535, y=0..599`, binary alpha >= 128 silhouette intersection-over-union is **96.41%**. Mean absolute RGB change over the shared opaque region is **26.59, 16.55, 15.74** per R/G/B channel. That region includes head, crest, torso, arms and tail, and may include a small amount of the upper leg: the numbers are supporting evidence rather than an exact unchanged-body mask.

Visual review found too little useful stride change relative to the repaint/flicker risk. The recommendation is to keep simulation-controlled procedural movement rather than add this frame. The untouched candidate is preserved only as `web/art-source/expedition-0.3/sprinter-stride-experiment-original.png`; **no `sprinter-stride.png` was added to public assets**. The rejected frame is not referenced by runtime code. The integrated renderer instead differentiates procedural gait by enemy role. A future genuinely registered two-contact cycle could be evaluated separately, with pause, speed and reduced-motion behavior still controlled by simulation time.

## Generated source IDs

Built-in generation session: `01a184ee-d43f-7593-a004-7b14976f6131`. Output IDs:

- Sprinter: `exec-674dd75b-4b45-49a4-bb10-5af2495eddaa.png`
- ManHunter: `exec-67748ba1-9b9f-4f63-b26a-42a9d222e000.png`
- Gargantua: `exec-aeb52710-a71f-4554-9820-b57f04ae6580.png`
- Sprinter stride experiment: `exec-9a8e8d8d-c870-428b-97e9-c4220ad167ff.png`

Selected copies are preserved in the repository; runtime paths do not depend on the generated-images directory.

## Sprinter prompt

```text
Use case: stylized-concept
Asset type: original transparent static alien unit cutout for the Expedition 0.3 browser lane-defense game.
Primary request: ONE ORIGINAL SPRINTER alien, full-body side-on view facing LEFT. A slim, lightweight athletic runner with a narrow forward-leaning torso, compact tapered head, one clearly visible warm amber eye, two tucked small forearms, and two powerful long springy digitigrade legs with broad readable toe pads. A short streamlined swept-back crest and a compact balancing tail complete a clean fast silhouette. The rear foot is planted on its toes; the other leg reaches forward in a lively stride. Body weight is low and forward. The silhouette must immediately communicate speed, not merely be a recolored upright scout.
Palette/materials: muted warm coral and dusty terracotta across the back/head, desaturated turquoise/teal belly and limbs, navy contour shadows, a small amber eye. Soft matte skin with broad simple color shapes and a few restrained markings. No copper armor shell, no heavy plates.
Style cohesion: polished hand-painted 2D expedition game character with strong clean shapes, soft restrained cel shading, dark navy contour accents, and soft warm upper-left light. Match an existing whimsical lime/olive Scout, a broad purple/teal Grunt with a few copper plates, and a low olive armored Tank. Keep a slightly whimsical curious personality without an oversized baby head. Not horror, not photorealistic, not glossy 3D.
Composition: exactly one complete creature, head on LEFT and feet clear, full side-on lane camera with only slight depth. Every limb, crest and tail tip is visible. Generous transparent padding around the figure. Limited readable detail for display around 80–100 pixels tall. Avoid an extremely long tail or thin fragile appendages that disappear at game size. No crop, no character sheet.
Originality and transparency: invent an original creature, no recognizable franchise design, no xenomorph silhouette. Genuinely transparent RGBA background, no environment, backdrop color, ground plane, cast shadow outside the figure, haze, motion blur, external glow, particles, letters, text, logos, watermark or UI.
```

## ManHunter prompt

```text
Use case: stylized-concept
Asset type: original transparent static alien unit cutout for the Expedition 0.3 browser lane-defense game.
Primary request: ONE ORIGINAL MANHUNTER alien, full-body side-on view facing LEFT. A dangerous taller frontline hunter: an athletic upright muscular biped with a deep chest, strong shoulders, long powerful forearms ending in three broad blunt claws, and sturdy bent digitigrade legs with three-toed feet. An angular wedge-shaped head and pronounced brow give a focused aggressive expression; one visible warm amber eye faces left. A short terracotta crest and two compact shoulder ridges form a distinctive silhouette. Keep feet separate and readable. More dangerous and taller than common infantry, but not a giant bulky tank.
Distinct design: do not copy a franchise monster. No elongated black dome head, tubes, external mechanical armor, huge spikes or horror/gore. The silhouette is a purposeful original expedition creature with slightly whimsical personality. It must differ anatomically from a round barrel-chested Grunt and from a lightweight long-legged Sprinter.
Palette/materials: matte dark desaturated teal skin with lighter sage-blue chest/underside; muted plum shoulder/back masses; restrained terracotta crest/ridge accents and warm amber eye. Navy contour shadows. Strong readable groups of color, very limited spots. No glossy black surfaces, no ornate copper armor.
Style cohesion: clean polished hand-painted 2D expedition game illustration. Strong painted shapes, restrained soft cel shading, dark navy contour accents, warm upper-left light. Share the visual language of a lime/olive Scout, a dusty-purple/teal Grunt, and an olive Tank with copper plates on a terracotta canyon battlefield. Readable at around 100–120 pixels tall, not photorealistic or glossy 3D.
Composition: exactly one complete figure centered with generous transparent padding. Head and aggression point LEFT. Side-on lane camera with only slight three-quarter depth; no frontal pose. Lean slightly forward in a grounded ready-to-strike stance with both feet visible, arms separated enough to read. All claws, crest and any short tail are fully visible. No cropped extremities and no extreme wide attack pose.
Transparency/avoid: genuinely transparent RGBA background. No scene, backdrop color, ground plane, exterior cast shadow, glow plume, haze, particles, motion blur, text, logos, watermark, UI, character sheet or multiple views.
```

## Gargantua prompt

```text
Use case: stylized-concept
Asset type: original transparent static heavy alien unit cutout for the Expedition 0.3 browser lane-defense game.
Primary request: ONE ORIGINAL GARGANTUA alien, full-body side-on view facing LEFT. An imposing broad heavy quadrupedal expedition creature with a high massive shoulder hump, deep barrel body, a broad blunt hammer-shaped head, and FOUR thick distinct column-like legs ending in large readable three-toed feet. Its proportions suggest weight and slow unstoppable momentum, not a quick predator. A low terracotta bony brow crown and a short row of thick rounded dorsal ridges reinforce the mountain-like silhouette. One clearly visible small warm amber eye under the brow looks left. Very short blunt balancing tail. Keep the face expressive and formidable without gore or horror.
Distinct identity: clearly different from a low olive turtle-like copper-plated Tank, a purple bipedal Grunt, and a tall angular muscular ManHunter. Do not simply enlarge another creature. This is a high-shouldered broad heavy animal, with natural skin and bone rather than overlapping copper mechanical armor. No franchise imitation, no xenomorph features, no weapons or rider.
Palette/materials: matte slate-violet/plum skin with broad desaturated blue-teal underside/leg planes, muted terracotta/copper-colored NATURAL bone ridges and brow accents, navy contour shadows, amber eye. Use broad clean color groups and limited texture; do not cover the creature in tiny scales or spikes. The warm accents relate to the canyon and the Tank's copper without reproducing the Tank shell.
Style cohesion: polished hand-painted 2D science-fiction expedition illustration with strong painted shapes, restrained soft cel shading, confident navy contours, and warm upper-left light. Slightly whimsical personality, practical readable game art, not photorealistic, not glossy 3D.
Composition: exactly one complete left-facing creature, side-on lane camera with slight depth so FOUR feet can each be seen, staggered gently rather than overlapping into one mass. Large feet sit on one readable baseline. Broad stance, head on left and body extending right, no huge attack pose. Keep every ridge, toe and tail tip inside generous transparent padding. Readable when shown roughly 115–125 pixels wide and 85–95 pixels tall; avoid giant external horns or appendages that obscure adjacent units.
Transparency/avoid: genuinely transparent RGBA background. No backdrop color, scene, ground plane, cast shadow outside the figure, haze, glow, particles, motion blur, lettering, text, logos, watermark, UI, character sheet or multiple views.
```

## Sprinter stride edit prompt

```text
Use case: precise-object-edit
Asset type: one alternate leg-contact pose for a two-pose Sprinter movement experiment.
Edit target: the supplied ORIGINAL Sprinter PNG, 1536 by 1024 pixels. It is an existing coral/teal LEFT-facing runner. Preserve the exact image canvas, framing, pose scale and transparent padding.
Primary request: change ONLY the TWO RUNNING LEGS from the hip joints down to the feet, creating the opposite stride contact. The nearer leg with coral on its upper thigh should now extend forward toward the LEFT and land at the forward foot position; the farther teal leg should extend back toward the RIGHT and land at the rear foot position. Keep two anatomically clear legs, no extra limbs, with both toe contacts at the same approximate y=929 ground baseline as the base image. This should visibly alternate leg direction while the body stays registered.
CRITICAL INVARIANTS: keep every visible pixel of the head, amber eye, crest, neck, torso, tucked forearms, back markings, hips and tail in the same location and with the same shape, proportions, colors, style and lighting. Do not redraw, move, rotate, enlarge, shrink or change the expression of the upper body. Keep the exact LEFT-facing orientation. Do not alter the coral/teal palette, navy outlines or painterly shading. The silhouette outside the changed legs must match the base. Keep full feet inside the original canvas.
Transparency: preserve genuine transparent alpha everywhere outside the creature silhouette. No ground, backdrop color, cast shadow, halo, glow, haze, motion streaks, particles, text, UI, watermark, or character sheet. Output only the one alternate full-body cutout on the same 1536 by 1024 transparent canvas.
```

## Integrity hashes

```text
8ba96d38ec2d78a692486e91b6b3508db9e7c864661921a9cc6414ee3bcac94b  sprinter-original.png
64faa4cc8d333c3d38d91bb729cc1846f27bbbdc3f2daf68c0fe999b1cea9ce1  sprinter.png
d434313e7325f7bab54bbe9dade7819f492aad7d9c986c281e0c6f0cfc159381  manhunter-original.png
5ce2b614cfa74ca98d43a014a8c6d7ef0fb7b971aa5fd51921f7aa7f70434c4d  manhunter.png
a2f8bc2bf76e34db572885d5b6f14215a1d66608dc35fec8672f3f8b3141d057  gargantua-original.png
6ab8c98702a97ebe798d305808e440dff7b9f91638ab09719b74b9d69b0d111f  gargantua.png
b5ae3d26099963af947eb8906ba8ba144c72b0179bfa342f9b41aaf4fa4fbd7a  sprinter-stride-experiment-original.png
```
