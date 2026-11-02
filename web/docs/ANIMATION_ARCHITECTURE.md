# Simulation-driven character presentation

## Baseline and decision

Original mode uses retained school walk/attack/die sprite strips with Phaser animation playback. Expedition 0.8 uses one illustrated cutout per alien, with game-time whole-image bob/lean, event-driven hit flashes and fading death presentation. Those effects do not articulate limbs.

0.9 selects a **hybrid: a layered joint rig baked offline into a conventional atlas** for Sprinter only. Nine source cutouts become 24 walk, eight idle and 16 attack poses. Runtime still uses one existing Phaser Sprite per alien, one texture and explicit frame selection. No skeletal library, runtime joint objects, second combat clock or dependency is added.

| Approach                  | Quality/iteration                                                                                                                     | Runtime and delivery                                                                                                                | Decision                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Generated complete frames | Easy to request, hard to hold face, lighting, anatomy and scale steady. The retained 0.3 experiment changed shading more than stride. | Simple sprite player; repeated torso pixels per frame.                                                                              | Rejected previous experiment remains excluded. No repeat of that production path.        |
| Runtime layered rig       | Same painted parts in every pose, continuous interpolation; pivots require manual review.                                             | Roughly nine part objects per Sprinter rather than one; compact part download. Would complicate existing hit/death/style lifecycle. | Assessed, not built into the game. No claim of measured runtime superiority/inferiority. |
| Baked joint rig           | Stable source pixels and controlled foot paths; inspectable individual poses, editable pivots. Finite-frame quantization.             | One Sprite per enemy; 118.4 KB extra texture. Existing loading, caching, cleanup and draw path.                                     | Selected, smallest runtime change.                                                       |

## Responsibilities

- `scripts/build-sprinter-animation.py`: component extraction, pivot geometry, two-bone leg solving, depth order, affine pose baking, packing, encoding and conversion manifest. Build-time tooling only.
- `src/game/alien-animation.ts`: asset definition and pure presentation state/frame selection. It reads authoritative positions, elapsed time, attack state and cooldown; never mutates the simulation.
- `assetsFor`: requests only the selected environment/style, static roster and this single pilot atlas. Every current mission contains Sprinters. It does not request speculative future character atlases. Original style defers the Expedition atlas.
- `battlefield.ts`: interpolated placement, explicit frame, display geometry, existing hit/death/health effects, Original comparison and transactional resource lifecycle.

## Grounding and clocks

Walk uses interpolated x and a 48-world-pixel stride. During its 60% stance, each planted foot advances right relative to the torso at 48 world pixels per cycle, cancelling the creature's leftward world movement. The opposite leg is half a cycle apart. Swing lifts eight pixels and returns to the front. Torso weight shift is half a pixel; the head/torso/tail share one part. Foot targets stay on the same ground baseline. Finite-frame selection introduces up to approximately two world pixels of stance quantization; it is not continuous IK at runtime.

An enemy with differing current/previous positions walks. A stationary non-attacking enemy idles. Normal rules rarely yield a sustained idle; the development fixture demonstrates it without adding pauses to combat. Idle uses a 2.4-game-second restrained breathing cycle.

`enemy.attacking` has priority. Sprinter deals damage immediately when its 0.75-second cooldown resets. Attack frame zero is contact, followed by recovery and anticipation of the next authoritative strike. Interpolation advances within the current cooldown but never wraps to the next contact before its damage tick. Animation causes no damage or attack delay. Actual defender-hit events remain authoritative for existing feedback.

Pause freezes the simulation's elapsed time, positions and interpolation remainder, therefore the current pose. 2× traverses the same distance twice as quickly and advances the stride accordingly. Reduced motion chooses a stable representative walk, idle or contact pose; combat information remains in state, bars and existing static markers. Hit/death remain the established effects rather than new authored clips.

## Lifecycle and comparison

The atlas uses the same required asset transaction as other imagery. A failed load refuses the transition and offers the existing retry/cancel path. The retained static illustration is available as a renderer fallback; a required download error is not silently ignored. Manual pose atlases use `fps: 0` and do not register an autoplay controller.

