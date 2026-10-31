# Astronauts vs Aliens

## Browser modernization

The playable TypeScript/Phaser edition lives in [`web/`](web/README.md), with all nine original defenders, six alien types, and three four-wave maps. **Expedition 0.4** adds actionable forward-firing threat feedback, illustrated Money Bush/Asteroid/Moon Zeus defenders, and paired lane relays in The Nest’s later waves. Unit prices and combat statistics remain unchanged. On-demand art comparison, keyboard/touch controls, reduced motion, mission receipts, optional early-wave calls, and deterministic gameplay are retained. See the [0.4 report](web/docs/EXPEDITION_0_4.md) for evidence, verification, and remaining external playtesting.
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
