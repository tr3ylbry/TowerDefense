/* Reassess shipped Hard via public actions; no new balance variant is proposed. */
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const web = path.resolve(__dirname, "../.."),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "ava10-hard-"));
const out = path.join(web, "reports/expedition-1.0/research");
try {
  const hashes = {};
  for (const file of [
    ...fs.readdirSync(path.join(web, "src/game")).map((f) => "src/game/" + f),
    "tests/helpers/campaign-policy.ts",
  ]) {
    const bytes = fs.readFileSync(path.join(web, file));
    hashes[file] = crypto.createHash("sha256").update(bytes).digest("hex");
    fs.mkdirSync(path.dirname(path.join(temp, file)), { recursive: true });
    fs.writeFileSync(path.join(temp, file), bytes);
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
    path.join(temp, "compiled"),
    path.join(temp, "tests/helpers/campaign-policy.ts"),
  ]);
  const { playCampaign } = require(
    path.join(temp, "compiled/tests/helpers/campaign-policy.js"),
  );
  const previous = JSON.parse(
    fs.readFileSync(
      path.join(web, "reports/expedition-0.9/research/candidates.json"),
    ),
  );
  const runs = [];
  for (const expected of previous.runs.filter((r) =>
    ["normal", "composition"].includes(r.candidate),
  )) {
    const {
      state: s,
      research,
      idle,
      allCoveredAt,
    } = playCampaign(
      "first-contact",
      expected.seed,
      expected.policy,
      expected.mode,
      expected.candidate === "composition" ? "hard" : "normal",
    );
    const actual = {
      candidate: expected.candidate,
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
      "Every outcome/economy/pressure/call field must retain 0.9 behavior",
    );
    runs.push(actual);
  }
  const summaries = previous.summaries.filter((r) =>
    ["normal", "composition"].includes(r.candidate),
  );
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "hard.json"),
    JSON.stringify({
      baseline: "feae81d",
      sourceSha256: hashes,
      exactPriorMatches: runs.length,
      change:
        "Briefing now names existing plating counters. No schedule, rules, resources, rewards or save changes.",
      limits:
        "Deterministic fixed policies are not human fairness or enjoyment measurements.",
      summaries,
      runs,
    }) + "\n",
  );
  console.log(JSON.stringify({ exactPriorMatches: runs.length }, null, 2));
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
