/* Reproducible public-API study and frozen 0.5 parity. No application state manipulation. */
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  crypto = require("node:crypto"),
  assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const web = path.resolve(__dirname, "../.."),
  out = path.join(web, "reports/expedition-0.7/research");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ava07-study-"));
const baseline = "5647f09b44520af8a0d7382b3532ac2c8362c914";
const hashes = {};
function compile(root, files) {
  execFileSync(
    process.execPath,
    [
      path.join(web, "node_modules/typescript/bin/tsc"),
      "--ignoreConfig",
      "--module",
      "node16",
      "--target",
      "es2022",
      "--strict",
      "--skipLibCheck",
      "--outDir",
      path.join(root, "compiled"),
      ...files.map((file) => path.join(root, file)),
    ],
    { stdio: "inherit" },
  );
}
try {
  fs.mkdirSync(out, { recursive: true });
  const current = path.join(temporary, "current"),
    old = path.join(temporary, "baseline");
  for (const file of [
    ...fs.readdirSync(path.join(web, "src/game")).map((f) => "src/game/" + f),
    "tests/helpers/campaign-policy.ts",
  ]) {
    const bytes = fs.readFileSync(path.join(web, file));
    hashes[file] = crypto.createHash("sha256").update(bytes).digest("hex");
    fs.mkdirSync(path.dirname(path.join(current, file)), { recursive: true });
    fs.writeFileSync(path.join(current, file), bytes);
  }
  compile(current, [
    "src/game/simulation.ts",
    "src/game/validate-content.ts",
    "tests/helpers/campaign-policy.ts",
  ]);
  fs.mkdirSync(old);
  for (const file of ["content.ts", "simulation.ts", "combat.ts", "waves.ts"])
    fs.writeFileSync(
      path.join(old, file),
      execFileSync("git", ["show", `${baseline}:web/src/game/${file}`], {
        cwd: web,
      }),
    );
  compile(old, ["simulation.ts"]);
  const content = require(path.join(current, "compiled/src/game/content.js"));
  const missions = require(path.join(current, "compiled/src/game/missions.js"));
  const { Simulation } = require(
    path.join(current, "compiled/src/game/simulation.js"),
  );
  const oldContent = require(path.join(old, "compiled/content.js"));
  const { Simulation: OldSimulation } = require(
    path.join(old, "compiled/simulation.js"),
  );
  const { validateContent } = require(
    path.join(current, "compiled/src/game/validate-content.js"),
  );
  validateContent();
  for (const key of [
    "TOWERS",
    "ENEMIES",
    "AMMO",
    "MAPS",
    "ROWS",
    "COLS",
    "STEP",
  ])
    assert.deepEqual(content[key], oldContent[key], key);
  const seeds = Array.from({ length: 12 }, (_, i) => 3352019 + i),
    parity = [];
  for (const map of ["canyon", "bridge", "nest"])
    for (const seed of seeds) {
      assert.deepEqual(
        content.makeSpawns(seed, map),
        oldContent.makeSpawns(seed, map),
      );
      const game = new Simulation(seed, map),
        reference = new OldSimulation(seed, map);
      game.start();
      reference.start();
      const compare = () => {
        const { mission, ...state } = game.snapshot();
        assert.deepEqual(state, reference.snapshot());
        assert.deepEqual(game.drainEvents(), reference.drainEvents());
      };
      // Identical earned-credit specialist actions, early calls, pause, speed and restarts.
      for (
        let tick = 0;
        tick < 8000 && game.snapshot().phase === "playing";
        tick++
      ) {
        const state = game.snapshot();
        let stop = false;
        for (const kind of ["astro", "tars"]) {
          for (let row = 0; row < 6; row++) {
            const cols = Array.from({ length: 9 }, (_, col) => col).filter(
              (col) => !content.isBlocked(map, row, col),
            );
            const col = cols[kind === "astro" ? 0 : 1];
            if (
              game.snapshot().towers.some((t) => t.row === row && t.col === col)
            )
              continue;
            if (game.snapshot().credits < content.TOWERS[kind].cost) {
              stop = true;
              break;
            }
            assert.deepEqual(
              game.place(kind, row, col),
              reference.place(kind, row, col),
            );
          }
          if (stop) break;
        }
        if (!state.enemies.length && state.nextWave?.canLaunch)
          assert.deepEqual(game.launchNextWave(), reference.launchNextWave());
        if (tick === 300) {
          game.pause();
          reference.pause();
          game.advance(1);
          reference.advance(1);
          compare();
          game.resume();
          reference.resume();
          game.setSpeed(2);
          reference.setSpeed(2);
        }
        game.advance(0.05);
        reference.advance(0.05);
        compare();
      }
      assert.equal(game.snapshot().phase, "won");
      parity.push({
        map,
        seed,
        outcome: game.snapshot().phase,
        shields: game.snapshot().integrity,
        duration: game.snapshot().elapsed,
      });
      game.restart();
      reference.restart();
      compare();
    }
  fs.writeFileSync(
    path.join(out, "original-parity.json"),
    JSON.stringify(
      {
        baseline,
        sourceSha256: hashes,
        definitionParity: true,
        scheduleComparisons: 36,
        stepwiseRuns: parity,
      },
      null,
      2,
    ) + "\n",
  );
  const { playCampaign, POLICIES } = require(
    path.join(current, "compiled/tests/helpers/campaign-policy.js"),
  );
  const newMissions = missions.CAMPAIGN_ORDER,
    modes = ["automatic", "clear-field", "aggressive"],
    runs = [];
  for (const id of newMissions)
    for (const policy of POLICIES)
      for (const mode of modes)
        for (const seed of seeds) {
          const { game, state, idle, allCoveredAt, research } = playCampaign(
              id,
              seed,
              policy,
              mode,
            ),
            e = state.economy;
          assert.equal(
            230 +
              e.supply +
              e.growth +
              e.bounties +
              e.calls +
              e.salvage -
              e.spent,
            state.credits,
            "ledger",
          );
          assert.equal(state.wave <= 4, true);
          assert.equal(state.credits >= 0, true);
          // One explicitly separate follow-up to the bounded policy timeout.
          // Leave the original result intact; use public salvage and let a passed Tank breach.
          let timeoutRecovery;
          if (state.phase === "playing") {
            const enemy = state.enemies[0];
            assert.equal(enemy.kind, "tank");
            const action = game.remove(enemy.row, 0);
            assert.equal(action.ok, true);
            game.advance(10);
            const recovered = game.snapshot();
            assert.equal(recovered.phase, "won");
            assert.equal(recovered.integrity, 2);
            timeoutRecovery = {
              action: { type: "salvage", row: enemy.row, col: 0 },
              advanced: 10,
              outcome: recovered.phase,
              shields: recovered.integrity,
              duration: recovered.elapsed,
            };
          }
          runs.push({
            id,
            policy,
            mode,
            seed,
            outcome: state.phase === "playing" ? "timeout" : state.phase,
            shields: state.integrity,
            duration: state.elapsed,
            kills: state.kills,
            spent: e.spent,
            credits: state.credits,
            losses: e.losses,
            purchases: e.purchases,
            calls: state.earlyLaunches,
            idle,
            allCoveredAt,
            economy: e,
            research,
            ...(timeoutRecovery ? { timeoutRecovery } : {}),
            ...(state.phase === "playing"
              ? {
                  remainingThreats: state.enemies.map(
                    ({ kind, row, x, health }) => ({ kind, row, x, health }),
                  ),
                }
              : {}),
          });
        }
  const mean = (xs) =>
    Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
  const summaries = [];
  for (const id of newMissions)
    for (const policy of POLICIES)
      for (const mode of modes) {
        const subset = runs.filter(
          (r) => r.id === id && r.policy === policy && r.mode === mode,
        );
        summaries.push({
          id,
          policy,
          mode,
          wins: subset.filter((r) => r.outcome === "won").length,
          losses: subset.filter((r) => r.outcome === "lost").length,
          timeouts: subset.filter((r) => r.outcome === "timeout").length,
          meanShields: mean(subset.map((r) => r.shields)),
          meanDuration: mean(subset.map((r) => r.duration)),
          meanSpent: mean(subset.map((r) => r.spent)),
          meanEnding: mean(subset.map((r) => r.credits)),
          meanDeaths: mean(subset.map((r) => r.losses)),
          meanIdle: mean(subset.map((r) => r.idle)),
          meanReplacements: mean(subset.map((r) => r.research.replacements)),
          meanLongestIdle: mean(subset.map((r) => r.research.longestIdle)),
          meanLastPurchaseAt: mean(
            subset.map((r) => r.research.lastPurchaseAt ?? 0),
          ),
          meanAfterLastPurchase: mean(
            subset.map((r) => r.duration - (r.research.lastPurchaseAt ?? 0)),
          ),
          meanThreatSeconds: Object.fromEntries(
            ["armored", "heavy", "clusteredLane", "passedLane"].map((key) => [
              key,
              mean(subset.map((r) => r.research.threatSeconds[key])),
            ]),
          ),
          latestCoverage: Math.max(...subset.map((r) => r.allCoveredAt ?? 600)),
        });
      }
  // Instrumentation must not alter the 540 previously published policy outcomes.
  const previous = JSON.parse(
    fs.readFileSync(
      path.join(web, "reports/expedition-0.6/research/balance.json"),
    ),
  );
  for (const old of previous.runs) {
    const current = runs.find(
      (r) =>
        r.id === old.id &&
        r.policy === old.policy &&
        r.mode === old.mode &&
        r.seed === old.seed,
    );
    for (const key of Object.keys(old))
      assert.deepEqual(
        current[key],
        old[key],
        `${old.id}/${old.policy}/${old.mode}/${old.seed}/${key}`,
      );
  }
  const metadata = {
    baseline,
    sourceSha256: hashes,
    seeds,
    modes,
    policies: POLICIES,
    totalRuns: runs.length,
    unchangedPriorPolicyRuns: previous.runs.length,
    limits:
      "Fixed public-action policies; neither optimal play nor independent human feedback. Idle is not boredom, win percentages are not enjoyment. No global balance changes.",
  };
  fs.writeFileSync(
    path.join(out, "balance.json"),
    JSON.stringify({ ...metadata, summaries, runs }) + "\n",
  );
  fs.writeFileSync(
    path.join(out, "summary.json"),
    JSON.stringify({ ...metadata, summaries }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        originalParityRuns: parity.length,
        runs: runs.length,
        unchangedPriorPolicyRuns: previous.runs.length,
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
