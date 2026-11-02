# Astronauts vs Aliens — browser edition

The full original character and map roster, built with TypeScript, Phaser, and Vite. This is Trey Bryant's independent continuation of the original CSC 335 team project by Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.

Expedition 1.0 refines articulated Sprinter motion and adds a contrasting quadrupedal Gargantua pilot, with a reproducible offline animation pipeline and measured delivery/rendering budget. The optional First Contact Hard prototype gains clearer armor-counter guidance. Earlier wave guidance, coverage/recovery advice and centered mobile time controls remain. Local progression, shield-based stars, replay and next-mission navigation span six missions in three illustrated environments. The original three standalone missions and all combat/economy rules remain intact. Saves retain their validated version-1 format and in-memory fallback.

See the [1.0 milestone report and readiness decisions](docs/EXPEDITION_1_0.md), [animation architecture](docs/ANIMATION_ARCHITECTURE.md), [preserved gameplay/Hard reassessment](reports/expedition-1.0/research/README.md), [animation budget](reports/expedition-1.0/performance/README.md), [publication inventory](reports/expedition-1.0/assessment/RIGHTS.md), [campaign architecture and save schema](docs/CAMPAIGN_ARCHITECTURE.md), [1,296-run pacing study](reports/expedition-0.8/research/README.md), [art direction](docs/ART_DIRECTION.md), [provenance](ASSET_CREDITS.md), and [existing five-player kit](playtest/README.md). Independent players and live assistive technology remain pending. Native Safari1.0 victory and genuine owner iPhone17/Safari feedback are recorded; targeted phone fixes await final device recheck and longer-session measurements. Engineering candidacy is conditional; public release remains blocked by retained-art permissions and external validation. Hosting is separate.

## Run locally

Node 22.12+ is required; Node 24 is used in CI.

```sh
cd web
npm ci
npm run dev
```

Open the Local URL printed by Vite. No API keys, account, database, or backend service are needed.

## Play

Choose **Campaign** in the main navigation or destination selector to enter Mission control. Review an unlocked mission, prepare its battlefield, then Begin. Win with one, two or three shields to earn the same number of stars and unlock the next mission. Best stars survive losses and replay; the board shows completion out of six and stars out of eighteen. Returning to Mission control pauses the current deployment; preparing another mission explicitly abandons it. Your progress lives in this browser only; there is no mid-mission save. Reset campaign progress asks for confirmation and leaves unrelated settings alone. A save warning means you can keep playing, but unsaved progress may be lost when the tab closes.

First Contact's mission briefing offers **Normal** (default) or **Hard challenge · prototype**. Hard uses compact lane relays and more existing Sprinters/Tanks, with unchanged health, damage, prices, 230-credit opening and three shields. Its results never save stars or unlock missions. Restart keeps Hard; reviewing/preparing a mission defaults to Normal. The 1×/2× button controls simulation speed independently. No other mission has a difficulty tier.

| Mission               | Environment | Identity                                        |
| --------------------- | ----------- | ----------------------------------------------- |
| 01 First Contact      | The Canyon  | Original open-terrain mission                   |
| 02 Canyon Escalation  | The Canyon  | Runner sweeps and a plated pincer               |
| 03 Broken Ground      | Sky Bridge  | Original twelve-acid-cell crossing              |
| 04 Bridge Under Siege | Sky Bridge  | Clustered mixed assaults and escorts            |
| 05 Into the Nest      | The Nest    | Original sixteen-acid-cell paired relays        |
| 06 Heart of the Swarm | The Nest    | Heavy anchors, escorts and a three-stage finale |

**Standalone** remains the default. Choose The Canyon, Sky Bridge or The Nest with Change destination, or Standalone destinations from Mission control. Those original schedules are freely accessible and do not award campaign progress. Every mission has six lanes, nine columns, four waves and the complete roster. Each breach costs one of three shields. Clear every scheduled enemy with a shield remaining to win.

| Key | Defender            | Cost | Browser role                                  |
| --- | ------------------- | ---- | --------------------------------------------- |
| 1   | Astro Joe           | 50   | Steady single-target fire                     |
| 2   | Money Bush          | 60   | 25 credits every 6 seconds                    |
| 3   | Asteroid            | 35   | Durable barrier                               |
| 4   | Moon Zeus           | 125  | Heavy plasma; small splash radius             |
| 5   | Explosive Astro Joe | 85   | Slower shells; wider splash radius            |
| 6   | Startrell Cluggins  | 75   | Rapid fire and fast projectiles               |
| 7   | TARS                | 100  | Piercing rounds ignore Tank plating           |
| 8   | Money Tree          | 150  | 60 credits every 8 seconds                    |
| 9   | Frontier Flagship   | 250  | Three ammunition types per volley in one lane |

Sky Bridge has 12 restricted acid tiles; The Nest has 16. Their positions match the original Java maps. Defenders cannot be placed there, and aliens cross them normally. A mid-mission destination change explains that it will reset progress; closing the selector resumes the existing mission. Restart keeps the chosen map.

