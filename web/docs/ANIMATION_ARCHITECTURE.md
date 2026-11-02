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
