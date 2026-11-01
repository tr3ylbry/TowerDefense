# Expedition 0.6 verification boundaries

Baseline: clean `5647f09b44520af8a0d7382b3532ac2c8362c914`, `modernization`, origin only `https://github.com/tr3ylbry/TowerDefense.git`. No open GitHub issues were returned during the initial review. The original source/assets/project files and historic README are compared to the preserved school history at delivery.

## Rule checks

`npm run check` runs all 151 Vitest cases, strict TypeScript and the production build. All 102 prior rule cases remain. The 49 added cases cover six mission definitions, deterministic seeded schedules, invalid content, ready-only selection/restart, shield rating bounds, initial/final unlocks, complete chapter wins, duplicate completion, replay/loss behavior, isolated save/load/reset, corrupt JSON, partial recovery, metadata recovery, unsupported versions, bad IDs/stars, read/write/backup/delete failures and another tab's valid/incompatible writes.

`node scripts/research/campaign-0.6.cjs` checks original exports and 36 original schedules against git-frozen 0.5, then complete stepwise public-action/event parity. It also records all 540 new mission policy runs and reconciles each ledger. See source hashes and the raw research files. These are deterministic regressions rather than human feedback.

## Browser checks

All 33 retained scenarios plus nine new cases are preserved: 42 per engine, 126 across Chromium/Firefox/WebKit. New coverage includes:

- Six discoverable cards, disabled locks and explicit reasons, native keyboard review/back/start, focus and first deployment.
- Six real consecutive campaign wins with earned credits, complete winning ledgers, actual shield-based ratings, next actions, same-environment asset reuse, 18-star persistence, reload and a lost replay without losing the best rating.
- Enlarged phone victory and next-mission navigation inside that public-control playthrough; collapsed outcome replay/next/return reachability in both phone orientations before opening the ledger.
- Explicit active-mission abandonment copy, cancel/back preserving deployment, modal swaps and backgrounding with no automatic resume.
- Reset cancellation, safe initial focus, confirmed deletion of only campaign keys, preserved motion/unrelated data and updated result display after reset.
- Unavailable storage without a crash or blocked play; partly damaged saves retain valid stars and their raw original.
- Failed other-environment preparation retains the current campaign, cancellation/retry and backgrounded transitions.
- Portrait 390×844 and landscape 844×390, 150% CSS content enlargement, campaign dialog frame containment/scrolling, accessible locked cards, briefing, reset and preparation.

Local Chromium runs completed the six-mission chain. The first full retained/new run had two checks reset by hot reloading while development files changed; both subsequently passed on unchanged sources. A repeated portrait timeout was investigated rather than dismissed: the Chromium dialog could extend from −196 to 1040 pixels in an 844-pixel viewport. A scroll request could not bring Reset into the screen. Percent-based height constraints fix it; a native-frame-in-viewport assertion now protects both phone orientations. Minimum touch-target checks use thresholds, not a font-specific exact height. No forced click or weakened functional assertion was used.

A subsequent outcome reset check reproduced stale Best 3/3 text after the save had correctly been deleted. Clearing the UI render cache on reset makes the existing result reflect Best 0/3 while preserving the completion-attempt guard. Save reset does not create a second reward or clear settings.

The final collapsed-result check reproduced buttons outside a 222-pixel phone battlefield while the overlay had visible overflow and its parent clipped it. Campaign results now own an automatic scroll frame in both economy-disclosure states. Chromium and Linux Firefox/WebKit real-defeat tests verify collapsed replay/return reachability, then actual return, reset and updated best rating. The full winning campaign adds closed-ledger replay/next/return checks in portrait and landscape before its existing enlarged-phone Next check. This changes campaign presentation only.

Linux repeat checks use the existing official Playwright 1.64.1 Noble image plus the already documented DejaVu font layer (`ava-expedition05-fonts`). Read-only test copies and disposable diagnostics live under `/private/tmp/ava-linux-06`; the protected Documents directory is not mounted into Docker. One browser worker is used, with no relaxed security switches. Final exact-commit GitHub Actions checks are the complete three-engine evidence; the delivery message links their results/counts rather than treating a pending run as success.

A separate local six-win rerun completed its assertions but its trace teardown collided with another command cleaning the same default diagnostics directory. It is not counted as a clean suite pass. Subsequent concurrent probes use isolated output paths; CI jobs have separate workspaces.

The workflow still runs `npm ci`, `npm run check`, installs the selected engine and executes every browser scenario. Its budget is 30 minutes per engine, increased from 15 for a genuine six-mission playthrough; CI still uses one worker. No baseline case, assertion or engine was dropped.

## Native Safari

A native app surface became usable during this milestone. Safari 27.0.1, bundle 22625.1.29.11.28, opened the production preview in a new test tab. Actual native accessibility actions verified the campaign board and locked reasons, focused briefing, prepare, Begin, Return-key Astro placement, P pause, Original/Expedition artwork while paused, and return to Mission control with deployment preserved. Screenshots show the native Safari window. The test tab was closed afterwards; unrelated tabs were not used as evidence.

This is a focused desktop smoke check. It does not establish the complete six-mission/failure matrix on native Safari, iPhone behavior or a screen-reader session. Desktop WebKit automation remains separately labeled.

## External limits

Zero independent first-time sessions. The same five P01–P05 CSV rows remain pending. No real phone/touch, device text enlargement, thermal/low-memory or screen-reader session was supplied. CSS zoom is repeatable layout stress, not a native OS text-size test. No participants, opinions or physical-device evidence are inferred from scripted results. The existing kit is extended with optional campaign observations, not replaced by a duplicate protocol.

Art provenance/permission for retained school comparison/projectiles remains a public-release concern. Hosting and the Treydmark website are unchanged. Save concurrency is best effort, local-only and not an anti-cheat or account-backup system.

The earlier complete matrix at `0910a504d252411c452645faad50b128819b2695` passed 42/42 per engine: [run 41262354745](https://github.com/tr3ylbry/TowerDefense/actions/runs/41262354745). It predates the final result-display/scroll corrections. The final exact-revision matrix is checked separately at delivery; earlier success is not presented as that final run.