- Starting a mission enters a focused control deck. The Focus switch returns to the full page. The art switch compares the Expedition prototype with the original school artwork without changing combat rules.
- Click/tap a crew card and then a tile to deploy. Number keys 1–9 also select crew.
- Tab to the battlefield; arrow keys move between tiles; Enter or Space deploys.
- P pauses/resumes the entire simulation. Changing tabs automatically pauses it.
- N or **Call next wave** advances an eligible wave with a three-game-second lead. The button shows its exact reward, approximate time saved, waiting alternative and overlap risk; the first wave keeps its preparation time.
- X selects salvage, returning 40% of the unit's cost. Escape clears selection.
- The speed control switches between 1× and 2× while preserving cooldowns and schedules.
- Sound is off by default and uses original synthesized effects. Reduced motion defaults to the OS preference and can be changed and saved locally.
- The entire battlefield fits narrow screens. **Enlarge field** provides a pannable closer view; **Overview** restores the whole board. The crew bar scrolls horizontally; keyboard selection scrolls its active card into view.

Tanks have 650 health, move at 0.26 tiles/second, and absorb 80% of ordinary projectile damage. TARS ignores plating; Moon Zeus bypasses 65% of it, Explosive Astro Joe 40%, and the Frontier Flagship 75%. This is per-impact penetration, not a lasting debuff. The wave briefing lists the next group and flags armored arrivals. Canyon waves start at 7, 29, 56, and 87 game seconds. Bridge’s schedule and every original acid coordinate remain unchanged. Nest waves 3–4 pair existing enemies across three seeded lanes before shifting to the other three; its briefing and lane warnings describe the actual schedule.

Calling a wave saves `scheduled next start − current game time − 3` seconds and awards `min(40, 2 × floor(seconds saved))` credits once. It becomes available after every current-wave entry has spawned, with at least a whole second to save. All remaining spawns shift by the same amount, preserving lane order and spacing. Living enemies remain on the field. Pause blocks calls and freezes the adjusted schedule; restart/destination changes restore the baseline. Lane warnings derive from actual arrivals within five game seconds, including rescheduled entries.

Startrell now fires every 0.25 seconds (formerly 0.30), with unchanged damage, health, and price. This is the only unit-stat adjustment in 0.2. Astro retains cheap opening coverage; TARS retains its strong plating advantage.

Fresh shots travel right. A lane containing guns can still have a hostile that has passed all their direct firing lines. The amber marker and contextual advice suggest a legal left-side firing tile or a salvage/breach decision. Farther-right placements remain legal for future arrivals; splash and in-flight shots may still help. This feedback does not change collision or damage.

Starting credits: 230. The outpost supplies 30 every five game seconds. Each active Money Bush generates 25 every six game seconds and each Money Tree generates 60 every eight; selling or losing it stops that income immediately. Defeated aliens award additional credits.