Expedition→Original stops manual presentation and plays the retained school action. Returning stops school playback before selecting an atlas frame. Both styles reuse the same entity Sprite and simulation. Enemy removal uses the existing death/fade path; restart destroys/replaces entity objects through the established unique-ID lifecycle. No per-enemy listeners, timers, containers or cached pose controllers are added.

## Scope for another character

Do not assume these biped pivots fit Tank or Gargantua. A next pilot needs its own parts, anatomy, contact path and review. Reuse the pure state/timing pattern and asset transaction only after measuring its atlas cost. Complete human readability, device and art-permission checks before a broad rollout. See [0.9 provenance](../art-source/expedition-0.9/prompts.md), [conversion manifest](../art-source/expedition-0.9/conversion.json) and [milestone evidence](EXPEDITION_0_9.md).

## Expedition 1.0: two rigs, one runtime contract

The 0.9 discussion above is the preserved design history. The initial1.0 pilot registry contained **Sprinter and Gargantua**; the owner-requested follow-up below completes all six. Both use a single existing Phaser Sprite, `fps: 0`, and the shared pure `alienPose(kind, enemy, elapsed, interpolation, reducedMotion)` selector. Sprinter's compatibility wrapper remains for the earlier fixtures/tests. No combat/snapshot/save schema changes are needed.

| Responsibility    | Shared                                                                                                                                                         | Character-specific                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Source/extraction | Alpha component extraction with four-pixel antialiased halo; reviewed component count                                                                          | Sprinter reuses nine accepted 0.9 parts/origins; Gargantua extracts torso and four whole limbs from a new generated derivative |
| Painting/identity | Same source pixels reused across poses; no per-frame generation                                                                                                | Sprinter coral/teal biped; Gargantua slate-violet quadruped with broad head, shoulder hump, ridge and short tail               |
| Articulation      | Offline affine transforms, distance-cancelling stance, Hermite swing with tangent contact                                                                      | Sprinter two-bone IK and swing-only foot roll; Gargantua continuous scanline limb mesh anchored independently at root/ankle    |
| Gait              | World distance selects walk phase; feet remain on common ground                                                                                                | Sprinter 48px stride, 60% stance, opposite legs; Gargantua 28px stride, 75% stance, lateral four-beat LH→LF→RH→RF              |
| Idle              | Elapsed simulation time, eight poses, planted feet                                                                                                             | Sprinter 2.4s cycle/.25px torso shift; Gargantua 3.2s/.22px                                                                    |
| Attack            | Real cooldown reset is contact; recovery then next-strike anticipation; no predicted damage                                                                    | Sprinter .75s/16 poses; Gargantua 1.2s/16 poses and a restrained 4px body-driven lunge                                         |
| Atlas/validation  | Eight columns; contiguous ranges, nonempty RGBA cells, no boundary clipping, grounding tolerance≤2 source pixels, decoded alpha equality, source/output hashes | Sprinter 160×120×48 (1280×720); Gargantua 160×120×40 (1280×600)                                                                |
| Loading/lifecycle | Required asset transaction, retry/cancel, one Sprite, existing removal/restart/style cleanup                                                                   | Registered atlas and display geometry; other four aliens retain procedural cutouts                                             |

`animation_tools.py` shares extraction, affine transforms, source-pixel mesh deformation, two-bone geometry, smooth foot path and validated packing. `build-alien-animations.py` contains two deliberately separate rig functions. A generic skeleton would hide important anatomy differences; no animation-editor framework or runtime bone hierarchy is introduced. Gargantua's initial sliced upper/lower-limb experiment exposed seams and distorted extremities. It is retained as a rejected source preview; the accepted mesh keeps each broad painted limb continuous. Only root/ankle anchors drive the accepted mesh.

