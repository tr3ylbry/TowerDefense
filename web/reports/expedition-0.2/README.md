# Expedition 0.2 balance and pacing evidence

These are deterministic agent-authored policies, not independent human feedback or exhaustive balance proof. Full assumptions, seed-level results, and aggregates are in each JSON file. The generation scripts use only Node, Git, and the project's installed TypeScript compiler; no dependencies or network are installed.

From `web/`:

```sh
node scripts/research/balance-baseline.cjs
node scripts/research/balance-startrell.cjs
node scripts/research/wave-pacing.cjs
```

- **baseline/**: 360 runs, ten policies × twelve seeds × three maps, frozen at `c786396`. The script reads that commit with Git into an owned temporary directory and compiles there; it never switches or changes branches.
- **startrell/**: 432 runs and six isolated Sprinter duels, comparing the frozen baseline with only Startrell's cooldown changed from 0.30 to 0.25. The source change is checked for exactly one match before compilation.
- **pacing/**: 648 runs of current 0.2 rules, six strategies × automatic/clear-field/aggressive calling × twelve seeds × three maps. Source SHA256s identify the exact rule files used. The script copies rule sources into an owned temporary directory, compiles, runs, and removes its own temporary output.

These scripts overwrite only their own report JSONs. `summary.json` is a readable aggregate; `results.json` contains complete runs and methodology. Neither scripts nor reports are imported by the game or copied into its production output.

## Findings used in the implementation

- Armor makes unattended twelve-Astro Canyon/Nest formations fail, but repurchasing destroyed Astros wins all 36 baseline runs with full shields. Specialists are useful soft counters, not mandatory locks.
- Maintained piercing, plasma, economy, mixed, and barrier/splash plans all win 36/36 baseline runs. A rigid Astro/Falcon saving policy wins 26/36; that reflects exposure while saving 250 credits, not a claim that a reactive player cannot use Falcon effectively.
- Two income units plus Astro/TARS finish buying well before mission end. Bridge/Nest economy runs have contiguous quiet gaps around 25–27 game seconds. Optional wave calls address this without forcing a faster automatic schedule.
- Startrell's 0.25 interval raises ordinary-target efficiency from 53.33 to 64 nominal DPS per 100 credits. Astro remains 61.18, has a 50-credit opening price rather than 75, and covers all lanes earlier. TARS remains approximately four times as efficient against Tank plating.
- Isolated Sprinter kill time after spawn improves 3.90→3.35 seconds for Startrell. Astro takes 5.20, TARS 2.90 in that setup. Travel, overkill, and purchase timing matter; nominal DPS alone is insufficient.
- Astro/Startrell mean Canyon replacements fall 8.42→5.42 per run. No other unit damage, price, health, armor, income, or cooldown changes are made.

## Pacing comparison

Astro/TARS policy means across twelve seeds. Idle includes opening preparation; clear-field calls wait until no living enemies remain. The policy still maintains its formation through purchases. Units are legal and use earned currency only.

| Map        | Automatic duration | Clear-field call duration | Automatic empty-field time | Called empty-field time |
| ---------- | -----------------: | ------------------------: | -------------------------: | ----------------------: |
| Canyon     |            113.45s |                    97.21s |                     33.44s |                  15.58s |
| Sky Bridge |            150.65s |                    97.25s |                     74.52s |                  19.00s |
| The Nest   |            164.56s |                   112.20s |                     73.99s |                  21.00s |

All 36 automatic, 36 clear-field, and 36 aggressive Astro/TARS runs win. Calling as soon as eligible reduces their mean durations further to 78.74/81.45/91.45 seconds respectively. This is an option, not an expectation for every player.

Risk is observable: the maintained cheap two-Astro policy wins every automatic baseline run, but aggressive calling wins only 6/12 Canyon and 9/12 Nest runs. Rewards do not compensate automatically for missing preparation/income time. The maximum total bonus is 120 credits for the three callable waves; the opening preparation is protected.
