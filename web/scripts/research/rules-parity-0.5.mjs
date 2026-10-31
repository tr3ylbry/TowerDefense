/** Node 24 offline check: presentation-only changes preserve the frozen 0.4 rules. */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import * as current from "../../src/game/content.ts";
import * as baseline from "../../reports/expedition-0.4/research/candidate/source/content.ts";

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const files = {};
for (const name of ["simulation.ts", "combat.ts", "waves.ts"]) {
  const before = readFileSync(
    new URL(
      `../../reports/expedition-0.4/research/candidate/source/${name}`,
      import.meta.url,
    ),
  );
  const after = readFileSync(
    new URL(`../../src/game/${name}`, import.meta.url),
  );
  assert.deepEqual(after, before, `${name} changed`);
  files[name] = sha(after);
}
for (const name of ["ROWS", "COLS", "STEP", "AMMO", "ENEMIES", "MAPS"])
  assert.deepEqual(current[name], baseline[name], `${name} changed`);
const towers = structuredClone(current.TOWERS);
assert.equal(towers.falcon.name, "Frontier Flagship");
assert.equal(baseline.TOWERS.falcon.name, "Millennium Falcon");
towers.falcon.name = baseline.TOWERS.falcon.name;
assert.deepEqual(
  towers,
  baseline.TOWERS,
  "Defender rules changed beyond the public name",
);
const seeds = Array.from({ length: 12 }, (_, index) => index + 1);
for (const map of Object.keys(current.MAPS))
  for (const seed of seeds)
    assert.deepEqual(
      current.makeSpawns(seed, map),
      baseline.makeSpawns(seed, map),
    );
const output = new URL(
  "../../reports/expedition-0.5/verification/rules-parity.json",
  import.meta.url,
);
mkdirSync(new URL(".", output), { recursive: true });
const result = {
  baseline: "Frozen 0.4 candidate sources; unchanged game code at 96f8297",
  unchangedGameSourceHashes: files,
  equalExports: [
    "ROWS",
    "COLS",
    "STEP",
    "AMMO",
    "ENEMIES",
    "MAPS",
    "TOWERS except falcon display name",
  ],
  spawnComparisons: seeds.length * Object.keys(current.MAPS).length,
  onlyContentDifference: "Millennium Falcon → Frontier Flagship display name",
  conclusion:
    "No rule/balance change; the existing matched 0.4 policy research remains applicable, not a new human finding.",
};
writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
console.log(
  JSON.stringify({
    unchangedGameModules: Object.keys(files).length,
    spawnComparisons: result.spawnComparisons,
    rulesEqual: true,
  }),
);
