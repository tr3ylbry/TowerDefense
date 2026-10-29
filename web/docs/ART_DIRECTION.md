# Expedition art direction

## Visual identity

An illustrated science-fiction expedition with playful creatures, practical equipment, and a slightly whimsical crew. Use strong painted shapes, soft restrained cel shading, navy contour shadows, and warm upper-left light. Favor curiosity and character over horror, photorealism, glossy mobile-game surfaces, tiny material noise, or franchise imitation.

## Palette and environments

| Purpose                   | Palette                                            | Treatment                                              |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| Interface / shared shadow | Navy `#102330`, cream `#E7EAE2`                    | Stable text and silhouette contrast                    |
| Friendly equipment        | Mint `#93D7BD`, cream, restrained orange `#F3A17A` | Broad suit/robot panels; small amber sensors           |
| Canyon                    | Terracotta, dusty orange, twilight blue            | Warm open plateau; cliffs/colony details outside lanes |
| Sky Bridge                | Cool slate and cyan `#91D7E0`                      | Retained scenery with illuminated perimeter rails      |
| The Nest                  | Organic violet `#C7A2DA`, muted greens             | Retained scenery with sparse peripheral veins/spores   |
| Damage / danger           | Warm amber/coral                                   | Triangle + critical text; never color alone            |
| Plating                   | Ice blue                                           | Shield outline, diamond warning, plate ricochet        |
| Heavy arrival             | Warm coral                                         | Double-exclamation warning, explicit creature name     |

Biome decoration stays outside the playable rectangle or at very low contrast. Procedural Bridge/Nest treatments complement retained school backgrounds; they are not new generated environment illustrations. Enemy placement restrictions and collision rules are unchanged by art style.

## Silhouettes and materials

- Astro: rounded helmet, cream/mint suit, compact right-facing tool; welcoming expedition identity.
- TARS: tall boxy utility robot, distinct sensor and right-facing precision tool; preserve readable negative space between tool and body.
- Scout: small lime/olive runner, oversized expressive eye and clear spines; light/unarmored.
- Grunt: broader purple/teal body, heavy forelimbs, limited copper shoulder/back plates; sturdier silhouette without implying Tank-level mechanical armor.
- Tank: low wide crawler, overlapping copper shell and amber eye; armor is recognizable from shape and the persistent shield outline.
- Sprinter: coral/teal, forward-leaning, long springy legs and swept crest; light and fast without copying the lime Scout.
- ManHunter: taller angular dark-teal/plum hunter with distinct long forearms/claws; strength reads from the body rather than a Tank-like shell.
- Gargantua: broad slate-violet quadruped with terracotta ridge and large grounded feet. Its width, low heavy posture, and close-contact cue identify the major threat; the ridge is not gameplay plating.

Material families are matte fabric, brushed cream/navy equipment, copper plates, and softly shaded skin/shell. Keep the strongest contrast around faces, sensors, hands/tools, and armor boundaries. Cosmetic Grunt plates do not confer a hidden armor rule; only the Tank has gameplay plating in 0.2.

## Camera, scale, and grounding

Use a side-on or very slightly elevated lane camera. Defenders face right; aliens face left. Avoid strong foreshortening or an environment vanishing point through the playable center.

The grid is 100×74 world units per cell. Place visible feet on a shared ground line 29 units below the lane center. Static cutouts retain their transparent padding; `src/game/art.ts` records proportional display dimensions and a per-image foot origin. This fixes grounding without destructive cropping or stretching.

Approximate displayed bounds: ranger 80×74, TARS 67×76, Scout 66×55, Grunt 86×71, Tank 108×72, Sprinter 102×68, ManHunter 96×88, Gargantua 122×89. The Scout should look lighter than the Grunt; the Tank is wider and lower rather than simply taller. Legacy sprites retain their own animation sheets, using the same ground line. Giant enemies can extend above their lane, but health bars and ground cues must remain attributable to the correct row.

## Existing prototype evaluation

- **Canyon:** its broad quiet ground and edge-framed cliffs work behind six lanes. The warm/cool split supports readable cream/mint units. Retain it; avoid adding central props that obscure cells.
- **Ranger:** suit colors, navy edges, tool direction, and expression establish the shared character language. Retain it; use subtle breathing/recoil and a corrected foot origin rather than generating inconsistent firing frames.
- **Plated crawler:** a good low/wide armored silhouette and palette match. Its image has more transparent space below the feet than the ranger; an explicit foot origin corrects apparent floating. Retain it.
- **0.2 additions:** Scout, Grunt, and TARS replace the most visible stylistic mismatches in a coherent combat subset. Their outlines and shading were inspected together, including alpha and facing direction. Expedition 0.3 completes the alien group with Sprinter, ManHunter, and Gargantua. Seven defenders still use school art, so full defender-roster cohesion remains unfinished.

## Animation and feedback

Simulation owns wind-ups, projectile releases, impacts, damage, income, and destruction. Animation reads those events; decorative keyframes never determine damage.

- Interpolate travel between fixed rule updates.
- Use restrained breathing/stride and a short, small recoil rather than large elastic bouncing. Sprinter has a quicker, slightly higher gait; ManHunter leans into a slower stride; Gargantua has a low-frequency heavy sway. These move only the rendered cutout, never its simulated position.
- A normal hit gives a brief warm silhouette flash and restrained reaction. Plate-resistant hits use a smaller reaction, blue ring/ricochet, and PLATED cue; piercing impacts use mint/cool accents.
- Splash rings show the actual horizontal radius and stay within the affected lane.
- A defender taking damage gets a brief flash plus a longer outline. Below 30% health, keep a static triangle/outline and HTML critical label.
- Gargantua’s close-contact ring anticipates its next recurring strike over the last 0.3 game seconds of its existing cooldown. It adds no attack delay or grace period. Reduced motion shows a static contact cue instead.
- Corpse animation/fade preserves the foot anchor; remove transient effects after completion.
- Cap transient effects and avoid camera shake or continuous particle storms.
- Pause freezes game-time motion and effects. Reduced motion removes flashes, recoil/stride, expanding effects, and decorative twinkles while retaining health, critical, plating, and incoming-threat information.

## Asset pipeline and provenance

Use the original conversion manifest for retained school art. New cutouts are alpha PNGs, proportionally resized to at most 512 pixels; generated full-resolution originals live outside `public/` and the production build. Never overwrite original school images.

The art switch must repeatedly restore both school textures/animations and Expedition cutouts, including portraits. It changes presentation only.

Prompts, selected generation sources, dimensions, alpha checks, byte sizes, and hashes are recorded in [the prototype record](../public/art/expedition/README.md) and [the 0.2 record](../public/art/expedition/README-0.2.md). The 0.2 three-cutout group totals 531,796 bytes (about 519 KiB). These are static images animated procedurally, not generated animation sheets.

## Expedition 0.3 sources and loading

The new three-cutout group totals 568,457 bytes (about 555 KiB). It completes all six alien illustrations, retaining the original sprite sheets for comparison on demand. The initial game loads only the current environment and selected art style. Successfully loaded textures/animations are cached across switches and restarts; failures retain the existing paused presentation until retry or cancellation.

A single authored alternate Sprinter stride was generated and evaluated. Its leg-contact change was insufficient and its body repaint risked flicker. It is preserved outside public assets as a rejected experiment; no animation-sheet claim is made. Procedural motion was retained and differentiated by role. See [0.3 prompts and evaluation](../public/art/expedition/README-0.3.md).