Build from `web/` with `PYTHONDONTWRITEBYTECODE=1 python3 scripts/build-alien-animations.py`. Pillow is the existing offline image tool, not a browser dependency. Run `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts -p 'test_animation_tools.py'` for contact-tangent and malformed-output checks. Rebuilding emits full PNG atlases/metadata under `art-source/expedition-1.0/` and only optimized WebP derivatives under `public/art/expedition/`. Encoding is validated before publishing its output bytes. Vitest checks registry geometry, contiguous sequences, output hashes, alpha/grounding metadata and state behavior. See [source prompt](../art-source/expedition-1.0/prompts.md), [Sprinter conversion](../art-source/expedition-1.0/sprinter-conversion.json), [Gargantua conversion](../art-source/expedition-1.0/gargantua-conversion.json).

Sprinter keeps 24/8/16 poses. Its swing now joins stance with continuous horizontal velocity and zero vertical landing velocity; foot roll is restricted to swing. Reduced body displacement and eased attack recovery/anticipation are qualitative refinements, not a frame-count increase. The prior accepted WebP remains outside public delivery at `art-source/expedition-1.0/sprinter-0.9.webp`; Git history and the original 0.9 authoring script also remain.

Gargantua has 16/8/16 poses. Its 28-world-pixel cycle takes about 1.56 game seconds at its unchanged 18px/s speed, versus Sprinter's≈1.12s. Each leg's swing occupies one quarter-cycle, leaving three support feet. The torso shifts only .3px during walk; individual roots flex against planted ankles. Fixed painted torso/head/ridge pixels prevent material/face flicker. This is a 2D deformation of source parts, not a physically simulated skeleton or newly painted frame set. Finite pose selection still quantizes contacts by up to about two world pixels. Enlarged art remains softer than the source illustration.

The existing Gargantua contact ring now uses elapsed age since the authoritative cooldown reset, fading over .18 game seconds. Previously it appeared at the late end of the cooldown. Reduced motion retains a static attack-state cue. No animation events are sent to live regions.

### Adding a third alien

First establish a source identity, parts/anchors and believable foot path for its anatomy. Reuse utilities, not the other creature's skeleton. Bake reviewed frames and record hashes/grounding. Add a registry definition and a small pose-layout entry, then verify contact timing against that alien's existing cooldown. Extend atlas metadata tests, actual-combat style/retry/restart checks and the dense mixed fixture. Measure cold startup/decoding and warm retention before accepting delivery. The renderer already handles registered alien kinds; it needs no new branch for each third character. Follow the [provisional performance budget](../reports/expedition-1.0/performance/README.md). Do not roll out every atlas by default.

## Owner-requested all-six follow-up

`build-roster-animations.py` adds reviewed anatomy-specific configs for Scout, Grunt, ManHunter and Tank. Each uses five generated components: fixed torso/head/tail plus four whole limbs. Biped arms rotate around reviewed shoulders; legs use the existing continuous source-pixel mesh anchored at root/ankle. Tank uses a diagonal-pair crawl, separate from Gargantua’s lateral four-beat gait. Forty128×96 cells pack into1024×480; source PNG, pivots, configuration, hashes, ground and alpha validation remain in each conversion manifest. No runtime rig or new dependency is added.

`ALIEN_ANIMATIONS` now covers every EnemyKind. All authored missions contain those six kinds; `assetsFor` requires their sheets before Begin and omits duplicate static battlefield cutouts. Guide portraits remain deferred. The same pure selector handles actual distance, elapsed time, authoritative contact cooldown, pause, speed and reduced motion. No simulation balance or save schema changes. New fixture/testing and separate all-roster performance data document this explicitly requested expansion; historical two-pilot results remain separate.

Original style uses `original-registration.ts`, generated from the union of alpha≥32 bounds across all419 retained frames. It preserves aspect ratio, centers the visible union and fits86×62 world pixels inside100×74 cells; `original-fit-review.py` independently checks every frame against runtime metadata. Original playback remains authored walk/attack/death and idle/fire. Extra whole-image tower recoil is disabled for Original to preserve the fit. No school pixels are rewritten.
