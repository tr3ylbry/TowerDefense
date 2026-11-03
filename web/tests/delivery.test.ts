import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import delivery from "../art-source/expedition-1.1/defender-delivery.json";
import { EXPEDITION_TOWERS } from "../src/game/art";

it("keeps the delivered defenders proportional, alpha-registered and at least twice world size", () => {
  expect(delivery.assets).toHaveLength(9);
  for (const art of Object.values(EXPEDITION_TOWERS)) {
    const record = delivery.assets.find((row) => row.file === `public/art/${art.file}`)!;
    expect(record).toBeDefined();
    expect(record.alphaExactAfterResampling).toBe(true);
    expect(record.size[0]).toBeGreaterThanOrEqual(art.width * 2);
    expect(record.size[1]).toBeGreaterThanOrEqual(art.height * 2);
    expect(record.bytes).toBeLessThan(record.previousBytes);
    for (const [file, hash] of [[record.file, record.sha256], [record.source, record.sourceSha256]]) {
      const bytes = readFileSync(new URL(`../${file}`, import.meta.url));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
    }
  }
});
