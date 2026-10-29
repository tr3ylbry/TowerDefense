# Astronauts vs Aliens — browser edition

A complete first browser encounter, built with TypeScript, Phaser, and Vite. This is Trey Bryant's independent continuation of the original CSC 335 team project by Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.

## Run locally

Node 22.12+ is required; Node 24 is used in CI.

```sh
cd web
npm ci
npm run dev
```

Open the Local URL printed by Vite. No API keys, account, database, or backend service are needed.

## Play

Defend six lanes through four waves in The Canyon. The first playable roster is Astro Joe (50 credits), Money Bush (60), Asteroid (35), and Moon Zeus (125). Scouts, grunts, and armored grunts attack from the right. Each breach costs one of three outpost shields. Clear every scheduled enemy with a shield remaining to win.

- Click/tap a crew card and then a tile to deploy. Number keys 1–4 also select crew.
- Tab to the battlefield; arrow keys move between tiles; Enter or Space deploys.
- P pauses/resumes the entire simulation. Changing tabs automatically pauses it.
- X selects salvage, returning 40% of the unit's cost. Escape clears selection.
- The speed control switches between 1× and 2× while preserving cooldowns and schedules.
- Sound is off by default and uses original synthesized effects. Reduced motion defaults to the OS preference and can be changed and saved locally.
- Narrow screens can scroll the battlefield horizontally. Landscape provides a wider field.

Starting credits: 230. The outpost supplies 30 every five game seconds. Each active Money Bush generates 25 every six game seconds; selling or losing it stops that income immediately. Defeated aliens award additional credits.

## Verify

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

`check` runs deterministic simulation tests, strict TypeScript checking, and a production build. Browser tests cover deployment, economy while paused, salvage, restart, keyboard input, a narrow viewport, saved motion preferences, and an asset-load failure. On a local machine with Chrome already installed, `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` uses that browser instead.

The simulation tests include a full four-wave victory with a simple strategy and an undefended loss. They also check frame-size independence, speed changes, input bounds, snapshot isolation, restart cleanup, and income-unit removal.

## Structure

```text
src/game/content.ts      Typed unit definitions and reproducible wave schedules
src/game/simulation.ts   Fixed-step rules; no browser or Phaser dependencies
src/battlefield.ts       Phaser sprites, health bars, projectiles, and effects
src/main.ts              Accessible HTML controls and mission lifecycle
src/audio.ts             Opt-in synthesized sound effects
public/art/              Optimized original art and source manifest
scripts/prepare-assets.py  Reproducible conversion from the original assets
tests/                   Rule tests and browser interaction tests
```

All spawning, income, movement, attacks, and win/loss checks follow one simulation clock. Rendering reads snapshots; screen coordinates do not determine game rules. The interface has a real HTML keyboard-accessible grid over the Phaser canvas.

## Build and future site integration

```sh
npm run build
npm run preview
```

The deployable static site is `web/dist`. Its relative asset base supports hosting under a subsection such as a Treydmark Labs game path. This first version does not modify or deploy the Treydmark marketing site. The simulation can also be mounted behind a future React wrapper; the game loop does not require React renders.

Phaser is an isolated dynamic chunk, about 357 KB compressed in the initial build. Only the first encounter's art is preloaded; the larger converted collection remains available for subsequent encounters. All fonts are local system fonts. No analytics or remote runtime APIs are used.

## Original version and content

The original Java source, assets, generated documentation, and school presentation remain unchanged in the repository. The original commit is preserved by the annotated `school-project-2019` tag and the `master` comparison branch. Browser work belongs to `modernization`.

The converted collection includes additional characters and artwork beyond the first playable roster. Preparing those assets does not mean their game behavior has already been ported. See [asset credits](ASSET_CREDITS.md) before publishing reused artwork.

Rebuild the browser art from the repository root with Python and Pillow:

```sh
python3 -m venv /tmp/ava-art-tools
/tmp/ava-art-tools/bin/pip install Pillow==12.2.0
/tmp/ava-art-tools/bin/python web/scripts/prepare-assets.py
```

The generated files are checked in, so Python is not required to run, test, or build the game. The conversion script keeps the original source files intact.
