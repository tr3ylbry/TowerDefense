/* Offline candidate study: isolated source copies, identical fixed-step engine.
 * Only authored data/budget/one explicit constraint differ. Never changes the app. */
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os");
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const web = path.resolve(__dirname, "../..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ava09-challenges-"));
const out = path.join(web, "reports/expedition-0.9/research");
const candidates = ["normal", "timing", "composition", "budget", "lane-limit"];
const seeds = Array.from({ length: 12 }, (_, i) => 3352019 + i);
const runs = [],
  hashes = {};
try {
  for (const candidate of candidates) {
    const root = path.join(temp, candidate);
    for (const file of [
      ...fs.readdirSync(path.join(web, "src/game")).map((f) => "src/game/" + f),
      "tests/helpers/campaign-policy.ts",
    ]) {
      let source = fs.readFileSync(path.join(web, file), "utf8");
      hashes[file] = crypto.createHash("sha256").update(source).digest("hex");
      if (file.endsWith("simulation.ts")) {
        if (candidate === "budget")
          source = source.replaceAll("credits = 230", "credits = 150");
        if (candidate === "lane-limit")
          source = source.replace(
            "    const definition = TOWERS[kind];",
            `    if (this.towers.filter(t => t.row === row).length >= 2) return {ok:false,message:'Research: two defenders per lane.'};\n    const definition = TOWERS[kind];`,
          );
      }
      if (candidate === "lane-limit" && file.endsWith("campaign-policy.ts"))
        source = source.replace(
          "// Save for the next planned slot",
          "if (live.towers.filter(t => t.row === slot.row).length >= 2) continue;\n      // Save for the next planned slot",
        );
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.writeFileSync(path.join(root, file), source);
    }
    execFileSync(process.execPath, [
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
      path.join(root, "tests/helpers/campaign-policy.ts"),
    ]);
    const { MISSIONS } = require(
      path.join(root, "compiled/src/game/missions.js"),
    );
    const { makeMissionSpawns } = require(
      path.join(root, "compiled/src/game/content.js"),
    );
    const { playCampaign, PACING_POLICIES: policies } = require(
      path.join(root, "compiled/tests/helpers/campaign-policy.js"),
    );
    const original = MISSIONS["first-contact"].waves;
    if (candidate === "timing")
      MISSIONS["first-contact"].waves = original.map((w, i) => ({
        ...w,
        start: [7, 22, 38, 56][i],
      }));
    if (candidate === "composition")
      MISSIONS["first-contact"].waves = original.map((w, i) => ({
        ...w,
        enemies:
          i === 0
            ? w.enemies
            : i === 1
              ? [
                  "sprinter",
                  "grunt",
                  "sprinter",
                  "grunt",
                  "sprinter",
                  "sprinter",
                  "scout",
                  "grunt",
                ]
              : i === 2
                ? [
                    "tank",
                    "manhunter",
                    "tank",
                    "sprinter",
                    "grunt",
                    "sprinter",
                    "tank",
                    "scout",
                    "manhunter",
                  ]
                : [
                    "tank",
                    "sprinter",
                    "tank",
                    "manhunter",
                    "sprinter",
                    "gargantua",
                    "tank",
                    "sprinter",
                    "tank",
                    "manhunter",
                  ],
        entries: i
          ? w.enemies.map((_, j) => ({
              offset: Math.floor(j / 6) * 5 + (j % 6) * 0.8,
              laneSlot: j % 6,
            }))
          : undefined,
      }));
    for (const policy of policies)
      for (const mode of ["automatic", "clear-field", "aggressive"])
        for (const seed of seeds) {
          const {
            state: s,
            research,
            idle,
            allCoveredAt,
          } = playCampaign("first-contact", seed, policy, mode);
          runs.push({
            candidate,
            policy,
            mode,
            seed,
            outcome: s.phase === "playing" ? "timeout" : s.phase,
            shields: s.integrity,
            duration: s.elapsed,
            kills: s.kills,
            credits: s.credits,
            economy: s.economy,
            idle,
            allCoveredAt,
            research,
          });
        }
    fs.writeFileSync(
      path.join(out, `schedule-${candidate}.json`),
      JSON.stringify(makeMissionSpawns(seeds[0], "first-contact"), null, 2) +
        "\n",
    );
  }
  const { playCampaign: productionPlay } = require(
    path.join(temp, "normal/compiled/tests/helpers/campaign-policy.js"),
  );
  for (const expected of runs.filter((r) => r.candidate === "composition")) {
    const {
      state: s,
      research,
      idle,
      allCoveredAt,
    } = productionPlay(
      "first-contact",
      expected.seed,
      expected.policy,
      expected.mode,
      "hard",
    );
    const actual = {
      candidate: "composition",
      policy: expected.policy,
      mode: expected.mode,
      seed: expected.seed,
      outcome: s.phase === "playing" ? "timeout" : s.phase,
      shields: s.integrity,
      duration: s.elapsed,
      kills: s.kills,
      credits: s.credits,
      economy: s.economy,
      idle,
      allCoveredAt,
      research,
    };
    assert.deepEqual(
      actual,
      expected,
      "Production Hard must match the studied composition exactly",
    );
  }
  const mean = (xs) =>
    Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
  const summaries = [];
  for (const candidate of candidates)
    for (const policy of [
      "cheap",
      "economy",
      "armor",
      "mixed",
      "reactive",
      "splash",
    ])
      for (const mode of ["automatic", "clear-field", "aggressive"]) {
        const a = runs.filter(
          (r) =>
            r.candidate === candidate && r.policy === policy && r.mode === mode,
        );
        summaries.push({
          candidate,
          policy,
          mode,
          wins: a.filter((r) => r.outcome === "won").length,
          losses: a.filter((r) => r.outcome === "lost").length,
          timeouts: a.filter((r) => r.outcome === "timeout").length,
          shields: mean(a.map((r) => r.shields)),
          duration: mean(a.map((r) => r.duration)),
          coverage: mean(a.map((r) => r.allCoveredAt ?? 600)),
          ending: mean(a.map((r) => r.credits)),
          lossesMean: mean(a.map((r) => r.economy.losses)),
          spent: mean(a.map((r) => r.economy.spent)),
          income: mean(a.map((r) => r.economy.growth)),
          armoredSeconds: mean(a.map((r) => r.research.threatSeconds.armored)),
          clusteredSeconds: mean(
            a.map((r) => r.research.threatSeconds.clusteredLane),
          ),
          overlapSeconds: mean(a.map((r) => r.research.overlapSeconds)),
          maxEnemies: mean(a.map((r) => r.research.maxEnemies)),
          active: mean(a.map((r) => r.research.pacing.active)),
          purchases: mean(a.map((r) => r.economy.purchases)),
          lastPurchase: mean(a.map((r) => r.research.lastPurchaseAt ?? 0)),
        });
      }
  fs.writeFileSync(
    path.join(out, "candidates.json"),
    JSON.stringify(
      {
        sourceSha256: hashes,
        seeds,
        candidates,
        productionHardVerified: 216,
        runs,
        summaries,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify(
      candidates.map((candidate) => ({
        candidate,
        wins: runs.filter(
          (r) => r.candidate === candidate && r.outcome === "won",
        ).length,
        losses: runs.filter(
          (r) => r.candidate === candidate && r.outcome === "lost",
        ).length,
        timeouts: runs.filter(
          (r) => r.candidate === candidate && r.outcome === "timeout",
        ).length,
      })),
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
