# Astronauts vs Aliens — browser edition

The full original character and map roster, built with TypeScript, Phaser, and Vite. This is Trey Bryant's independent continuation of the original CSC 335 team project by Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.

Expedition 0.4 adds contextual passed-enemy warnings and legal placement advice, illustrates Money Bush/Asteroid/Moon Zeus, and gives The Nest paired late-wave lane relays. All unit statistics and economy values remain unchanged. Cached artwork still loads on demand with pause/retry/cancel recovery; backgrounding during a transition now requires explicit resume.

See the [0.4 milestone report](docs/EXPEDITION_0_4.md), [art direction](docs/ART_DIRECTION.md), [matched tactical/economy research](reports/expedition-0.4/research/README.md), [performance evidence](reports/expedition-0.4/performance/README.md), and [five-player testing kit](playtest/README.md). The [0.3 report](docs/EXPEDITION_0_3.md) preserves the earlier loading and economy measurements. Campaigns, upgrades, saves, and an editor remain future milestones. Hosting is separate.

## Run locally

Node 22.12+ is required; Node 24 is used in CI.

```sh
cd web
npm ci
npm run dev
```

Open the Local URL printed by Vite. No API keys, account, database, or backend service are needed.

## Play

Choose **The Canyon**, **Sky Bridge**, or **The Nest** using Change destination. Each mission has six lanes, nine columns, four distinct waves, and all nine original defenders. All six original alien types appear in every mission: Little Green Men, Grunt, Sprinter, ManHunter, Tank, and Gargantua. Each breach costs one of three outpost shields. Clear every scheduled enemy with a shield remaining to win.

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
| 9   | Millennium Falcon   | 250  | Three ammunition types per volley in one lane |

Sky Bridge has 12 restricted acid tiles; The Nest has 16. Their positions match the original Java maps. Defenders cannot be placed there, and aliens cross them normally. A mid-mission destination change explains that it will reset progress; closing the selector resumes the existing mission. Restart keeps the chosen map.

- Starting a mission enters a focused control deck. The Focus switch returns to the full page. The art switch compares the Expedition prototype with the original school artwork without changing combat rules.
- Click/tap a crew card and then a tile to deploy. Number keys 1–9 also select crew.
- Tab to the battlefield; arrow keys move between tiles; Enter or Space deploys.
- P pauses/resumes the entire simulation. Changing tabs automatically pauses it.
- N or **Call next wave** advances an eligible wave with a three-game-second lead. The button shows its reward and overlap risk; the first wave keeps its preparation time.
- X selects salvage, returning 40% of the unit's cost. Escape clears selection.
- The speed control switches between 1× and 2× while preserving cooldowns and schedules.
- Sound is off by default and uses original synthesized effects. Reduced motion defaults to the OS preference and can be changed and saved locally.
- The entire battlefield fits narrow screens. **Enlarge field** provides a pannable closer view; **Overview** restores the whole board. The crew bar scrolls horizontally; keyboard selection scrolls its active card into view.

Tanks have 650 health, move at 0.26 tiles/second, and absorb 80% of ordinary projectile damage. TARS ignores plating; Moon Zeus bypasses 65% of it, Explosive Astro Joe 40%, and the Falcon 75%. This is per-impact penetration, not a lasting debuff. The wave briefing lists the next group and flags armored arrivals. Canyon waves start at 7, 29, 56, and 87 game seconds. Bridge’s schedule and every original acid coordinate remain unchanged. Nest waves 3–4 pair existing enemies across three seeded lanes before shifting to the other three; its briefing and lane warnings describe the actual schedule.

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

`check` runs deterministic simulation tests, strict TypeScript checking, and a production build. There are 98 rule tests and 26 browser scenarios per engine (Chromium, Firefox, WebKit). New checks cover deferred/cached artwork, slow and failed transitions, preserved mission state, economy guidance and receipts, touch targets, landscape, audio gestures, and repeated lifecycles. Browser tests also cover deployment, economy while paused, salvage, restart, nine-key crew selection, both restored maps, acid-tile rejection, safe destination changes, the alien field guide, narrow viewports, saved motion preferences, and asset-load failures. They also check desktop focus controls, phone overview/zoom, all nine crew cards, automatic crew scrolling, plating guidance, live art comparison, keyboard wave calls, warning updates, and loading failure for new artwork. On a local machine with Chrome already installed, `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e -- --project=chromium` uses that browser instead. Desktop WebKit tests are not physical Safari/iOS testing. See the milestone report for local engine availability and CI results.

The simulation tests include a full four-wave victory on every map using only earned credits, plus undefended losses. They also check every defender's price and health, original ammunition and three-shot volleys, projectile speeds, actual cluster damage, both income units, map restrictions and selection, frame-size independence, speed changes, input bounds, snapshot isolation, and restart cleanup. New checks verify wind-up/release timing (including pause and salvage), interpolation state, actual armored impacts, and 108 winning specialist/economy runs across twelve seeds and three maps. Twelve fixed twelve-Astro Canyon runs now lose, preventing the old unattended opening from remaining a guaranteed win. An additional 36 clear-field early-call specialist runs win across the same maps/seeds and finish earlier than their automatic-schedule counterparts. Tests cover capped/duplicate/near-deadline rewards, schedule spacing and lane order, pause and speed changes, warning boundaries, pressure/destruction events, and cleanup. These synthetic strategies are regression checks, not exhaustive balance proof.

## Structure

```text
src/game/content.ts      Typed unit definitions and reproducible wave schedules
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

All spawning, income, movement, attacks, and win/loss checks follow one simulation clock. Rendering reads snapshots; screen coordinates do not determine game rules. Enemy and projectile positions interpolate between 20 Hz rule updates. Attack wind-ups, shot releases, and impacts use the same simulation clock; pausing never leaves a pending shot running. Fire animations restart on actual releases and fit within cooldowns. Illustrated character cutouts use procedural breathing, stride, and recoil rather than generated sprite frames. Critical income/breach tones have separate throttles from gunfire.

The interface has a real HTML keyboard-accessible grid over the Phaser canvas.

## Build and future site integration

```sh
npm run build
npm run preview
```

The deployable static site is `web/dist`. Its relative asset base supports hosting under a subsection such as a Treydmark Labs game path. Hosting, portfolio presentation, domains, and publication are owned separately by Treydmark Tech. The simulation can also be mounted behind a future React wrapper; the game loop does not require React renders.

Phaser is an isolated dynamic chunk, about 357 KB gzip. The first mission requests only the current environment and selected character style; other backgrounds, acid terrain, and school comparison sheets load when needed. Opening the destination selector also loads its thumbnails. Successful textures and animations remain cached across destinations and restarts. Failed transitions keep the current mission paused and offer retry or cancellation. See the [current controlled measurements](reports/expedition-0.4/performance/README.md); the 0.3 payload figure is historical and is not claimed as the 0.4 payload.

The new three-defender group totals 607,605 bytes. Full-resolution sources stay outside `public/` and the deployable build. [Prototype prompts](public/art/expedition/README.md), [0.2 provenance](public/art/expedition/README-0.2.md), [0.3 prompts and evaluation](public/art/expedition/README-0.3.md), and [0.4 defender provenance](public/art/expedition/README-0.4.md) record their origins. Four defenders and Bridge/Nest scenery retain school artwork. All fonts are local system fonts; no analytics or remote runtime APIs are used.

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
