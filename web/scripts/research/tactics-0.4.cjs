/* Expedition 0.4 public-API tactical study. Baseline is immutable; candidate is root-owned current source. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const BASELINE = "cfb6eb35917ef8f5102d74c935e607455d61e910";
const variant = process.argv[2] || "baseline";
assert.ok(["baseline", "candidate"].includes(variant), "Use baseline or candidate");
const web = path.resolve(__dirname, "../..");
const output = path.join(web, "reports/expedition-0.4/research", variant);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ava04-tactical-"));
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
  const queue = ["content.ts", "simulation.ts", "waves.ts"];
  for (let index = 0; index < queue.length; index++) {
    const name = queue[index];
    if (sourceSha256[name]) continue;
    const contents = variant === "baseline"
      ? execFileSync("git", ["show", `${BASELINE}:web/src/game/${name}`], { cwd: web })
      : fs.readFileSync(path.join(web, "src/game", name));
    sourceSha256[name] = crypto.createHash("sha256").update(contents).digest("hex");
    fs.writeFileSync(path.join(source, name), contents);
    fs.writeFileSync(path.join(output, "source", name), contents);
    for (const match of contents.toString().matchAll(/from\s+["'](\.\/[^"']+)["']/g)) {
      const dependency = `${match[1].slice(2).replace(/\.ts$/, "")}.ts`;
      assert.equal(path.basename(dependency), dependency, "Only direct game-module imports are expected");
      if (!queue.includes(dependency)) queue.push(dependency);
    }
  }
  execFileSync(process.execPath, [
    process.argv[3] || path.join(web, "node_modules/typescript/bin/tsc"),
    "--module", "node16", "--target", "es2022", "--strict", "--skipLibCheck",
    "--outDir", compiled,
    ...Object.keys(sourceSha256).map((name) => path.join(source, name)),
  ], { stdio: "inherit" });
  const { Simulation } = require(path.join(compiled, "simulation.js"));
  const { ROWS, COLS, STEP, TOWERS, ENEMIES, MAPS, isBlocked, makeSpawns } = require(path.join(compiled, "content.js"));

  const definitions = { towers: TOWERS, enemies: ENEMIES,
    terrain: Object.fromEntries(Object.entries(MAPS).map(([key, map]) => [key, map.blocked])),
    waveStarts: Object.fromEntries(Object.entries(MAPS).map(([key, map]) => [key, map.waves.map((wave) => wave.start)])),
    waveKinds: Object.fromEntries(Object.entries(MAPS).map(([key, map]) => [key, map.waves.map((wave) => [...wave.enemies].sort())])),
  };
  if (variant === "candidate") {
    const original = JSON.parse(fs.readFileSync(path.join(output, "../baseline/summary.json")));
    assert.deepEqual(definitions, original.definitions, "Stats, prices, acids, starts and enemy multisets must remain unchanged");
  }
  const plans = {
    "held-response": "Six Astro openers, then use actual incoming warnings/live clusters to buy one TARS for plating, one Zeus for Gargantua, or one Explosive for paired threats per lane, holding credits otherwise. Maintain existing slots.",
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
    if (plan === "held-response") return desired;
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
    const expectedSpawns = makeSpawns(seed, map).map((spawn) => ({ ...spawn }));
    let warningChecks = 0, clusterLaneSeconds = 0, passedThreatSeconds = 0;
    const passed = new Map();
    let lastHostileDamageAt = null;

    function checkWarnings(snapshot) {
      const from = expectedSpawns.length - snapshot.pendingSpawns;
      const lanes = new Map();
      for (const spawn of expectedSpawns.slice(from)) {
        if (spawn.at > snapshot.elapsed + 5 + 1e-9) break;
        const threat = spawn.kind === "gargantua" ? "heavy" : spawn.kind === "tank" ? "armored" : "standard";
        if (!lanes.has(spawn.row)) lanes.set(spawn.row, { row: spawn.row,
          in: Math.max(0, Math.ceil((spawn.at - snapshot.elapsed) * 10 - 1e-9) / 10),
          count: 0, threat: "standard", kinds: [] });
        const warning = lanes.get(spawn.row);
        warning.count++;
        if (!warning.kinds.includes(spawn.kind)) warning.kinds.push(spawn.kind);
        if (threat === "heavy" || (threat === "armored" && warning.threat === "standard")) warning.threat = threat;
      }
      assert.deepEqual(snapshot.incoming, [...lanes.values()].sort((a, b) => a.row - b.row));
      warningChecks++;
    }


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
      if (plan === "held-response") {
        for (let row = 0; row < ROWS; row++) {
          const live = state.enemies.filter((enemy) => enemy.row === row);
          const incoming = state.incoming.find((warning) => warning.row === row);
          const kinds = new Set([...live.map((enemy) => enemy.kind), ...(incoming?.kinds || [])]);
          const paired = (incoming?.count || 0) >= 2 || live.some((a, index) => live.some((b, j) => index !== j && Math.abs(a.x - b.x) <= 1));
          const wanted = kinds.has("tank") ? "tars" : kinds.has("gargantua") ? "zeus" : paired ? "explosive" : null;
          if (!wanted || state.towers.some((tower) => tower.row === row && tower.kind === wanted)) continue;
          if (state.credits < TOWERS[wanted].cost) continue;
          const col = Array.from({ length: COLS }, (_, index) => index).find((col) =>
            !isBlocked(map, row, col) && !state.towers.some((tower) => tower.row === row && tower.col === col) &&
            (!live.length || live.some((enemy) => enemy.x >= col + 0.5)));
          if (col === undefined) continue;
          const slot = { kind: wanted, row, col };
          desired.push(slot);
          purchase(slot, false);
        }
      }
      state = game.snapshot();
      if (Math.round(state.elapsed / STEP) % 10 === 0) checkWarnings(state);
      for (let row = 0; row < ROWS; row++) {
        const enemies = state.enemies.filter((enemy) => enemy.row === row);
        if (enemies.some((a, index) => enemies.some((b, j) => index !== j && Math.abs(a.x - b.x) <= 1))) clusterLaneSeconds += STEP;
      }
      const notEngageable = state.enemies.filter((enemy) => {
        const armed = state.towers.filter((tower) => tower.row === enemy.row && TOWERS[tower.kind].damage > 0);
        return armed.length > 0 && armed.every((tower) => enemy.x < tower.col + 0.5);
      });
      if (notEngageable.length) passedThreatSeconds += STEP;
      for (const enemy of notEngageable) if (!passed.has(enemy.id)) passed.set(enemy.id, {
        firstObservedAt: round(state.elapsed), kind: enemy.kind, row: enemy.row, x: round(enemy.x), health: round(enemy.health),
      });
      if (state.enemies.length === 0 && state.pendingSpawns > 0) {
        idle += STEP;
        streak += STEP;
        longestIdle = Math.max(longestIdle, streak);
      } else streak = 0;
      if (state.nextWave?.canLaunch && (mode === "aggressive" || (mode === "clear-field" && state.enemies.length === 0))) {
        const before = state;
        assert.equal(game.launchNextWave().ok, true);
        const from = expectedSpawns.length - before.pendingSpawns;
        for (let index = from; index < expectedSpawns.length; index++) expectedSpawns[index].at =
          Math.round((expectedSpawns[index].at - before.nextWave.secondsSaved) / STEP) * STEP;
        const after = game.snapshot();
        assert.equal(round(after.nextWave.startAt - after.elapsed), 3);
        assert.equal(after.pendingSpawns, before.pendingSpawns);
        assert.deepEqual(after.enemies, before.enemies, "Calling must not move or damage live enemies");
        checkWarnings(after);
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
        else if (event.type === "hit") {
          hitCounts[event.kind] = (hitCounts[event.kind] || 0) + 1;
          lastHostileDamageAt = state.elapsed;
        }
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

    assert.equal(state.economy.supply, earned.passive);
    assert.equal(state.economy.growth, earned.income);
    assert.equal(state.economy.bounties, earned.kills);
    assert.equal(state.economy.calls, earned.calls);
    assert.equal(state.economy.salvage, refunded);
    assert.equal(state.economy.spent, spent);
    const finalEngagement = state.enemies.map((enemy) => ({
      enemy: { kind: enemy.kind, row: enemy.row, x: round(enemy.x), health: round(enemy.health), attacking: enemy.attacking },
      sameLaneDefenders: state.towers.filter((tower) => tower.row === enemy.row).map((tower) => ({
        kind: tower.kind, col: tower.col, health: tower.health, aimGate: tower.col + 0.2,
        firstShotMinimumX: tower.col + 0.5, canAim: TOWERS[tower.kind].damage > 0 && enemy.x > tower.col + 0.2,
        canHitWithFreshShot: TOWERS[tower.kind].damage > 0 && enemy.x >= tower.col + 0.5,
        isBlocking: tower.col + 0.5 <= enemy.x + 0.45 && tower.col + 0.5 >= enemy.x - 0.55,
      })),
    }));
    let recovery = null;
    if (state.phase === "playing" && state.enemies.length === 1) {
      const enemy = state.enemies[0];
      const blockers = state.towers.filter((tower) => tower.row === enemy.row &&
        tower.col + 0.5 <= enemy.x + 0.45 && tower.col + 0.5 >= enemy.x - 0.55);
      const actions = blockers.map((tower) => ({ row: tower.row, col: tower.col, result: game.remove(tower.row, tower.col) }));
      const recoveryEvents = [];
      for (let ticks = 0; ticks < 100 && game.snapshot().phase === "playing"; ticks++) {
        game.advance(STEP); recoveryEvents.push(...game.drainEvents().filter((event) => ["breach", "end", "removed"].includes(event.type)));
      }
      const after = game.snapshot();
      recovery = { actions, result: after.phase, elapsed: round(after.elapsed), shields: after.integrity,
        credits: after.credits, events: recoveryEvents };
    }
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
      warningChecks, clusterLaneSeconds: round(clusterLaneSeconds), passedThreatSeconds: round(passedThreatSeconds),
      passedThreatObservations: [...passed.values()], finalEngagement, recovery, lastHostileDamageAt: lastHostileDamageAt === null ? null : round(lastHostileDamageAt),
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
      majorPurchaseTimeline: purchases.filter((purchase) => purchase.cost >= 100),
      lastTransactions: purchases.slice(-8), refundTimeline: refunds,
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
    for (const key of ["shields", "duration", "earnedTotal", "spent", "refunded", "endingCredits", "purchases", "deaths", "salvages", "replacements", "idle", "longestIdle", "calls", "falconCount", "falconShots", "falconHits", "latePurchases", "lateResponsiveMajorPurchases", "warningChecks", "clusterLaneSeconds", "passedThreatSeconds"])
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
    milestone: "Expedition 0.4 tactical research", variant, baselineCommit: BASELINE, definitions,
    sourceSha256, seeds, modes, totalRuns: runs.length, plans,
    methodology: [
      variant === "baseline" ? "Rules are frozen from git show cfb6eb3." : "Candidate rules are read-only copies of root-owned working sources; their hashes identify the measured candidate.",
      "Only public Simulation methods, snapshots and events are used. No hidden state edits or source mutation occur.",
      "All three maps, twelve seeds, fourteen plans including the thirteen 0.3 policies plus a public-warning held-credit responder, and three call modes.",
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
      "Held-response first maintains six Astros, then buys lane-local TARS for visible/warned Tanks, Zeus for visible/warned Gargantua, or Explosive for a two-entry warning/one-tile live cluster, in that priority. It holds credits otherwise and never knows the full future lane schedule.",
      "Cluster lane seconds count each lane containing two living aliens within one tile each observed step. Passed-threat time counts steps with an armed occupied lane whose enemy is behind every fresh-shot minimum x=col+0.5. These are exposure metrics, not human enjoyment measurements.",
      "Warnings are independently rebuilt from the copied schedule every half game second and after calls. Each call shifts only unspawned entries and must leave live enemies unchanged, preserve pending count, and give a three-second next-wave lead.",
      "After a 600-second timeout, a separate public-action recovery probe salvages the current blocker and stops replacements for five seconds. Recovery is excluded from policy ledgers and outcome metrics.",
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
  const schedules = Object.fromEntries(Object.keys(MAPS).map((map) => [map, seeds.map((seed) => ({ seed, spawns: makeSpawns(seed, map) }))]));
  for (const map of Object.keys(MAPS)) for (const { spawns } of schedules[map]) {
    assert.equal(spawns.length, MAPS[map].waves.reduce((total, wave) => total + wave.enemies.length, 0));
    assert.ok(spawns.every((spawn, index) => index === 0 || spawn.at >= spawns[index - 1].at));
    assert.ok(spawns.every((spawn) => spawn.row >= 0 && spawn.row < ROWS));
  }
  if (variant === "candidate") {
    const baselineSchedules = JSON.parse(fs.readFileSync(path.join(output, "../baseline/schedules.json")));
    assert.deepEqual(schedules.canyon, baselineSchedules.canyon);
    assert.deepEqual(schedules.bridge, baselineSchedules.bridge);
    for (let index = 0; index < seeds.length; index++) assert.deepEqual(
      schedules.nest[index].spawns.filter((spawn) => spawn.wave < 3),
      baselineSchedules.nest[index].spawns.filter((spawn) => spawn.wave < 3));
  }
  fs.writeFileSync(path.join(output, "schedules.json"), JSON.stringify(schedules) + "\n");
  if (variant === "baseline") {
    const expected = [
      ["cheap-maintenance", "aggressive", "canyon", 3352022, 1538],
      ["falcon-saving", "clear-field", "nest", 3352025, 1589],
      ["falcon-saving", "clear-field", "nest", 3352026, 1404],
    ];
    for (const [plan, mode, map, seed, credits] of expected) {
      const result = runs.find((run) => run.plan === plan && run.mode === mode && run.map === map && run.seed === seed);
      assert.equal(result.result, "timeout"); assert.equal(result.endingCredits, credits);
      assert.equal(result.recovery.result, "won");
    }
    assert.equal(runs.filter((run) => run.result === "timeout").length, 3);
  }
  const research = path.dirname(output);
  if (variant === "baseline") {
    const prior = JSON.parse(fs.readFileSync(path.join(web, "reports/expedition-0.3/economy/results.json")));
    for (const original of prior.runs) {
      const reproduced = runs.find((run) => run.plan === original.plan && run.mode === original.mode && run.map === original.map && run.seed === original.seed);
      for (const key of ["result", "shields", "duration", "spent", "refunded", "endingCredits", "purchases", "deaths"])
        assert.equal(reproduced[key], original[key], `Frozen 0.3 reproduction ${key}`);
    }
    fs.writeFileSync(path.join(research, "original-stalls.json"), JSON.stringify({ baselineCommit: BASELINE,
      geometry: { aim: "enemy.x > tower.col + 0.2", freshDirectHit: "enemy.x >= tower.col + 0.85 - 0.35",
        blocking: "tower.col + 0.5 <= enemy.x + 0.45 && tower.col + 0.5 >= enemy.x - 0.55",
        note: "Fresh direct reach is not a hit guarantee. Wind-up, movement and collision order matter; splash may indirectly damage a passed enemy from a target ahead." },
      runs: runs.filter((run) => run.result === "timeout") }, null, 2) + "\n");
  } else {
    const before = JSON.parse(fs.readFileSync(path.join(research, "baseline/results.json")));
    const rows = before.summaries.map((baseline) => ({ plan: baseline.plan, mode: baseline.mode, map: baseline.map,
      baseline, candidate: summaries.find((row) => row.plan === baseline.plan && row.mode === baseline.mode && row.map === baseline.map) }));
    const comparison = { baselineCommit: BASELINE, baselineSourceSha256: before.sourceSha256, candidateSourceSha256: sourceSha256,
      totalRuns: before.totalRuns + runs.length, original1404ResultsMatch: true,
      warningChecks: { baseline: sum(before.runs.map((run) => run.warningChecks)), candidate: sum(runs.map((run) => run.warningChecks)) },
      outcomes: [before, { variant, runs }].map((result) => ({ variant: result.variant,
        ...Object.fromEntries(["won", "lost", "timeout"].map((phase) => [phase, result.runs.filter((run) => run.result === phase).length])) })), rows };
    fs.writeFileSync(path.join(research, "comparison.json"), JSON.stringify(comparison) + "\n");
    const columns = ["plan", "mode", "map", "baselineWins", "candidateWins", "baselineShields", "candidateShields", "baselineDuration", "candidateDuration", "baselineSpent", "candidateSpent", "baselineEnding", "candidateEnding", "baselineLastPurchase", "candidateLastPurchase", "baselineLatePurchases", "candidateLatePurchases", "baselineLateMajor", "candidateLateMajor", "baselineClusterLaneSeconds", "candidateClusterLaneSeconds"];
    const compared = rows.map(({ plan, mode, map, baseline: a, candidate: z }) => [plan, mode, map, a.wins, z.wins, a.shields.mean, z.shields.mean, a.duration.mean, z.duration.mean, a.spent.mean, z.spent.mean, a.endingCredits.mean, z.endingCredits.mean, a.lastPurchase.mean, z.lastPurchase.mean, a.latePurchases.mean, z.latePurchases.mean, a.lateResponsiveMajorPurchases.mean, z.lateResponsiveMajorPurchases.mean, a.clusterLaneSeconds.mean, z.clusterLaneSeconds.mean].join(","));
    fs.writeFileSync(path.join(research, "comparison.csv"), [columns.join(","), ...compared].join("\n") + "\n");
  }
  console.log(JSON.stringify({ variant, totalRuns: runs.length, baselineCommit: BASELINE, sourceSha256 }, null, 2));
  for (const summary of summaries) console.log(`${summary.plan.padEnd(19)} ${summary.mode.padEnd(11)} ${summary.map.padEnd(6)} ${String(summary.wins).padStart(2)}/12 shields ${summary.shields.mean} duration ${summary.duration.mean}s earned ${summary.earnedTotal.mean} spent ${summary.spent.mean} ending ${summary.endingCredits.mean} deaths ${summary.deaths.mean} falcons ${summary.falconCount.mean}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
