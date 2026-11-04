import { defineConfig } from "@playwright/test";
import full from "./playwright.config";

// These assertions require Original comparison or dev-only anatomy fixtures.
// They remain unchanged in the full-development matrix. Release equivalents cover
// controls/loading/combat without presenting a comparison that is not distributed.
const comparisonOrFixture = [
  "joint poses animate", "both anatomy pilots animate", "all six illustrated aliens walk",
  "defers comparison and other environments", "slow artwork pauses live play",
  "failed comparison can cancel", "first-play guidance distinguishes",
  "repeated presentation and mission lifecycles", "new defender illustrations defer",
  "backgrounding during a slow transition", "slow initial artwork reports",
  "complete illustrated roster defers", "original rosters keep portraits",
  "phone navigation aligns", "focused desktop controls fit",
  "real moving and attacking Sprinters survive comparison",
  "illustrated roster survives actual spawned combat",
  "compact and tablet controls remain reachable",
  "phone targets, far-cell placement", "all nine illustrated defenders form", "enabled highlights follow state",
];
export default defineConfig(full, {
  testDir: "./tests",
  testMatch: ["browser/**/*.spec.ts", "release/**/*.spec.ts"],
  grepInvert: new RegExp(comparisonOrFixture.join("|")),
  outputDir: ".release-verification/test-results",
  use: { baseURL: process.env.AVA_TEST_URL ?? "http://127.0.0.1:4181" },
  webServer: process.env.AVA_TEST_URL ? undefined : {
    command: "npm run preview:release -- --port 4181 --strictPort",
    url: "http://127.0.0.1:4181", reuseExistingServer: !process.env.CI,
  },
});
