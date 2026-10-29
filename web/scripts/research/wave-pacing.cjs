/* Public-API deterministic play policies. No rendering, hidden-state edits, or external services. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const web = path.resolve(__dirname, "../..");
const output = path.join(web, "reports/expedition-0.2/pacing");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ava02-pacing-"));
const source = path.join(temporary, "source");
const compiled = path.join(temporary, "compiled");
fs.mkdirSync(source);
fs.mkdirSync(output, { recursive: true });
try {
  const hashes = {};
  for (const name of ["content.ts", "simulation.ts", "waves.ts"]) {
    const contents = fs.readFileSync(path.join(web, "src/game", name));
    hashes[name] = crypto.createHash("sha256").update(contents).digest("hex");
    fs.writeFileSync(path.join(source, name), contents);
  }
  execFileSync(
    process.execPath,
    [
      path.join(web, "node_modules/typescript/bin/tsc"),
      "--module",
      "node16",
      "--target",
      "es2022",
      "--strict",
      "--skipLibCheck",
      "--outDir",
      compiled,
      ...Object.keys(hashes).map((name) => path.join(source, name)),
    ],
    { stdio: "inherit" },
  );
  const { Simulation } = require(path.join(compiled, "simulation.js"));
  const { ROWS, COLS, STEP, TOWERS, MAPS, isBlocked } = require(
    path.join(compiled, "content.js"),
  );
  const plans = [
    "cheap",
    "economy",
    "piercing",
    "plasma",
    "mixed",
    "barrier-splash",
  ];
  function slots(plan, map) {
    const free = Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => col).filter(
        (col) => !isBlocked(map, row, col),
      ),
    );
    const result = [];
    const add = (kind, row, front = false) =>
      result.push({
        kind,
        row,
        col: front ? free[row].pop() : free[row].shift(),
      });
    const rank = (kind) => {
      for (let row = 0; row < ROWS; row++) add(kind, row);
    };
    if (plan === "economy") {
      add("bush", 0);
      add("bush", 1);
    }
    rank("astro");
    for (const kind of plan === "cheap"
      ? ["astro"]
      : plan === "plasma"
        ? ["zeus"]
        : plan === "mixed"
          ? ["startrell", "zeus", "falcon"]
          : plan === "barrier-splash"
            ? ["explosive"]
            : ["tars"])
      rank(kind);
    if (plan === "barrier-splash")
      for (let row = 0; row < ROWS; row++) add("wall", row, true);
    return result;
  }
  const round = (value) => Math.round(value * 100) / 100;
  const runs = [];
  for (const plan of plans)
    for (const mode of ["automatic", "clear-field", "aggressive"])
      for (const map of Object.keys(MAPS))
        for (let seed = 3352019; seed < 3352031; seed++) {
          const game = new Simulation(seed, map);
          game.start();
          const desired = slots(plan, map);
          let idle = 0,
            longestIdle = 0,
            idleStreak = 0,
            purchases = 0,
            lastBuy = 0,
            bonus = 0;
          while (
            game.snapshot().phase === "playing" &&
            game.snapshot().elapsed < 600
          ) {
            let state = game.snapshot();
            for (const slot of desired) {
              if (
                state.towers.some(
                  (tower) => tower.row === slot.row && tower.col === slot.col,
                )
              )
                continue;
              if (state.credits < TOWERS[slot.kind].cost) break;
              if (!game.place(slot.kind, slot.row, slot.col).ok)
                throw Error("Unexpected rejected purchase");
              purchases++;
              lastBuy = state.elapsed;
              state = game.snapshot();
            }
            if (state.enemies.length === 0 && state.pendingSpawns > 0) {
              idle += STEP;
              idleStreak += STEP;
              longestIdle = Math.max(longestIdle, idleStreak);
            } else idleStreak = 0;
            if (
              state.nextWave?.canLaunch &&
              (mode === "aggressive" ||
                (mode === "clear-field" && state.enemies.length === 0))
            )
              game.launchNextWave();
            game.advance(STEP);
            for (const event of game.drainEvents())
              if (event.type === "wave-called") bonus += event.amount;
          }
          const state = game.snapshot();
          runs.push({
            plan,
            mode,
            map,
            seed,
            result: state.phase,
            shields: state.integrity,
            duration: round(state.elapsed),
            idle: round(idle),
            longestIdle: round(longestIdle),
            calls: state.earlyLaunches,
            bonus,
            credits: state.credits,
            purchases,
            lastPurchase: round(lastBuy),
          });
        }
  const summaries = [];
  for (const plan of plans)
    for (const mode of ["automatic", "clear-field", "aggressive"])
      for (const map of Object.keys(MAPS)) {
        const subset = runs.filter(
          (run) => run.plan === plan && run.mode === mode && run.map === map,
        );
        const mean = (key) =>
          round(subset.reduce((sum, run) => sum + run[key], 0) / subset.length);
        summaries.push({
          plan,
          mode,
          map,
          runs: subset.length,
          wins: subset.filter((run) => run.result === "won").length,
          shields: mean("shields"),
          duration: mean("duration"),
          idle: mean("idle"),
          longestIdle: mean("longestIdle"),
          calls: mean("calls"),
          bonus: mean("bonus"),
          credits: mean("credits"),
          purchases: mean("purchases"),
        });
      }
  const metadata = {
    version: "Expedition0.2",
    sourceSha256: hashes,
    seeds: [3352019, 3352030],
    totalRuns: runs.length,
    assumptions: [
      "Fixed legal-cell plans: rank order, lanes1–6. Two bushes first for economy; walls at the rightmost legal cells for barrier-splash.",
      "Buy missing units in order, stop at first unaffordable purchase, and repurchase destroyed units before later slots. No salvage or future-lane knowledge.",
      "Automatic never calls; clear-field calls only when no enemies remain; aggressive calls whenever eligible even with living enemies.",
      "Idle includes opening preparation. Bot wins and empty-field time are not independent human enjoyment measurements.",
    ],
  };
  fs.writeFileSync(
    path.join(output, "results.json"),
    JSON.stringify({ ...metadata, summaries, runs }) + "\n",
  );
  fs.writeFileSync(
    path.join(output, "summary.json"),
    JSON.stringify({ ...metadata, summaries }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        totalRuns: runs.length,
        piercing: summaries.filter((row) => row.plan === "piercing"),
        economy: summaries.filter((row) => row.plan === "economy"),
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
