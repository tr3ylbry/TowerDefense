# Verification and final-head gate

Baseline: clean `b0ece92e4284ccb9919e5368cd18049a4d76a251`. Current runtime changes are bound by `../performance/source-sha256.json`; output files are hashed in `../assessment/production-output.json`. The final delivery must identify the pushed Git head and its Actions run. A historical run or an incomplete job is not a final pass.

| Check | Evidence / status |
| --- | --- |
| Rules, strict TypeScript, production build |223 rules passed; `rule-typescript-build.txt`; no dependency changes|
| Final focused independent production checks |28/28 Chromium/WebKit,0 skipped/flaky/unexpected; `focused-production.json`|
| Continuous loop |Two real15s boundaries per engine, same active source/buffer/context and one fetch; `loop-integrity.json`: exact repeated decoded samples, nonzero seam energy|
| Complete production Chromium journeys |72/72 passed,0 skipped/flaky/unexpected; `production-chromium.json`;18m02s, final independent production build|
| Complete three-engine CI |75 cases/engine,225 browser checks required across six existing shards; exact final-head run/conclusion supplied with delivery and visible in [Actions](https://github.com/tr3ylbry/TowerDefense/actions/workflows/browser.yml)|
| Standalone parity |36 stepwise runs against frozen original browser revision5647f09; `standalone-parity.json`|
| Preservation |248 illustrated poses/419 Original frames; hashes, proportional alpha registration and unchanged gameplay/campaign/save/pose sources in `preservation.json`|
| Offline animation tools |4 tests passed; accepted alien atlas bytes unchanged|
| Derivative regeneration / clean build |`reproducibility.json` records same-host source/output hashes and results|
| Dependency/permissions/output |Focused review and exact inventory under `../assessment/`; rights gaps remain|
| Physical/native/AT |Genuine limited Safari/owner feedback has explicit source boundaries; device checklist remains pending|

The suite grows from64 to75 scenarios per engine. The existing behavioral assertions remain. Music tests now observe equivalent real native buffer sources/clocks/gains instead of removed HTML media elements; no fake output, security flag or skipped engine substitutes for playback. The three production-excluded cases exercise test-only animation labs, which are intentionally absent from dist. Full CI retains all 75 in every engine. Application rules/campaign content and save schema remain unchanged; test selector changes only follow the requested visible capitalization.

## Required player journeys

| Journey | Retained or new production coverage |
| --- | --- |
|1 Fresh visitor /2 successful assets |`mission`,0.3/0.5 asset cases,1.1 initial21-image inventory and readiness|
|3 Begin Standalone /4 deploy |`mission` public keyboard/touch placement and roster cases|
|5 Income/combat |Paused-economy, both income units, mixed nine-defender wins on all3 environments|
|6 Pause/resume |Public controls, visibility and dialog ownership regressions|
|7 Call waves |Keyboard calls/reward/schedule/warnings; earned-credit victories|
|8 Switch art |Transactional both-style state preservation,419-frame fit, repeated transitions|
|9 Unit Stats/Salvage |Hover/tap/pin/keyboard/Escape, nonmodal live play, valid20-credit refund and invalid no-refund|
|10 Mix |Rapid close/reopen, prepaused/running ownership, Escape/focus/absence and state transitions|
|11 FX/Music |Default-off/deferred,65% independent real gains, zero mute, held download cancel/retry, real context suspension/latest-intent toggles and state colors|
|12 Complete mission /13 economy terminal |Real public-control wins/results, actual deployment/spending/income/bounty/salvage receipt checks|
|14 Campaign /15 complete/unlock |Six-mission public-control journey; no injected progress for earned victories|
|16 Reload/persistence /17 best replay |Saved stars/best-result preservation and deliberate lost replay|
|18 Hard isolation |Earned Hard win/loss, Normal progress unchanged, return to Normal awards stars, restart/speed distinct|
|19 Load failure/retry/cancel |Initial/map/style/atlas failures, partial cache, unchanged paused mission and background protection|
|20 Repeated restarts |Retained lifecycle case plus production profile10 restarts/36 destination selections; bounded handle/canvas observations, not proof of no leaks|

The all-unlocked fixture in profiling is used only to navigate. It is not campaign completion evidence. Public-control tests spend earned credits, use existing schedules and wait for real results. No source rewrite or browser-state hack creates a victory.

## Reproduce independently of dev

Build with `npm ci` and `npm run check`; serve a fresh dist folder at4175 using Vite preview. Set `AVA_TEST_URL=http://127.0.0.1:4175`, then run:

```sh
PLAYWRIGHT_CHANNEL=chrome npx playwright test --project=chromium --workers=1 --grep-invert 'joint poses animate|both anatomy pilots animate|all six illustrated aliens walk'
```

For all fixtures/all engines use the ordinary `npm run test:e2e` workflow with installed Chromium/Firefox/WebKit. CI performs a clean Node24 install/check and the complete matrix, with real PulseAudio virtual output to let browser audio clocks run on hosted Linux. It keeps the existing two shards per engine and35-minute job limit. No rendering/security bypass is added.

Run `python3 -m unittest discover -s scripts -p test_animation_tools.py`, `python3 scripts/research/verify-preservation-1.1.py`, and `node scripts/research/standalone-parity-1.1.cjs` for offline/preservation/parity evidence. Python/Pillow are optional for rebuilding/auditing; checked-in derivatives make them unnecessary for ordinary play/build.

Final physical phone layout/audio/background/long-session results, live game screen-reader speech and five independent first-time sessions remain separate external evidence. Native AX/engine emulation are not substituted for them. See `../assessment/DEVICE_CHECKLIST.md`. No public deployment is part of this verification.

Runtime commits: `5b64b83` (defender delivery) and `3096620` (audio/dialog/interface stabilization). The accompanying documentation/evidence commit completes the delivery. The exact pushed head and its complete CI run are reported at handoff; verify the Actions head SHA rather than assuming an earlier green run covers a later commit.
