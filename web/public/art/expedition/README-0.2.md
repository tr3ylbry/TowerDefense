# Expedition 0.2 character cutouts

## Scope and provenance

Three original AI-generated prototype illustrations were created with the built-in OpenAI image generation tool, following the imagegen skill. Each unit used one separate text-to-image call with `transparent_background: true`. No fallback CLI, external stock art, or external reference images were used.

The current Expedition canyon, ranger, and plated crawler were inspected as visual references; the legacy Scout, Grunt, and TARS strips were inspected to understand their existing role silhouettes. Their visual properties informed the text prompts below. No existing figures were redrawn or supplied as edit targets. Generation and packaging did not overwrite legacy art or existing Expedition assets. Runtime integration is documented in the milestone report. This records provenance and does not make a separate copyright or licensing claim.

## Assets

| File                 | Use        |  Dimensions |     Bytes |
| -------------------- | ---------- | ----------: | --------: |
| `scout-original.png` | Art source | 1374 × 1145 |   858,339 |
| `scout.png`          | Browser    |   512 × 427 |   137,235 |
| `grunt-original.png` | Art source | 1376 × 1143 | 1,397,480 |
| `grunt.png`          | Browser    |   512 × 425 |   216,649 |
| `tars-original.png`  | Art source | 1180 × 1333 | 1,005,182 |
| `tars.png`           | Browser    |   453 × 512 |   177,912 |

Browser assets are in `web/public/art/expedition/`. Untouched selected generated PNG originals are in `web/art-source/expedition-0.2/`, outside the public build. Source copies were checked to be byte-identical to the tool outputs.

The browser group totals **531,796 bytes** (about **519.3 KiB**), below the 650 KiB target. Every browser image has a maximum dimension of 512 pixels and preserves its original aspect ratio and RGBA transparency. Conversion used Pillow proportional thumbnail resizing with Lanczos resampling and optimized PNG encoding only; no masks, flips, cropping, repainting, quantization, or semantic image edits were applied.

Renderer keys: `expedition-scout`, `expedition-grunt`, and `expedition-tars`. Browser paths: `art/expedition/scout.png`, `art/expedition/grunt.png`, and `art/expedition/tars.png`.

These are **static cutouts**, not animation frames. They can support procedural breathing, recoil, or hit reactions; they do not provide a walk cycle.

## Cohesion and inspection notes

- Existing canyon/ranger/Tank art shares warm upper-left light, dark navy contour shadows, mint/teal accents and restrained painterly shading. The copper Tank plates tie back to the canyon's terracotta palette.
- Legacy frequent Scout and Grunt sprites have dark low silhouettes; legacy TARS is a narrow pixel-art panel. Using painted cutouts for these frequent roles should reduce the visible mix of pixel art and painted illustration.
- Scout faces left and uses a light, agile lime silhouette with a large readable eye and swept-back crest. It has no heavy shell.
- Grunt faces left and uses a broader dusty-purple/teal body with only a few copper shoulder plates. Its barrel chest and low arms distinguish it from both Scout and the four-legged armored Tank.
- TARS faces right and uses a tall cream/navy/mint cabin torso, amber sensor and an asymmetric plasma tool. The recessed optics, service gripper and two short articulated legs give it an expedition utility identity rather than copying a film robot.
- Full-resolution outputs and compact served PNGs were inspected with `view_image`. Figures are complete, intended directions are clear, and no visible exterior ground plane, cast shadow, backdrop or glow is baked around the figures.
- PNG mode and alpha histograms were checked: all six files are RGBA with transparent pixels and opaque figure pixels. Served images retain alpha extrema 0–255.
- Final integration was reviewed in the actual board renderer on all three maps. The shared art registry uses proportional display bounds and foot anchors; portraits and original-art comparison were checked too.

## Generated source files

The built-in tool generation run was `01a184ee-d43f-7593-a004-7b14976f6131`; its selected output identifiers were:

- Scout: `exec-6f7cdab6-8e36-44fb-82f4-779f83da86a4.png`
- Grunt: `exec-d9e70cca-109c-4668-a92f-5d890e1d1e17.png`
- TARS: `exec-8aef871e-90e2-4ad2-b8c2-f101d993b8a0.png`

Project runtime references use only the local public copies, not the generated-image storage directory.

## Scout prompt

```text
Use case: stylized-concept
Asset type: original transparent static unit cutout for the Expedition 0.2 browser lane-defense game, suitable for small board sprites and portrait cards.
Primary request: ONE ORIGINAL small whimsical alien SCOUT, full body in side view facing LEFT. A light agile lime-and-olive alien with one large expressive amber eye clearly on its left-facing head, a compact bean-shaped soft body, two springy bent legs with broad simple feet, short tucked forearms, and a small distinctive swept-back crest. Curious alert expression, charming but capable. Mostly unarmored: do not give it a heavy plated shell or a tank-like silhouette. Invent an original creature, not a recognizable franchise character.
Style cohesion: match a clean hand-painted expedition game world with a terracotta canyon floor and twilight blue shadows, a cream/mint/orange astronaut, and an olive/teal crawler with copper plates. Use the same confident dark navy contours, restrained soft cel-shading, warm upper-left lighting, and simplified painterly surface treatment. Use readable grouped color shapes rather than tiny scales or noisy texture.
Composition: exactly one complete creature, head at LEFT and body extending right; full side view with both feet and every appendage visible. Keep a compact low-weight silhouette distinct from a broad armored grunt or a squat four-legged tank. Neutral alert ready-to-move posture, not a motion blur. Generous transparent padding all around. Strong readability when shown about 80–110 pixels tall.
Palette: soft yellow-lime highlights and muted olive body, small teal shadow accents, amber eye; navy shadows. Avoid neon glow.
Constraints: genuinely transparent RGBA background. No environment, no backdrop of any color, no ground plane, no cast shadow outside the silhouette, no haze, no external glow or particles. No text, no logos, no lettering, no watermark, no character sheet, no multiple figures, no UI. Do not crop any part.
```

