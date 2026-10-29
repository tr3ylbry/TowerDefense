/* Deterministic, public-API-only audit of the frozen Expedition 0.1 simulation. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");
const compiler = path.resolve(
  __dirname,
  "../../node_modules/typescript/bin/tsc",
);
const outputDir = path.resolve(
  __dirname,
  "../../reports/expedition-0.2/baseline",
);
const build = fs.mkdtempSync(path.join(os.tmpdir(), "ava02-baseline-"));
const frozen = path.join(build, "source");
fs.mkdirSync(frozen, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
for (const name of ["content.ts", "simulation.ts"])
  fs.writeFileSync(
    path.join(frozen, name),
    execFileSync("git", ["show", `c786396:web/src/game/${name}`], {
      cwd: path.resolve(__dirname, "../../.."),
    }),
  );
const compiled = path.join(build, "compiled");
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
    compiled,
    path.join(frozen, "content.ts"),
    path.join(frozen, "simulation.ts"),
  ],
  { stdio: "inherit" },
);
const { Simulation, damageAgainstArmor } = require(
  path.join(compiled, "simulation.js"),
);
const { TOWERS, ENEMIES, MAPS, ROWS, COLS, STEP, isBlocked } = require(
  path.join(compiled, "content.js"),
);
const r = (n) => Math.round(n * 100) / 100;
const seeds = Array.from({ length: 12 }, (_, i) => 3352019 + i);
const policies = {
  "astro-2":
    "Two first legal cells per lane, both Astro; twelve desired units, with replacements.",
  "astro-2-unattended":
    "Same twelve Astro slots, but buy each slot once; no replacement after deaths.",
  "astro-fill":
    "Every legal cell, Astro; ranks progress from left to right across all lanes.",
  "bush-astro-tars":
    "Two Money Bushes in leftmost legal cells of lanes 1 and 2, then one Astro and one TARS in each lane.",
  "tree-astro-tars":
    "Two Money Trees in leftmost legal cells of lanes 1 and 2, then one Astro and one TARS in each lane.",
  "astro-tars": "One Astro then one TARS in each lane; twelve desired units.",
  "astro-zeus": "One Astro then one Zeus in each lane; twelve desired units.",
  mixed:
    "One each of Astro, Startrell, Zeus, Falcon in each lane, in that rank order; twenty-four desired units.",
  "barrier-splash":
    "One Astro and one Explosive in leftmost legal cells of each lane, then one Asteroid in rightmost legal cell of each lane; eighteen desired units.",
  "astro-falcon":
    "One Astro then one Falcon in each lane; twelve desired units.",
};
function planFor(policy, map) {
  const plan = [];
  const free = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => col).filter(
      (col) => !isBlocked(map, row, col),
    ),
  );
  const add = (kind, row, front = false) => {
    const col = front ? free[row].pop() : free[row].shift();
    if (col !== undefined) plan.push({ kind, row, col });
  };
  const rank = (kind) => {
    for (let row = 0; row < ROWS; row++) add(kind, row);
  };
  if (policy === "astro-2" || policy === "astro-2-unattended") {
    rank("astro");
    rank("astro");
  } else if (policy === "astro-fill") {
    while (free.some((a) => a.length)) rank("astro");
  } else if (policy === "bush-astro-tars" || policy === "tree-astro-tars") {
    const income = policy.startsWith("bush") ? "bush" : "tree";
    add(income, 0);
    add(income, 1);
    rank("astro");
    rank("tars");
  } else if (policy === "astro-tars") {
    rank("astro");
    rank("tars");
  } else if (policy === "astro-zeus") {
    rank("astro");
    rank("zeus");
  } else if (policy === "mixed") {
    for (const kind of ["astro", "startrell", "zeus", "falcon"]) rank(kind);
  } else if (policy === "barrier-splash") {
    rank("astro");
    rank("explosive");
    for (let row = 0; row < ROWS; row++) add("wall", row, true);
  } else if (policy === "astro-falcon") {
    rank("astro");
    rank("falcon");
  }
  return plan;
}
function run(policy, map, seed) {
  const sim = new Simulation(seed, map);
  sim.start();
  const plan = planFor(policy, map);
  let idle = 0,
    idleStreak = 0,
    maxIdle = 0,
    lastDeployment = 0,
    spent = 0,
    purchased = 0,
    replacements = 0;
  const purchases = {};
  const visited = new Set();
  let state = sim.snapshot();
  while (state.phase === "playing" && state.elapsed < 600) {
    for (const slot of plan) {
      if (state.towers.some((t) => t.row === slot.row && t.col === slot.col))
        continue;
      if (
        policy === "astro-2-unattended" &&
        visited.has(`${slot.row}:${slot.col}`)
      )
        continue;
      if (state.credits < TOWERS[slot.kind].cost) break;
      const result = sim.place(slot.kind, slot.row, slot.col);
      if (!result.ok)
        throw Error(`${policy}/${map}/${seed}: ${result.message}`);
      purchased++;
      spent += TOWERS[slot.kind].cost;
      purchases[slot.kind] = (purchases[slot.kind] || 0) + 1;
      const key = `${slot.row}:${slot.col}`;
      if (visited.has(key)) replacements++;
      visited.add(key);
      lastDeployment = state.elapsed;
      state = sim.snapshot();
    }
    if (state.enemies.length === 0 && state.pendingSpawns > 0) {
      idle += STEP;
      idleStreak += STEP;
      maxIdle = Math.max(maxIdle, idleStreak);
    } else idleStreak = 0;
    sim.advance(STEP);
    sim.drainEvents();
    state = sim.snapshot();
  }
  return {
    policy,
    map,
    seed,
    result: state.phase,
    shields: state.integrity,
    duration: r(state.elapsed),
    finalCredits: state.credits,
    kills: state.kills,
    purchased,
    purchases,
    replacements,
    spent,
    lastDeployment: r(lastDeployment),
    timeAfterLastDeployment: r(state.elapsed - lastDeployment),
    idleWithFutureSpawns: r(idle),
    longestIdle: r(maxIdle),
    livingDefenders: state.towers.length,
  };
}
const runs = [];
for (const policy of Object.keys(policies))
  for (const map of Object.keys(MAPS))
    for (const seed of seeds) runs.push(run(policy, map, seed));
function stats(xs) {
  return {
    min: r(Math.min(...xs)),
    mean: r(xs.reduce((a, b) => a + b, 0) / xs.length),
    max: r(Math.max(...xs)),
  };
}
const summaries = [];
for (const policy of Object.keys(policies))
  for (const map of Object.keys(MAPS)) {
    const subset = runs.filter((x) => x.policy === policy && x.map === map);
    summaries.push({
      policy,
      map,
      runs: subset.length,
      wins: subset.filter((x) => x.result === "won").length,
      shields: stats(subset.map((x) => x.shields)),
      duration: stats(subset.map((x) => x.duration)),
      finalCredits: stats(subset.map((x) => x.finalCredits)),
      purchased: stats(subset.map((x) => x.purchased)),
      replacements: stats(subset.map((x) => x.replacements)),
      lastDeployment: stats(subset.map((x) => x.lastDeployment)),
      timeAfterLastDeployment: stats(
        subset.map((x) => x.timeAfterLastDeployment),
      ),
      idleWithFutureSpawns: stats(subset.map((x) => x.idleWithFutureSpawns)),
      longestIdle: stats(subset.map((x) => x.longestIdle)),
    });
  }
const roles = Object.entries(TOWERS).map(([kind, t]) => {
  const shots = t.ammo.length;
  const raw = (t.damage * shots) / t.cooldown;
  const actualPeriod = Math.max(
    STEP,
    Math.ceil((t.cooldown - 1e-9) / STEP) * STEP,
  );
  const ordinary = raw;
  const armored =
    (damageAgainstArmor(t.damage, ENEMIES.tank.armor, t.armorPierce) * shots) /
    t.cooldown;
  return {
    kind,
    name: t.name,
    cost: t.cost,
    health: t.health,
    shotsPerVolley: shots,
    ordinaryDps: r(ordinary),
    tankDps: r(armored),
    ordinaryDpsPer100Credits: r((ordinary / t.cost) * 100),
    tankDpsPer100Credits: r((armored / t.cost) * 100),
    armorPierce: t.armorPierce,
    splashRadius: t.splashRadius,
    incomePerSecond: r(t.income / t.incomeInterval),
    incomePerSecondPer100Credits: r(
      (t.income / t.incomeInterval / t.cost) * 100,
    ),
    firstFullPayback: t.income
      ? Math.ceil(t.cost / t.income) * t.incomeInterval
      : null,
    healthPerCredit: r(t.health / t.cost),
    steadyPeriod: actualPeriod,
  };
});
const barriers = Object.entries(ENEMIES).map(([kind, e]) => ({
  enemy: kind,
  damage: e.damage,
  period: e.cooldown,
  wallHits: Math.ceil(TOWERS.wall.health / e.damage),
  wallHoldSeconds: r(
    (Math.ceil(TOWERS.wall.health / e.damage) - 1) * e.cooldown,
  ),
}));
const output = {
  baselineCommit: "c786396f2f6921f029f2871024045a0f17413e30",
  sourceSha256: {
    "content.ts":
      "32986848543098e6db4042201a1a895e90069059f6bf9e36d5261080d8cf1ee4",
    "simulation.ts":
      "a7f99077341f951ba300ae0d1c4a15a2378faa8968416bd81b9ab0acf8f0e51e",
  },
  seeds,
  step: STEP,
  timeoutSeconds: 600,
  policyDescriptions: policies,
  assumptions: [
    "Public Simulation API only; no direct state edits or future spawn knowledge.",
    "Policies are fixed plans, not reactive enemy targeting. Priority is rank then lane 1 through 6.",
    "After each fixed rule step, scan the desired plan from the start. Buy all affordable missing desired units in order. If the next missing unit is unaffordable, save until affordable instead of skipping ahead.",
    "Destroyed units are bought again in their desired slot, with priority over later plan slots, except the explicitly unattended companion. No manual salvage, retargeting, upgrades, or refunds.",
    "Plans allocate leftmost legal cells first, except Asteroid uses the rightmost legal cell. Income units occupy the leftmost legal cell of lanes 1 and 2.",
    "Idle time includes opening wait before first spawn and any later instant with no living enemy while a scheduled spawn remains. It does not imply the player has no useful decisions.",
    "DPS assumes continuous target availability and no overkill, projectile travel, initial wind-up, damage falloff, splash overlap, or blocker contact. Splash damage may multiply with clustered enemies.",
    "The Falcon nominal DPS assumes all three rounds hit useful targets. Initial firing latency is 0.1 seconds plus the unit wind-up; steady rate is determined by cooldown.",
  ],
  roles,
  barriers,
  summaries,
  runs,
};
fs.writeFileSync(
  path.join(outputDir, "results.json"),
  JSON.stringify(output) + "\n",
);
fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(
    { baselineCommit: output.baselineCommit, roles, barriers, summaries },
    null,
    2,
  ) + "\n",
);
for (const s of summaries)
  console.log(
    `${s.policy.padEnd(18)} ${s.map.padEnd(6)} ${String(s.wins).padStart(2)}/12 shields ${s.shields.mean} duration ${s.duration.mean}s credits ${s.finalCredits.mean} units ${s.purchased.mean} last ${s.lastDeployment.mean}s idle ${s.idleWithFutureSpawns.mean}s postlast ${s.timeAfterLastDeployment.mean}s`,
  );
console.log("ROLES", JSON.stringify(roles));
fs.rmSync(build, { recursive: true, force: true });
