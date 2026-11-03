# Verification and final-head gate

Baseline: clean `b0ece92e4284ccb9919e5368cd18049a4d76a251`. Current runtime changes are bound by `../performance/source-sha256.json`; output files are hashed in `../assessment/production-output.json`. The final delivery must identify the pushed Git head and its Actions run. A historical run or an incomplete job is not a final pass.

| Check | Evidence / status |
| --- | --- |
| Rules, strict TypeScript, production build |223 rules passed; `rule-typescript-build.txt`; no dependency changes|
| Earlier focused checks, before final label-node fix |28/28 Chromium/WebKit,0 skipped/flaky/unexpected; `focused-production.json`|
| Slow-driver timing follow-up |4/4 pointer/touch cases (Chromium 4× CPU, WebKit); all six perfect campaign wins/save/reload/lost replay with 500ms action delay; `toggle-timing.json`, `slow-driver-campaign.json`|
| Continuous loop |Two real15s boundaries per engine, same active source/buffer/context and one fetch; `loop-integrity.json`: exact repeated decoded samples, nonzero seam energy|
| Complete production Chromium journeys |73/73 passed,0 skipped/flaky/unexpected; `production-chromium.json`;22m31s, final runtime and left-aligned toolbar|
| Complete three-engine CI |76 cases/engine,228 browser checks required across six existing shards; exact final-head run/conclusion supplied with delivery and visible in [Actions](https://github.com/tr3ylbry/TowerDefense/actions/workflows/browser.yml)|
| Standalone parity |36 stepwise runs against frozen original browser revision5647f09; `standalone-parity.json`|
| Preservation |248 illustrated poses/419 Original frames; hashes, proportional alpha registration and unchanged gameplay/campaign/save/pose sources in `preservation.json`|
| Offline animation tools |4 tests passed; accepted alien atlas bytes unchanged|
| Derivative regeneration / clean build |`reproducibility.json` records same-host source/output hashes and results|
| Dependency/permissions/output |Focused review and exact inventory under `../assessment/`; rights gaps remain|
| Physical/native/AT |Genuine limited Safari/owner feedback has explicit source boundaries; device checklist remains pending|

The suite grows from64 to76 scenarios per engine. The existing behavioral assertions remain. Music tests now observe equivalent real native buffer sources/clocks/gains instead of removed HTML media elements; no fake output, security flag or skipped engine substitutes for playback. The three production-excluded cases exercise test-only animation labs, which are intentionally absent from dist. Full CI retains all 76 in every engine. Application rules/campaign content and save schema remain unchanged; test selector changes only follow the requested visible capitalization.

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


## CI portability follow-up

The first 1.1 run at `e40924d` ([Actions run41562927953](https://github.com/tr3ylbry/TowerDefense/actions/runs/41562927953)) exposed two test assumptions on hosted Linux. WebKit decoded the exact 15-second source as 661,499 samples at 44,100Hz: one resampled sample short. The WAV source remains exactly 15 seconds, verified by rule tests. Native decoded duration is now checked against its exact frame count/rate with at most one sample of resampling rounding, consistent with [decodeAudioData resampling](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData). Single active source/buffer/context, real 30.1-second playback, one fetch, exact offline repeated samples and nonzero seam energy are all retained.

The row check incorrectly treated buttons as different rows when their top edges differed. Real center-aligned buttons can have different font/line heights or a 1px hover translation. Row grouping now uses vertical overlap; horizontal centering remains strictly within 1px, and every button must stay within the row's horizontal bounds. A 64px primary-button stress case and hover explicitly exercise this distinction. No CSS, audio transport, game rule, production asset or package changed in this follow-up. No test or engine is skipped. Both Firefox shards passed in that first run; the replacement final-head matrix must still run all engines.

The prior72-case production recording at5d16870 predates the final label-node fix; its application source and 121 output-file hashes were identical through5d16870, before the later control-label fix. The earlier28-case production check validated the decoder/row assertions. Final CI provides every 76-case engine result on the exact pushed revision. Earlier passes are not presented as later test-harness execution.


A second hosted Chromium run surfaced a pre-existing timing race in the actual Gargantua-contact case: a long purchase batch could finish after the brief arrival warning disappeared. The replacement test observes public warning mutations from the beginning, stops preparation when that warning is seen, and places its real barrier one tile behind the entry to allow slow-driver setup. It still requires the warning and an actual100-point health decrement, then verifies pause/style/speed/reduced-motion/restart behavior. No simulation clock, spawn, money or enemy is injected. `combat-synchronization.json` and `combat-contact.json` record both engine passes, including Chromium at4× CPU slowdown. This is another test-only correction; all121 production output hashes and application sources remained identical through5d16870. The final-head matrix remains the required complete gate.

The next run passed those corrections and both Firefox/WebKit shards, but exposed two hosted Chromium latency assumptions. The combined touch-toggle case continued making progress through its final controls when its 45-second overall deadline expired. Its 24 taps took about a second each; no completed call exceeded 2.1 seconds. Both pointer/touch variants now have a 90-second total budget, while each action and assertion remains bounded at 15 seconds. Every repeated cycle, color/state check and keyboard-focus assertion stays in place.

The campaign robot also purchased defenses at 2× speed while each card/tile click took about a second. It won Canyon Escalation with two shields, correctly failing the required three-star result. The robot now builds at the default 1× speed and switches to 2× only after purchases finish. This uses ordinary player controls and retains all six perfect victories, receipts, progression, save/reload and lost-replay assertions. No game rule, balance value or production file changes. Controlled slow-driver revalidation and final-head CI are recorded separately; earlier execution is not relabeled as a pass of the updated harness.

The controlled follow-up passed all four pointer/touch variants (Chromium 4× CPU and WebKit) and the complete production campaign with 500ms deliberate delay on browser actions. The campaign run took 12m37s, earned all 18 stars, restored them after reload and preserved the best result after a genuine lost replay. Both runs have zero skipped/flaky/unexpected cases. Final 223-rule/strict/build checks passed in both workspace and the clean lockfile installation; all 121 output hashes remained identical through5d16870.

## Held-pointer input correction

The5d16870 matrix passed all75 Chromium and75 Firefox cases, with74/75 WebKit cases. The campaign speed assertion exposed a real input defect: a HUD update replaced the hit-tested text node between mouse-down and mouse-up, cancelling WebKit click activation. `held-pointer-before.json` reproduces the same unchanged1× value against that production build using real telemetry and a held native pointer. This is not an assertion tolerance or blind-retry change.

Speed, destination and wave-call captions now retain their Text node and update its data only as needed. The identical real-HUD regression passes local Chromium/WebKit (`held-pointer-after.json`). The first local attempt lacked Firefox (`held-pointer-local-attempt.json`). Installing the pinned Firefox157 succeeded, but launch still fails before page creation with “Could not find profile folder” (`held-pointer-installed-firefox-attempt.json`), matching the earlier environment probe. No browser security/preference workaround is used; Firefox remains mandatory in the full228-case CI matrix. The new case adds meaningful coverage in each engine. No simulation, combat, save, schedule, pose or asset changes.

Unlike earlier harness-only follow-ups, this changes the runtime. Cold loading/cache and actual combat are remeasured, output/source hashes and clean-build evidence refreshed, and a fresh73-case independent production run replaces the earlier72-case result. Earlier histories are retained with their original scope; final-head CI is still required.

The owner then confirmed on actual iPhone Safari that the centered buttons and toggle colors looked correct, and requested left alignment of the tools row. The final CSS removes trailing auto margins/distribution in normal, focused and compact landscape layouts; `toolbar-alignment.json` checks actual bounds in both local engines at desktop/portrait/landscape. This last layout request is included before the final production rerun and final-head matrix.

The final independent production run passed73/73 player-facing scenarios in22m31s, zero skipped/flaky/unexpected, with the stable-label fix and owner-requested left-aligned toolbar both included. All20 required journeys above are covered; the three test-only fixture cases remain in the complete228-check CI gate. `production-chromium.json` supersedes the earlier72-case result at5d16870. Current source/output hashes match the measured runtime and clean installation.