## Grunt prompt

```text
Use case: stylized-concept
Asset type: original transparent static unit cutout for the Expedition 0.2 browser lane-defense game.
Primary request: ONE ORIGINAL alien GRUNT, full body side view facing LEFT. A broad stocky bipedal frontier creature with a low blunt head, compact neck, deep barrel chest, thick short legs, oversized three-toed feet, and sturdy forearms held low. Dusty muted purple skin across its head/shoulders/back and desaturated teal belly and limb undersides. A visible amber eye faces left beneath a simple heavy brow. Restrained copper armor: only two or three modest shoulder/upper-back plates, not a complete shell. Its silhouette should convey a heavier bruiser, clearly different from a small agile lime scout and from a low four-legged tank.
Original design: invent a charming formidable alien with simple clean anatomy, no gore, not a recognizable creature from an existing franchise. No humanoid clothing, no tools or weapons. Avoid giant horns, huge spikes, and tiny surface markings.
Style cohesion: clean polished hand-painted 2D expedition game illustration. Confident dark navy contours, restrained soft cel-shading, simplified grouped shapes and soft warm upper-left lighting. Same art family as a cream/mint/orange astronaut, a lime/olive scout and an olive/teal plated crawler with copper plates, all on a terracotta canyon floor with twilight blue shadows. Let purple/teal be the dominant body colors, with copper as a small accent.
Composition: exactly one complete figure, head at LEFT, rump at right, all feet/arms/plates visible, side-on camera with only slight three-quarter depth for readability. Broad compact stance, no foreshortened frontal pose. Neutral ready posture suitable for subtle procedural breathing. Centered with generous transparent padding, no cropped extremities. Readable about 100–120 pixels tall.
Constraints: genuinely transparent RGBA background. No environment, no backdrop color, no ground or ground plane, no cast shadow outside the silhouette, no haze, no external glow or particles. No lettering, text, logo, watermark, character sheet, multiple figures, or UI.
```

## TARS prompt

```text
Use case: stylized-concept
Asset type: original transparent static unit cutout for the Expedition 0.2 browser lane-defense game; utility robot specialist.
Primary request: ONE ORIGINAL expedition utility robot called TARS internally, but WITHOUT any lettering in the image. Full-body side-on view facing RIGHT. Preserve a tall boxy specialist identity: one narrow upright rectangular cabin-shaped torso, integrated amber optical sensor near its upper front-right edge, practical layered cream service panels with navy structure and mint technical insets, two short independent mechanical legs with broad stable feet. An asymmetric compact articulated plasma-tool arm extends horizontally to the RIGHT from mid-torso; the other short service gripper stays folded near its body. One small orange safety accent. Invent a clear original expedition robot design.
Design constraints: not a humanoid astronaut, not a round mascot, and not a copy of any film/franchise robot. Do NOT use a four-block pivoting slab body. Use a distinctive single cabin torso with two short leg joints, a recessed sensor, asymmetric tool arm and practical panels. No head shaped like an astronaut helmet. The tool and sensor clearly aim right.
Style cohesion: clean polished hand-painted 2D game illustration matching a chunky cream/mint/orange astronaut and expressive olive/purple alien creatures on a terracotta canyon floor. Confident dark navy contours, restrained soft cel-shading, slightly warm upper-left lighting, gentle cool mint shadows, grouped color panels, limited detail and no tiny busy controls. Cream/navy/mint remain dominant; amber sensor and tool core are small strong accents.
Composition: exactly one complete robot centered with transparent padding on all sides, entire top, feet, folded gripper and tool tip visible. Tall upright silhouette clearly different from the round astronaut ranger and the low aliens. Side view with slight three-quarter depth solely for readability, no frontal pose. Neutral ready stance suited to gentle procedural recoil, not motion blur. Readable around 110–130 pixels tall.
Constraints: genuinely transparent RGBA background. No environment, backdrop color, ground plane, external cast shadow, haze, surrounding glow, beam or particles. No text, no letters or numbers, no logos, no watermark, no character sheet, no multiple views, no UI. Do not crop any part.
```

## Integrity hashes

```text
66dac6903c2d38e6d012f2b79fa270fc76827b40b43651b456dbce27982f46ef  scout-original.png
f052710cd668ad1479ea864e1cb67374549a346dfe6ae909947123cb271123f4  scout.png
5ce4d4b61356d635b12f4e9246f920760c8cdf74fda558e8cfa446af83d74780  grunt-original.png
91e7b5409b992c2c8a13d8b2e33a14d4c1971e8e812d990a9d61d17bfedf6fd2  grunt.png
c267efa5fc238123b3c5a97bb70665c23565a7921bcdba90696dd8e75b26623e  tars-original.png
d2c1ceffc99c4e2a0d964353e9388015dd158b30f3a7362b9952df3c02dc277f  tars.png
```
