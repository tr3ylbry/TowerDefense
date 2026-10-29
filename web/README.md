# Astronauts vs Aliens — browser edition

The full original character and map roster, built with TypeScript, Phaser, and Vite. This is Trey Bryant's independent continuation of the original CSC 335 team project by Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.

The first Expedition milestone focuses on combat feel, clearer controls, meaningful armor counters, and an art prototype. Expanded campaign missions, a mission editor, replays, and a Treydmark showcase remain later milestones.

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
- X selects salvage, returning 40% of the unit's cost. Escape clears selection.
- The speed control switches between 1× and 2× while preserving cooldowns and schedules.
- Sound is off by default and uses original synthesized effects. Reduced motion defaults to the OS preference and can be changed and saved locally.
- The entire battlefield fits narrow screens. The crew bar scrolls horizontally; keyboard selection scrolls its active card into view.

Tanks now have 650 health, move at 0.26 tiles/second, and absorb 80% of ordinary projectile damage. TARS ignores plating; Moon Zeus bypasses 65% of it, Explosive Astro Joe 40%, and the Falcon 75%. This is per-impact penetration, not a lasting debuff. The wave briefing lists the next group and flags armored arrivals. Canyon waves start at 7, 29, 56, and 87 game seconds; the other two schedules and all acid coordinates are preserved.

Starting credits: 230. The outpost supplies 30 every five game seconds. Each active Money Bush generates 25 every six game seconds and each Money Tree generates 60 every eight; selling or losing it stops that income immediately. Defeated aliens award additional credits.

## Verify

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

`check` runs deterministic simulation tests, strict TypeScript checking, and a production build. Browser tests cover deployment, economy while paused, salvage, restart, nine-key crew selection, both restored maps, acid-tile rejection, safe destination changes, the alien field guide, narrow viewports, saved motion preferences, and asset-load failures. They also check desktop focus controls, phone overview bounds, automatic crew scrolling, plating guidance, and live art comparison. On a local machine with Chrome already installed, `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` uses that browser instead.

The simulation tests include a full four-wave victory on every map using only earned credits, plus undefended losses. They also check every defender's price and health, original ammunition and three-shot volleys, projectile speeds, actual cluster damage, both income units, map restrictions and selection, frame-size independence, speed changes, input bounds, snapshot isolation, and restart cleanup. New checks verify wind-up/release timing (including pause and salvage), interpolation state, actual armored impacts, and 108 winning specialist/economy runs across twelve seeds and three maps. Twelve fixed twelve-Astro Canyon runs now lose, preventing the old unattended opening from remaining a guaranteed win. These synthetic strategies are regression checks, not exhaustive balance proof.

## Structure

```text
src/game/content.ts      Typed unit definitions and reproducible wave schedules
src/game/simulation.ts   Fixed-step rules; no browser or Phaser dependencies
src/battlefield.ts       Phaser sprites, health bars, projectiles, and effects
src/main.ts              Accessible HTML controls and mission lifecycle
src/audio.ts             Opt-in synthesized sound effects
public/art/              Optimized school art and Expedition prototype
art-source/expedition/   Full-resolution generated originals (excluded from builds)
scripts/prepare-assets.py  Reproducible conversion from the original assets
tests/                   Rule tests and browser interaction tests
```

All spawning, income, movement, attacks, and win/loss checks follow one simulation clock. Rendering reads snapshots; screen coordinates do not determine game rules. Enemy and projectile positions interpolate between 20 Hz rule updates. Attack wind-ups, shot releases, and impacts use the same simulation clock; pausing never leaves a pending shot running. Fire animations restart on actual releases and fit within cooldowns. The two new cutouts use procedural breathing, stride, and recoil rather than generated sprite frames. Critical income/breach tones have separate throttles from gunfire.

The interface has a real HTML keyboard-accessible grid over the Phaser canvas.

## Build and future site integration

```sh
npm run build
npm run preview
```

The deployable static site is `web/dist`. Its relative asset base supports hosting under a subsection such as a Treydmark Labs game path. This first version does not modify or deploy the Treydmark marketing site. The simulation can also be mounted behind a future React wrapper; the game loop does not require React renders.

Phaser is an isolated dynamic chunk, about 357 KB compressed in the initial build. The 32 active animation sheets, three map backgrounds, five projectile images, and acid-pool image are preloaded once (2,999,641 bytes of image files in total), so switching destinations needs no further combat-art download. The three Expedition images add 627,918 bytes (about 613 KiB); full-resolution originals stay outside the deployable public directory. Their [prompts and provenance](public/art/expedition/README.md) are recorded. The remaining roster and two other environments retain the school artwork while the visual style is evaluated. All fonts are local system fonts. No analytics or remote runtime APIs are used.

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
