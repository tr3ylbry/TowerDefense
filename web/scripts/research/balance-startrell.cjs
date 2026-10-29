const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os");
const { execFileSync } = require("node:child_process");
const compiler = path.resolve(
  __dirname,
  "../../node_modules/typescript/bin/tsc",
);
const outputDir = path.resolve(
  __dirname,
  "../../reports/expedition-0.2/startrell",
);
const build = fs.mkdtempSync(path.join(os.tmpdir(), "ava-startrell025-"));
const frozen = path.join(build, "frozen");
fs.mkdirSync(frozen, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
for (const name of ["content.ts", "simulation.ts"])
  fs.writeFileSync(
    path.join(frozen, name),
    execFileSync("git", ["show", `c786396:web/src/game/${name}`], {
      cwd: path.resolve(__dirname, "../../.."),
    }),
  );
const r = (n) => Math.round(n * 100) / 100;
const policies = {
  "astro-2": "Two Astro ranks, twelve desired slots; replace destroyed units.",
  "astro-fill": "All legal slots Astro; replace destroyed units.",
  "astro-startrell":
    "One Astro rank then one Startrell rank, twelve desired slots; replace destroyed units.",
  "startrell-fill": "All legal slots Startrell; replace destroyed units.",
  "startrell-2":
    "Two Startrell ranks, twelve desired slots; replace destroyed units.",
  "astro-startrell-unattended":
    "Same twelve Astro/Startrell slots; buy each once, never replace.",
};
function load(variant) {
  const root = path.join(build, variant),
    src = path.join(root, "source"),
    out = path.join(root, "compiled");
  fs.mkdirSync(src, { recursive: true });
  let content = fs.readFileSync(path.join(frozen, "content.ts"), "utf8");
  if (variant === "candidate") {
    const before = "cooldown: 0.3,\n    windup: 0.05,";
    if (content.split(before).length !== 2)
      throw Error("Expected exactly one Startrell cooldown/windup match");
    content = content.replace(before, "cooldown: 0.25,\n    windup: 0.05,");
  }
  fs.writeFileSync(path.join(src, "content.ts"), content);
  fs.copyFileSync(
    path.join(frozen, "simulation.ts"),
    path.join(src, "simulation.ts"),
  );
  execFileSync(
    process.execPath,
    [
      compiler,
      "--module",
      "node16",
      "--target",
      "es2022",
      "--strict",
      "--skipLibCheck",
      "--outDir",
      out,
      path.join(src, "content.ts"),
      path.join(src, "simulation.ts"),
    ],
    { stdio: "inherit" },
  );
  return {
    ...require(path.join(out, "content.js")),
    ...require(path.join(out, "simulation.js")),
  };
}
function planFor(api, policy, map) {
  const free = Array.from({ length: api.ROWS }, (_, row) =>
    Array.from({ length: api.COLS }, (_, col) => col).filter(
      (col) => !api.isBlocked(map, row, col),
    ),
  );
  const plan = [];
  const rank = (kind) => {
    for (let row = 0; row < api.ROWS; row++) {
      const col = free[row].shift();
      if (col !== undefined) plan.push({ kind, row, col });
    }
  };
  if (policy === "astro-2") {
    rank("astro");
    rank("astro");
  }
  if (policy === "astro-fill") while (free.some((a) => a.length)) rank("astro");
  if (policy === "startrell-fill")
    while (free.some((a) => a.length)) rank("startrell");
  if (policy === "startrell-2") {
    rank("startrell");
    rank("startrell");
  }
  if (policy.startsWith("astro-startrell")) {
    rank("astro");
    rank("startrell");
  }
  return plan;
}
function run(api, variant, policy, map, seed) {
  const sim = new api.Simulation(seed, map);
  sim.start();
  const plan = planFor(api, policy, map),
    seen = new Set(),
    lanes = new Set(),
    purchases = {};
  let state = sim.snapshot(),
    purchased = 0,
    replacements = 0,
    spent = 0,
    lastDeployment = 0,
    firstSixLanes = null,
    idle = 0;
  while (state.phase === "playing" && state.elapsed < 600) {
    for (const slot of plan) {
      if (state.towers.some((t) => t.row === slot.row && t.col === slot.col))
        continue;
      const key = `${slot.row}:${slot.col}`;
      if (policy.endsWith("unattended") && seen.has(key)) continue;
      if (state.credits < api.TOWERS[slot.kind].cost) break;
      if (!sim.place(slot.kind, slot.row, slot.col).ok)
        throw Error("Unexpected rejected placement");
      purchased++;
      spent += api.TOWERS[slot.kind].cost;
      purchases[slot.kind] = (purchases[slot.kind] || 0) + 1;
      if (seen.has(key)) replacements++;
      seen.add(key);
      lanes.add(slot.row);
      if (lanes.size === 6 && firstSixLanes === null)
        firstSixLanes = state.elapsed;
      lastDeployment = state.elapsed;
      state = sim.snapshot();
    }
    if (state.enemies.length === 0 && state.pendingSpawns > 0) idle += api.STEP;
    sim.advance(api.STEP);
    sim.drainEvents();
    state = sim.snapshot();
  }
  return {
    variant,
    policy,
    map,
    seed,
    result: state.phase,
    shields: state.integrity,
    duration: r(state.elapsed),
    finalCredits: state.credits,
    purchased,
    purchases,
    replacements,
    spent,
    lastDeployment: r(lastDeployment),
    firstSixLanes: r(firstSixLanes),
    idleWithFutureSpawns: r(idle),
  };
}
const variants = { baseline: load("baseline"), candidate: load("candidate") };
const runs = [];
for (const [variant, api] of Object.entries(variants))
  for (const policy of Object.keys(policies))
    for (const map of Object.keys(api.MAPS))
      for (let seed = 3352019; seed <= 3352030; seed++)
        runs.push(run(api, variant, policy, map, seed));
const stats = (xs) => ({
  min: r(Math.min(...xs)),
  mean: r(xs.reduce((a, b) => a + b, 0) / xs.length),
  max: r(Math.max(...xs)),
});
const summaries = [];
for (const variant of Object.keys(variants))
  for (const policy of Object.keys(policies))
    for (const map of Object.keys(variants[variant].MAPS)) {
      const xs = runs.filter(
        (x) => x.variant === variant && x.policy === policy && x.map === map,
      );
      summaries.push({
        variant,
        policy,
        map,
        wins: xs.filter((x) => x.result === "won").length,
        runs: xs.length,
        shields: stats(xs.map((x) => x.shields)),
        duration: stats(xs.map((x) => x.duration)),
        credits: stats(xs.map((x) => x.finalCredits)),
        purchases: stats(xs.map((x) => x.purchased)),
        replacements: stats(xs.map((x) => x.replacements)),
        firstSixLanes: stats(xs.map((x) => x.firstSixLanes)),
      });
    }
const duels = [];
for (const [variant, api] of Object.entries(variants))
  for (const kind of ["astro", "startrell", "tars"]) {
    // An isolated real Sprinter traverses an otherwise empty lane; all shooters stand in column 0.
    const old = api.MAPS.canyon.waves;
    api.MAPS.canyon.waves = [
      { start: 1, title: "Isolated sprinter", enemies: ["sprinter"] },
    ];
    const row = api.makeSpawns(3352019, "canyon")[0].row;
    const sim = new api.Simulation(3352019, "canyon");
    sim.start();
    sim.place(kind, row, 0);
    let state = sim.snapshot(),
      shots = 0,
      hits = 0,
      firstShot = null,
      firstHit = null,
      kill = null;
    while (state.phase === "playing" && state.elapsed < 100) {
      sim.advance(api.STEP);
      state = sim.snapshot();
      for (const e of sim.drainEvents()) {
        if (e.type === "shot") {
          shots++;
          if (firstShot === null) firstShot = state.elapsed;
        }
        if (e.type === "hit") {
          hits++;
          if (firstHit === null) firstHit = state.elapsed;
        }
        if (e.type === "kill") kill = state.elapsed;
      }
    }
    duels.push({
      variant,
      kind,
      target: "sprinter",
      spawnTime: 1,
      column: 0,
      row,
      firstShot: r(firstShot),
      firstHit: r(firstHit),
      killTime: r(kill),
      secondsAfterSpawn: kill === null ? null : r(kill - 1),
      shots,
      hits,
      result: state.phase,
      shields: state.integrity,
    });
    api.MAPS.canyon.waves = old;
  }
const dps = [];
for (const [variant, api] of Object.entries(variants))
  for (const kind of ["astro", "startrell", "tars"]) {
    const t = api.TOWERS[kind],
      ordinary = (t.damage * t.ammo.length) / t.cooldown,
      tank =
        (api.damageAgainstArmor(t.damage, 0.8, t.armorPierce) * t.ammo.length) /
        t.cooldown;
    dps.push({
      variant,
      kind,
      cost: t.cost,
      cooldown: t.cooldown,
      health: t.health,
      ordinaryDps: r(ordinary),
      tankDps: r(tank),
      ordinaryDpsPer100Credits: r((ordinary / t.cost) * 100),
      tankDpsPer100Credits: r((tank / t.cost) * 100),
    });
  }
const result = {
  baselineCommit: "c786396f2f6921f029f2871024045a0f17413e30",
  candidateChange:
    "Only Startrell cooldown 0.30 -> 0.25. Original automatic wave times and all other rules unchanged.",
  assumptions: [
    "Twelve seeds 3352019..3352030, three maps; fixed greedy rank/lane order; no seed-aware choices.",
    "Allocate leftmost legal cells, skipping acid. Buy all affordable missing slots each step. Save for first unaffordable slot; replace deaths first except unattended companion. No salvage or direct state mutation.",
    "Sprinter duel: one defender at column zero, deployed at t=0, enemy spawns t=1 at normal x=9.5; same seed/lane for all; real movement/projectile rules. Shooter begins with its initial cooldown, which has expired before the spawn.",
    "DPS is ideal steady state, not observed sustained mission damage. Duels include actual travel, wind-up, and overkill.",
    "Outcomes do not measure enjoyment or prove global balance.",
  ],
  policies,
  dps,
  duels,
  summaries,
  runs,
};
fs.writeFileSync(
  path.join(outputDir, "results.json"),
  JSON.stringify(result) + "\n",
);
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify({ ...result, runs: undefined }, null, 2) + "\n",
);
console.log(JSON.stringify({ dps, duels }, null, 2));
for (const s of summaries)
  console.log(
    `${s.variant.padEnd(9)} ${s.policy.padEnd(27)} ${s.map.padEnd(6)} ${s.wins}/12 shields ${s.shields.mean} duration ${s.duration.mean}s buys ${s.purchases.mean} repl ${s.replacements.mean} covered ${s.firstSixLanes.mean}`,
  );
fs.rmSync(build, { recursive: true, force: true });
