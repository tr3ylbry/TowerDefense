# Astronauts vs Aliens

## Browser modernization

The playable TypeScript/Phaser edition lives in [`web/`](web/README.md). **Expedition 0.6** adds a six-mission campaign, briefings, sequential unlocks, shield-based stars, replay and validated local saves. Nine defenders, six alien types and all three illustrated environments are shared with the original standalone missions. Those schedules, terrain, prices and combat rules remain intact, verified against the frozen 0.5 engine. See the [0.6 report](web/docs/EXPEDITION_0_6.md) and [campaign architecture](web/docs/CAMPAIGN_ARCHITECTURE.md). Independent player and physical-device validation remain outstanding; native Safari has a focused desktop smoke check. Original school source/assets and history remain preserved. Hosting is separate.

```sh
cd web
npm ci
npm run dev
```

Run `npm run check` inside `web/` for simulation tests, TypeScript checking, and a production build. See the [browser README](web/README.md) for browser tests and hosting details.

Active browser development uses **`modernization`**. The original school version is preserved by the annotated **[`school-project-2019`](https://github.com/tr3ylbry/TowerDefense/tree/school-project-2019)** tag and the **`master`** comparison branch. Original Java source and assets remain intact.

This is Trey Bryant's independent continuation of the team project below. Original author credits are retained. [Asset provenance notes](web/ASSET_CREDITS.md) distinguish the retained school artwork from new browser work.

## Original Java edition

This is a tower defense game with a gameplay similar to Plants vs Zombies. The main objective is to survive the attack of the aliens by generating income and placing astronauts to destroy the aliens.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

* Eclipse
* JavaFX
* Java8

### Installing

Once Eclipse is intalled, select under the project's properties, to compile using Compiler's Compliance Level 1.8.

```
Properties -> Java Compiler -> Enable Project Specific Settings -> Compiler Compliance Level -> 1.8
```

Once selected, run AstronautsVsAliens.java as a Java Application.

### Examples

![Alt text](https://media.giphy.com/media/iE3bj8XqAUzn7tGOLy/giphy.gif?raw=true "Main Menu") ![Alt text](https://media.giphy.com/media/kyv1JEUKs4Pldn3BKc/giphy.gif?raw=true "Gameplay")

## Running the tests

Tests are performed using JUnit testing. 

## Built With

* [Java8](https://docs.oracle.com/javase/8/docs/) - The programming language used
* [Eclipse](https://www.eclipse.org/eclipseide/) - IDE used
* [JavaFX](https://docs.oracle.com/javase/8/javafx/get-started-tutorial/jfx-overview.htm) - GUI library used

## Authors

* **Mauricio Herrera** - [Github](https://github.com/mauherrerag)
* **Adrian Bao** - [Github](https://github.com/BaoAdrian)
* **Trey Bryant** - [Github](https://github.com/tr3ylbry)
* **Tim Lukau** - [Github](https://github.com/mothydula)
