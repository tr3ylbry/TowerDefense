/* Reproducible public-API study and frozen 0.5 parity. No application state manipulation. */
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  crypto = require("node:crypto"),
  assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const web = path.resolve(__dirname, "../.."),
  out = path.resolve(web, process.env.AVA_RELEASE_EVIDENCE || ".release-verification");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ava-release-parity-"));
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
  const oldExplosiveName = oldContent.TOWERS.explosive.name;
  oldContent.TOWERS.explosive.name = content.TOWERS.explosive.name;
  // Exact display-copy updates only; every gameplay field remains deeply compared.
  assert.equal(oldContent.TOWERS.tars.name, "TARS");
  assert.equal(content.TOWERS.tars.name, "Augie");
  assert.equal(oldContent.TOWERS.tars.description, "Piercing rounds ignore Tank plating.");
  assert.equal(content.TOWERS.tars.description, "Precision armor-piercing rounds ignore Tank plating.");
  oldContent.TOWERS.tars.name = content.TOWERS.tars.name;
  oldContent.TOWERS.tars.description = content.TOWERS.tars.description;
  assert.equal(content.ENEMIES.tank.description, oldContent.ENEMIES.tank.description.replace("TARS", "Augie"));
  oldContent.ENEMIES.tank.description = content.ENEMIES.tank.description;
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
  fs.writeFileSync(path.join(out,"standalone-parity.json"),JSON.stringify({baseline,definitionParity:true,presentationOnly:{explosive:{before:oldExplosiveName,after:content.TOWERS.explosive.name},robot:{before:"TARS",after:"Augie",description:"Precision armor-piercing rounds ignore Tank plating."},tankGuidance:"TARS → Augie"},scheduleComparisons:36,stepwiseRuns:parity,sourceSha256:hashes},null,2)+"\n");
  console.log(JSON.stringify({originalParityRuns:parity.length}));
} finally { fs.rmSync(temporary,{recursive:true,force:true}); }
