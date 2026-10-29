/* Frozen 0.2 public-API economy audit. No network, hidden-state edits, or game-file writes. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const BASELINE = "2bb30a834343a792fd60f5ffd1cdda9e70c7c65b";
const web = path.resolve(__dirname, "../..");
const output = path.join(web, "reports/expedition-0.3/economy");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ava03-economy-"));
const source = path.join(temporary, "source");
const compiled = path.join(temporary, "compiled");
const round = (value) => Math.round(value * 100) / 100;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const stats = (values) => ({
  min: round(Math.min(...values)),
  mean: round(sum(values) / values.length),
  max: round(Math.max(...values)),
});
const nullableStats = (values) => {
  const present = values.filter((value) => value !== null);
  return { present: present.length, ...(present.length ? stats(present) : {}) };
};

fs.mkdirSync(source);
fs.mkdirSync(path.join(output, "source"), { recursive: true });
try {
  const sourceSha256 = {};
  for (const name of ["content.ts", "simulation.ts", "waves.ts"]) {
    const contents = execFileSync("git", ["show", `${BASELINE}:web/src/game/${name}`], {
      cwd: web,
    });
    sourceSha256[name] = crypto.createHash("sha256").update(contents).digest("hex");
    fs.writeFileSync(path.join(source, name), contents);
    fs.writeFileSync(path.join(output, "source", name), contents);
  }
  execFileSync(process.execPath, [
    process.argv[2] || path.join(web, "node_modules/typescript/bin/tsc"),
    "--module", "node16", "--target", "es2022", "--strict", "--skipLibCheck",
    "--outDir", compiled,
    ...Object.keys(sourceSha256).map((name) => path.join(source, name)),
  ], { stdio: "inherit" });
  const { Simulation } = require(path.join(compiled, "simulation.js"));
  const { ROWS, COLS, STEP, TOWERS, ENEMIES, MAPS, isBlocked } = require(path.join(compiled, "content.js"));

  const plans = {
    "cheap-maintenance": "Two Astro ranks; repurchase destroyed units in the same cells.",
    "cheap-salvage": "Same twelve Astro slots; salvage at or below 30% health only if the refund plus current credits funds immediate identical replacement.",
    "cheap-unattended": "The same twelve Astro slots, each purchased only once; no replacements.",
    "bush-specialist": "Two Bushes in lanes 1 and 2, then one Astro and one TARS per lane; stop after this foundation is complete.",
    "tree-specialist": "Two Trees in lanes 1 and 2, then one Astro and one TARS per lane; stop after this foundation is complete.",
    "piercing": "One Astro and one TARS per lane; maintain these twelve slots.",
    "piercing-salvage": "Same piercing plan; salvage defenders at or below 30% health only if refund plus current credits can immediately buy the same unit again.",
    "plasma": "One Astro and one Moon Zeus per lane; maintain these twelve slots.",
    "mixed": "One each of Astro, Startrell, Moon Zeus, and Falcon per lane, purchased in that rank order.",
    "falcon-saving": "One Astro then one Falcon per lane; save for each 250-credit Falcon without skipping ahead.",
    "barrier-splash": "One Astro and one Explosive per lane, then one Asteroid in each lane's rightmost legal cell.",
    "bush-flagship": "Same two-Bush/Astro/TARS foundation, then one Falcon per lane; maintain all twenty desired slots.",
    "tree-flagship": "Same two-Tree/Astro/TARS foundation, then one Falcon per lane; maintain all twenty desired slots.",
  };
  const modes = ["automatic", "clear-field", "aggressive"];
  const seeds = Array.from({ length: 12 }, (_, index) => 3352019 + index);

  function desiredSlots(plan, map) {
    const free = Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => col).filter((col) => !isBlocked(map, row, col)),
    );
    const desired = [];
    const add = (kind, row, front = false) => {
      const col = front ? free[row].pop() : free[row].shift();
      assert.notEqual(col, undefined, "Desired plan must fit legal terrain");
      desired.push({ kind, row, col });
    };
    const rank = (kind) => {
      for (let row = 0; row < ROWS; row++) add(kind, row);
    };
    if (plan.startsWith("bush-")) { add("bush", 0); add("bush", 1); }
    if (plan.startsWith("tree-")) { add("tree", 0); add("tree", 1); }
    rank("astro");
    if (plan.startsWith("cheap-")) rank("astro");
    else if (plan === "plasma") rank("zeus");
    else if (plan === "mixed") for (const kind of ["startrell", "zeus", "falcon"]) rank(kind);
    else if (plan === "falcon-saving") rank("falcon");
    else if (plan === "barrier-splash") {
      rank("explosive");
      for (let row = 0; row < ROWS; row++) add("wall", row, true);
    } else {
      rank("tars");
      if (plan.endsWith("flagship")) rank("falcon");
    }
    return desired;
  }

  function run(plan, mode, map, seed) {
    const game = new Simulation(seed, map);
    game.start();
    const initial = game.snapshot();
    const desired = desiredSlots(plan, map);
    const visited = new Set();
    const purchases = [];
    const refunds = [];
    const calls = [];
    const deathsByKind = {};
    const purchasedByKind = {};
    const incomeByKind = {};
    const shotCounts = {};
    const hitCounts = {};
    const earned = { passive: 0, income: 0, kills: 0, calls: 0 };
    let spent = 0, refunded = 0, deaths = 0, idle = 0, streak = 0, longestIdle = 0;
    let eventRefundTotal = 0, eventPurchaseCount = 0;
    let state = initial;

    function purchase(slot, replacement) {
      const before = game.snapshot();
      const result = game.place(slot.kind, slot.row, slot.col);
      assert.equal(result.ok, true, result.message);
      const after = game.snapshot();
      const cost = before.credits - after.credits;
      assert.equal(cost, TOWERS[slot.kind].cost);
      spent += cost;
      purchasedByKind[slot.kind] = (purchasedByKind[slot.kind] || 0) + 1;
      purchases.push({
        at: round(before.elapsed), kind: slot.kind, row: slot.row, col: slot.col,
        cost, replacement, wave: before.wave, creditsBefore: before.credits,
        creditsAfter: after.credits,
        visibleLaneThreat: before.enemies.some((enemy) => enemy.row === slot.row) || before.incoming.some((warning) => warning.row === slot.row),
        livingEnemies: before.enemies.length,
      });
      visited.add(`${slot.row}:${slot.col}`);
      state = after;
    }

    while (state.phase === "playing" && state.elapsed < 600) {
      const beforeCredits = state.credits;
      const beforeSpent = spent, beforeRefunded = refunded;
      if (plan.endsWith("-salvage")) {
        for (const tower of state.towers) {
          const definition = TOWERS[tower.kind];
          const refund = Math.floor(definition.cost * 0.4);
          if (tower.health > definition.health * 0.3 || game.snapshot().credits + refund < definition.cost) continue;
          const before = game.snapshot();
          const result = game.remove(tower.row, tower.col);
          assert.equal(result.ok, true, result.message);
          const actual = game.snapshot().credits - before.credits;
          assert.equal(actual, refund);
          refunded += actual;
          refunds.push({ at: round(before.elapsed), kind: tower.kind, row: tower.row, col: tower.col, amount: actual, health: tower.health });
          purchase(tower, true);
        }
      }
      state = game.snapshot();
      for (const slot of desired) {
        if (state.towers.some((tower) => tower.row === slot.row && tower.col === slot.col)) continue;
        const key = `${slot.row}:${slot.col}`;
        if (plan === "cheap-unattended" && visited.has(key)) continue;
        if (state.credits < TOWERS[slot.kind].cost) break;
        purchase(slot, visited.has(key));
      }
      state = game.snapshot();
      if (state.enemies.length === 0 && state.pendingSpawns > 0) {
        idle += STEP;
        streak += STEP;
        longestIdle = Math.max(longestIdle, streak);
      } else streak = 0;
      if (state.nextWave?.canLaunch && (mode === "aggressive" || (mode === "clear-field" && state.enemies.length === 0))) {
        const before = state;
        assert.equal(game.launchNextWave().ok, true);
        calls.push({ at: round(before.elapsed), wave: before.nextWave.number,
          secondsSaved: round(before.nextWave.secondsSaved), reward: before.nextWave.reward,
          livingEnemies: before.enemies.length });
      }
      const preTick = game.snapshot();
      game.advance(STEP);
      state = game.snapshot();
      let stepIncome = 0, stepKills = 0, stepCalls = 0;
      for (const event of game.drainEvents()) {
        if (event.type === "income") {
          stepIncome += event.amount;
          const tower = preTick.towers.find((unit) => unit.row === event.row && unit.col === Math.floor(event.x));
          assert.ok(tower, "Income must have a living source before its tick");
          incomeByKind[tower.kind] = (incomeByKind[tower.kind] || 0) + event.amount;
        } else if (event.type === "kill") stepKills += event.amount;
        else if (event.type === "wave-called") stepCalls += event.amount;
        else if (event.type === "removed") eventRefundTotal += event.amount;
        else if (event.type === "placed") eventPurchaseCount++;
        else if (event.type === "defender-lost") {
          deaths++;
          deathsByKind[event.kind] = (deathsByKind[event.kind] || 0) + 1;
        } else if (event.type === "shot") shotCounts[event.kind] = (shotCounts[event.kind] || 0) + 1;
        else if (event.type === "hit") hitCounts[event.kind] = (hitCounts[event.kind] || 0) + 1;
      }
      // 0.2 exposes no passive-income event. Reconcile the observed public balance change,
      // then verify this residual independently against elapsed public game time below.
      const stepPassive = state.credits - beforeCredits + (spent - beforeSpent) - (refunded - beforeRefunded) - stepIncome - stepKills - stepCalls;
      assert.ok(stepPassive === 0 || stepPassive === 30, `Unexpected passive residual ${stepPassive}`);
      earned.passive += stepPassive;
      earned.income += stepIncome;
      earned.kills += stepKills;
      earned.calls += stepCalls;
    }

    // A policy can stall through repeated ineffective replacements; retain this as a timeout, not a fabricated loss.
    assert.equal(earned.passive, Math.floor((state.elapsed + 1e-9) / 5) * 30);
    assert.equal(state.credits, initial.credits + sum(Object.values(earned)) - spent + refunded, "Credits must reconcile exactly");
    assert.equal(sum(calls.map((call) => call.reward)), earned.calls);
    assert.equal(eventRefundTotal, refunded);
    assert.equal(eventPurchaseCount, purchases.length);
    assert.equal(sum(Object.values(incomeByKind)), earned.income);
    assert.equal(state.earlyLaunches, calls.length);
    assert.equal(purchases.length - refunds.length - deaths, state.towers.length);

    const first = purchases[0]?.at ?? null;
    const last = purchases.at(-1)?.at ?? null;
    const majors = purchases.filter((purchase) => purchase.cost >= 100);
    const falcons = purchases.filter((purchase) => purchase.kind === "falcon");
    const late = purchases.filter((purchase) => purchase.at >= state.elapsed * 0.6);
    const lateResponsiveMajor = late.filter((purchase) => purchase.cost >= 100 && purchase.visibleLaneThreat);
    const offensive = purchases.filter((purchase) => TOWERS[purchase.kind].damage > 0);
    const armedRows = new Set();
    let firstAllLanesArmed = null;
    for (const purchase of offensive) {
      armedRows.add(purchase.row);
      if (armedRows.size === ROWS) { firstAllLanesArmed = purchase.at; break; }
    }
    return {
      plan, mode, map, seed, result: state.phase === "playing" ? "timeout" : state.phase, shields: state.integrity,
      finalEnemies: state.enemies.map(({ kind, row, x, health, attacking }) => ({ kind, row, x: round(x), health: round(health), attacking })),
      duration: round(state.elapsed), initialCredits: initial.credits,
      earned, earnedTotal: sum(Object.values(earned)), spent, refunded,
      endingCredits: state.credits, purchases: purchases.length,
      purchasedByKind, deaths, deathsByKind, salvages: refunds.length,
      replacements: purchases.filter((purchase) => purchase.replacement).length,
      firstPurchase: first, lastPurchase: last,
      firstOffensivePurchase: offensive[0]?.at ?? null, firstAllLanesArmed,
      firstMajorPurchase: majors[0]?.at ?? null,
      firstFalcon: falcons[0]?.at ?? null, lastFalcon: falcons.at(-1)?.at ?? null,
      falconCount: falcons.length, falconShots: shotCounts.falcon || 0,
      falconHits: hitCounts.falcon || 0,
      latePurchases: late.length, lateResponsiveMajorPurchases: lateResponsiveMajor.length,
      timeAfterLastPurchase: last === null ? null : round(state.elapsed - last),
      idle: round(idle), longestIdle: round(longestIdle),
      calls: calls.length, callDetails: calls, incomeByKind, shotCounts, hitCounts,
      purchaseTimeline: purchases, refundTimeline: refunds,
    };
  }

  const runs = [];
  for (const plan of Object.keys(plans))
    for (const mode of modes)
      for (const map of Object.keys(MAPS))
        for (const seed of seeds) runs.push(run(plan, mode, map, seed));

  const summaries = [];
  for (const plan of Object.keys(plans)) for (const mode of modes) for (const map of Object.keys(MAPS)) {
    const subset = runs.filter((run) => run.plan === plan && run.mode === mode && run.map === map);
    const aggregate = { plan, mode, map, runs: subset.length, wins: subset.filter((run) => run.result === "won").length, timeouts: subset.filter((run) => run.result === "timeout").length };
    for (const key of ["shields", "duration", "earnedTotal", "spent", "refunded", "endingCredits", "purchases", "deaths", "salvages", "replacements", "idle", "longestIdle", "calls", "falconCount", "falconShots", "falconHits", "latePurchases", "lateResponsiveMajorPurchases"])
      aggregate[key] = stats(subset.map((run) => run[key]));
    for (const key of ["firstPurchase", "lastPurchase", "firstOffensivePurchase", "firstAllLanesArmed", "firstMajorPurchase", "firstFalcon", "lastFalcon", "timeAfterLastPurchase"])
      aggregate[key] = nullableStats(subset.map((run) => run[key]));
    aggregate.earned = Object.fromEntries(Object.keys(subset[0].earned).map((key) => [key, stats(subset.map((run) => run.earned[key]))]));
    const winners = subset.filter((run) => run.result === "won");
    aggregate.winsOnly = winners.length ? Object.fromEntries(["duration", "endingCredits", "spent", "deaths"].map((key) => [key, stats(winners.map((run) => run[key]))])) : null;
    summaries.push(aggregate);
  }
  const roleSummary = Object.entries(TOWERS).map(([kind, definition]) => ({
    kind, name: definition.name, cost: definition.cost, health: definition.health,
    nominalOrdinaryDps: round(definition.damage * definition.ammo.length / definition.cooldown),
    nominalTankDps: round(definition.damage * definition.ammo.length / definition.cooldown * (1 - ENEMIES.tank.armor * (1 - definition.armorPierce))),
    incomePerSecond: round(definition.income / definition.incomeInterval),
    incomePerSecondPer100Credits: round(definition.income / definition.incomeInterval / definition.cost * 100),
    firstFullGrossPayback: definition.income ? Math.ceil(definition.cost / definition.income) * definition.incomeInterval : null,
    salvageRefund: Math.floor(definition.cost * 0.4),
  }));
  const metadata = {
    milestone: "Expedition 0.3 economy research", baselineCommit: BASELINE,
    sourceSha256, seeds, modes, totalRuns: runs.length, plans,
    methodology: [
      "All rules are frozen from git show 2bb30a8; no live source is read or modified. Only public Simulation methods and snapshots/events are used.",
      "All three maps, twelve seeds, thirteen distinct plans, three call modes. Seeds shuffle lane order; wave composition and baseline times remain fixed.",
      "Plans allocate leftmost legal cells in rank order, then lanes 1 through 6. Income units reserve the first legal cell of lanes 1 and 2; barriers reserve the rightmost legal cell.",
      "Before every 0.05-second step, buy missing slots in fixed priority. Save for the first unaffordable slot. Repurchase destroyed units before later plan slots, except cheap-unattended.",
      "Automatic never calls. Clear-field calls as soon as eligible with no living enemies. Aggressive calls whenever eligible even with survivors. Calls follow purchases in the same step.",
      "Only cheap-salvage and piercing-salvage salvage: <=30% health, sufficient balance plus 40% refund for immediate identical replacement. All other plans have zero refunds by design.",
      "Income, kill rewards, call bonuses, and deaths are counted from actual drained events. Purchases/refunds use successful public actions and observed balance deltas. Passive income has no baseline event; its per-step credit residual is independently verified as 30 per completed five game seconds.",
      "Every run checks exact initial plus earned minus spent plus refunded equals ending credits, as well as call, income-source and defender-count consistency. Any policy still playing at 600 seconds is explicitly recorded as a timeout.",
      "Idle includes opening preparation and any time with zero living enemies while pending spawns remain. This is not a direct boredom measurement.",
      "Late means the final 40% of the observed mission. A late responsive major purchase is cost >=100 and a live alien or actual five-second warning in its lane at purchase time. This is an observational proxy, not proof that the purchase changed the outcome.",
      "Falcon hit counts are actual hit events; shots are volley events. Hit amounts include overkill and omit secondary splash victims for area weapons, so this report does not claim total useful damage from those events.",
      "Fixed scripts are neither optimal agents nor independent human tests. Surplus in a capped foundation plan cannot alone establish that further spending is useless; paired flagship plans test one concrete extension.",
    ],
  };
  fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ ...metadata, roleSummary, summaries, runs }) + "\n");
  fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify({ ...metadata, roleSummary, summaries }, null, 2) + "\n");
  const csvColumns = ["plan", "mode", "map", "seed", "result", "shields", "duration", "initialCredits", "passive", "income", "kills", "callsEarned", "spent", "refunded", "endingCredits", "purchases", "deaths", "salvages", "firstOffensivePurchase", "firstAllLanesArmed", "firstFalcon", "lastFalcon", "lastPurchase", "lateResponsiveMajorPurchases"];
  const csvRows = runs.map((run) => {
    const flat = { ...run, passive: run.earned.passive, income: run.earned.income, kills: run.earned.kills, callsEarned: run.earned.calls };
    return csvColumns.map((column) => flat[column] ?? "").join(",");
  });
  fs.writeFileSync(path.join(output, "ledgers.csv"), [csvColumns.join(","), ...csvRows].join("\n") + "\n");
  console.log(JSON.stringify({ totalRuns: runs.length, baselineCommit: BASELINE, sourceSha256 }, null, 2));
  for (const summary of summaries) console.log(`${summary.plan.padEnd(19)} ${summary.mode.padEnd(11)} ${summary.map.padEnd(6)} ${String(summary.wins).padStart(2)}/12 shields ${summary.shields.mean} duration ${summary.duration.mean}s earned ${summary.earnedTotal.mean} spent ${summary.spent.mean} ending ${summary.endingCredits.mean} deaths ${summary.deaths.mean} falcons ${summary.falconCount.mean}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
