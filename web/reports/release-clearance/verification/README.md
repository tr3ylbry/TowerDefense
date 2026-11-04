# Reproduction and evidence boundaries

Use a Git checkout with full history/tags (the verifier reads frozen commits and `school-project-2019`). From `web/`, use the pinned lockfile and Node >=22.12 (CI Node 24):

```
npm ci
npm run verify:release
```

This runs rules, strict TypeScript, full comparison build, Expedition-only build, actual-output inventory/exclusions, 36 frozen standalone parity runs, 248-pose/419-frame/history preservation, and the production release browser matrix. Install the pinned Playwright engines once with `npx playwright install --with-deps`. Offline image verification additionally requires Python 3/Pillow, matching the existing animation tooling. No public deployment, account or API key is needed.

`npm run test:e2e` independently retains the entire full-development browser matrix. `npm run test:release` uses only fresh `dist-release` with the production preview. Build-specific comparison/anatomy-fixture cases remain unchanged in the development suite. Release equivalents assert absence of Original UI, actual permitted resource requests, all-nine earned-credit combat, native audio, mobile controls, and failure/retry. No test is marked skipped and no simulation clock, credits, spawns or damage is replaced. Existing tests that seed local saves for navigation/failure cases keep that explicit scope; the full progression journey earns all six victories.

Output inspection: `npm run verify:release:assets`. Exact file hashes and exclusions are written to ignored `.release-verification/`. Reports retained here identify their source revision. Generated candidate assets/archives stay ignored; use `npm run package:release` only after committing and rebuilding from a clean tree. It refuses dirty source or a stale build and emits a deterministic local ZIP, per-file manifest and archive SHA-256.

Music interruption/background tests use real native audio buffers and explicit context suspension/browser visibility events. They do not replace real iPhone interruption or spoken screen-reader testing. Emulated viewports/touch/zoom and semantic/keyboard assertions are technical accessibility evidence only.

The full three-engine command is exercised in Linux CI. The current Mac has a previously documented Firefox temporary-profile launch failure before page creation; selecting Chromium/WebKit locally is a diagnostic subset and does not replace mandatory Firefox CI. No browser security/preferences workaround is applied.


The completed implementation run is [41757618436](https://github.com/tr3ylbry/TowerDefense/actions/runs/41757618436), source `6c3734e61c6120e34646e902f327a5e68f56d0b9`: 228 full-development and 183 release production browser checks pass across all three engines, plus 228 unique rules. All six Linux release inventories match all 41 clean Mac output files. See `ci-summary.json`, `ci-release-summary.json`, six retained release browser JSON files and `inventory.json`.

The final handoff adds a tested stale-hash chunk rejection without changing runtime assets/source or browser scenarios. Its separately generated clean artifact manifest identifies the final containing commit. Auxiliary diagnostics: `scripts/release/profile.mjs` for paired loading, `scripts/release/dense-combat.mjs` for earned crowded combat, and `scripts/release/archive-smoke.mjs` for a real extracted ZIP served at `/site/` (ordinary local static server; no mocked resources). These are engineering probes, not participants or device/speech evidence.
