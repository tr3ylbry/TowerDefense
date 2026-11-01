# Visual and native-browser observations

Date: November 1, 2026 (America/Phoenix). Agent-controlled sessions, not independent playtests. Screenshots support visual review; functional evidence comes from the actions/assertions described below and the retained browser tests.

- `baseline-campaign-mode.png`: unmodified 0.6 (`1d50373`) after Campaign → First Contact → Prepare → Begin → one Astro placement → Pause → leave Focus. The header incorrectly says Standalone while mission context says Campaign.
- `opening-modes.png`: 0.7 opening Standalone with explicit no-stars explanation and Campaign entry; no saved progress or fabricated victory.
- `native-safari-victory.png`: native Safari 27.0.1 (22625.1.29.11.28), actual public-control First Contact victory. Two Bushes, six Astros, six TARS, earned credits, 2× presentation. All three shields; 33 kills; 14 purchases, zero losses, 1,020 spent, 1,395 balance. The expanded signed receipt reconciles exactly. No fixture or simulation override.
- `native-safari-reload.png`: same native browser after following the named next mission, then reloading and opening Campaign. One actual completion / three stars persist, mission 2 is available, maximum-rating replay copy invites a formation experiment.

Native keyboard/AX checks also covered briefing focus, arrows/Enter/number selection/P, dynamic credit names (absent from the baseline tree), actual blank-tab absence and manual resume, Original/Expedition switching while paused without deployment loss, reset confirmation default Keep progress/Escape cancellation, and return to ready Standalone Sky Bridge. The test-created Safari tab was closed; the preexisting Apple tab was retained. In-progress missions intentionally do not survive reload.

An initial native deployment was reset by a development hot reload while applying the discovered credit-name fix. It is not counted as a completed lifecycle. The final native victory used the fixed implementation from a fresh preparation. Automated browser assertions use clean sessions and no app edits during the final full suites.

This is native desktop Safari pointer/keyboard evidence. It is not iOS Safari, physical-phone touch, a live screen reader, human enjoyment, or a native six-mission sweep. No private browser content or participant information is included.

`chromium/` contains the passing actual six-mission public-control journey's six victory receipts, 18-star board and phone result, plus the new 150% CSS-zoom opening and real defeat screenshots. These are agent-controlled earned-credit wins, not participants. The existing test verifies every transition, ledger, saved star, reload and lost replay. The 150% capture includes a focused Skip to mission link; this is a keyboard focus indicator, not a screenshot layout alteration.

`webkit/` contains the passing WebKit six-mission journey’s 18-star board and phone result. Both complete local suites passed, 94/94 total, including the earned-credit six-win flows and lost replays. WebKit remains distinct from the native Safari session above.