## Verify

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:e2e
```

`check` runs deterministic simulation tests, strict TypeScript checking, and a production build. There are 188 rule tests and 60 browser scenarios per engine (Chromium, Firefox, WebKit). New checks cover deferred/cached artwork, slow and failed transitions, preserved mission state, economy guidance and receipts, touch targets, landscape, audio gestures, and repeated lifecycles. Browser tests also cover deployment, economy while paused, salvage, restart, nine-key crew selection, both restored maps, acid-tile rejection, safe destination changes, the alien field guide, narrow viewports, saved motion preferences, and asset-load failures. They also check desktop focus controls, phone overview/zoom, all nine crew cards, automatic crew scrolling, plating guidance, live art comparison, keyboard wave calls, warning updates, and loading failure for new artwork. On a local machine with Chrome already installed, `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e -- --project=chromium` uses that browser instead. Desktop WebKit tests are not physical Safari/iOS testing. See the milestone report for local engine availability and CI results.

The simulation tests include a full four-wave victory on every map using only earned credits, plus undefended losses. They also check every defender's price and health, original ammunition and three-shot volleys, projectile speeds, actual cluster damage, both income units, map restrictions and selection, frame-size independence, speed changes, input bounds, snapshot isolation, and restart cleanup. New checks verify wind-up/release timing (including pause and salvage), interpolation state, actual armored impacts, and 108 winning specialist/economy runs across twelve seeds and three maps. Twelve fixed twelve-Astro Canyon runs now lose, preventing the old unattended opening from remaining a guaranteed win. An additional 36 clear-field early-call specialist runs win across the same maps/seeds and finish earlier than their automatic-schedule counterparts. Tests cover capped/duplicate/near-deadline rewards, schedule spacing and lane order, pause and speed changes, warning boundaries, pressure/destruction events, and cleanup. These synthetic strategies are regression checks, not exhaustive balance proof.

## Structure

```text
src/game/environments.ts Reusable terrain, environment IDs and geometry
src/game/missions.ts     Six authored missions and stable campaign order
src/game/content.ts      Typed units, seeded spawns and original MAPS compatibility
src/game/validate-content.ts Lightweight content authoring checks
src/campaign/            Progression, result integrity, isolated saves and campaign board
src/game/challenges.ts   Opt-in First Contact formation variant, separate from Normal
src/game/alien-animation.ts Pure simulation-driven Sprinter/Gargantua state/frame selection
src/game/simulation.ts   Fixed-step rules and mutable wave timeline; no browser/Phaser
src/game/waves.ts        Early-call reward and short-horizon warning rules
src/game/combat.ts       Shared preserved aim/muzzle/collision geometry
src/game/threats.ts      Pure direct-fire coverage and legal placement advice
src/game/art.ts          Cutout dimensions, foot anchors, and biome palette
src/assets.ts            Pure required map/style asset plans
src/guidance.ts          Contextual coverage, economy, and refund descriptions
src/battlefield.ts       Phaser loading/cache, sprites, health bars, and effects
src/main.ts              Accessible HTML controls and mission lifecycle
src/audio.ts             Opt-in synthesized sound effects
public/art/              Optimized school art and Expedition prototype
art-source/              Full-resolution generated originals (excluded from builds)
scripts/prepare-assets.py  Reproducible conversion from the original assets
tests/                   Rule tests and browser interaction tests
```

All spawning, income, movement, attacks, and win/loss checks follow one simulation clock. Rendering reads snapshots; screen coordinates do not determine game rules. Enemy and projectile positions interpolate between 20 Hz rule updates. Attack wind-ups, shot releases, and impacts use the same simulation clock; pausing never leaves a pending shot running. Fire animations restart on actual releases and fit within cooldowns. Sprinter and Gargantua use offline-baked articulated pose atlases selected from simulation state. Other illustrated cutouts retain procedural motion and event-driven recoil. No animation changes combat outcomes. Critical income/breach tones have separate throttles from gunfire.

The interface has a real HTML keyboard-accessible grid over the Phaser canvas.

## Build and future site integration

```sh
npm run build
npm run preview
```

The deployable static site is `web/dist`. Its relative asset base supports hosting under a subsection such as a Treydmark Labs game path. Hosting, portfolio presentation, domains, and publication are owned separately by Treydmark Tech. The simulation can also be mounted behind a future React wrapper; the game loop does not require React renders.

Phaser is an isolated dynamic chunk, about 357 KB gzip. The first mission requests only the current environment and selected character style; other backgrounds, acid terrain, and school comparison sheets load when needed. Opening the destination selector also loads its thumbnails. Successful textures and animations remain cached across destinations and restarts. Failed transitions keep the current mission paused and offer retry or cancellation. See the [current matched measurements](reports/expedition-0.7/performance/README.md) and [0.5 delivery evidence](reports/expedition-0.5/performance/README.md). Campaign descriptions add text/code, not another initial art dependency; scenery is shared between missions.

All fifteen illustrated character cutouts total 508,362 bytes; initial imagery totals 600,697 bytes. Full-resolution sources stay outside `public/` and the deployable build. [Prototype prompts](public/art/expedition/README.md), [0.2 provenance](public/art/expedition/README-0.2.md), [0.3 prompts and evaluation](public/art/expedition/README-0.3.md), and [0.4 defender provenance](public/art/expedition/README-0.4.md) record their origins. All nine defenders, six aliens and three environments have Expedition art. Original comparison retains school art; external provenance remains a public-release issue. All fonts are local system fonts; no analytics or remote runtime APIs are used.

## Original version and content

The original Java source, assets, generated documentation, and school presentation remain unchanged in the repository. The original commit is preserved by the annotated `school-project-2019` tag and the `master` comparison branch. Browser work belongs to `modernization`.

All original defenders, alien types, and maps are playable. This is a browser adaptation: the existing nine-column browser field remains, statistics and wave schedules are balanced for its simulation clock, splash damage is explicit, and the Falcon retains its original three ammunition types. It does not reproduce the Java timer/collision bugs or claim exact numerical parity. The original Double Cost mode, drag-and-drop interaction, menu art, and recorded music have not been ported. See [asset credits](ASSET_CREDITS.md) before publishing reused artwork.

Rebuild the browser art from the repository root with Python and Pillow:

```sh
python3 -m venv /tmp/ava-art-tools
/tmp/ava-art-tools/bin/pip install Pillow==12.2.0
/tmp/ava-art-tools/bin/python web/scripts/prepare-assets.py
```

The generated files are checked in, so Python is not required to run, test, or build the game. The conversion script keeps the original source files intact.

## Expedition 0.7 player experience

The opening screen identifies Standalone as untracked and offers Campaign directly. The header follows the prepared mode. Completed cards distinguish improving shield ratings from experimenting after three stars; the next action names its mission. Credit totals have an explicit accessible name, breaches report remaining shields, and replay controls describe the actual result. No combat numbers, schedules, artwork, save schema, or dependencies changed. See [the milestone report](docs/EXPEDITION_0_7.md) for the six-mission journey, research, validation boundaries, and remaining human/device tests.
