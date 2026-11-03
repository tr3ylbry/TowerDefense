# Remaining human and device validation

These checks are external validation, not substitutes for the automated matrix. The existing [five-player kit](../../../playtest/README.md) still has **0/5 independent first-time sessions**. Owner development play is useful feedback but is not an independent participant.

## Genuine owner evidence

The owner tested an iPhone 17 in Safari. Earlier feedback established working gameplay, audible music, independent sliders and acceptable 65% channel balance. During 1.1 the owner listened to the new native-buffer transport and reported **“the loop seems smooth now”**, then reported intermittently unresponsive FX/Music toggles. Those are genuine observations, not agent-accessible physical-device measurements.

The subsequent FX state/recovery and idle-clock fixes passed production Chromium/WebKit checks. The owner then reported that the buttons worked functionally and identified a sticky seafoam highlight after switching off. The subsequent state-only highlight fix passed pointer/touch tests. In the latest iPhone Safari reply the owner confirmed “buttons look good, the color toggles now,” then requested left alignment of the controls row. This confirms the centered actions and active/inactive colors before that final toolbar alignment change; it does not establish final interruption, route, long-session or frame-time results. Do not treat the earlier listening pass as confirmation of later UI changes. Native macOS Safari evidence in `native-checks.json` also states its source boundary.

## Short final iPhone/Safari checklist

Refresh the current local preview on the same Wi-Fi. No public hosting is required.

1. Start a mission; enable FX and Music separately. Toggle each several times. The latest tap should win, with no overlapping music or stale enabled label. Listen across two 15-second boundaries.
2. Open Mix during play: simulation pauses. Change each slider, including zero; only that channel changes. Escape/Done returns focus and resumes only a mission Mix paused. Repeat while already paused.
3. Briefly leave Safari and return. The mission stays paused. Music offers Resume; FX offers Resume if its audio output was interrupted. Resume each deliberately. Check a phone call/audio-route interruption if convenient.
4. In portrait and landscape, select all nine crew cards in both art styles, inspect Unit Stats, dismiss it and deploy. Original sprites should remain centered inside lane cells. Verify Overview, Enlarge/panning and Salvage/refund without clipped actions.
5. Try enlarged text, a result/economy terminal, campaign navigation and a restart cancellation. Note device/browser version, orientation, any clipping, and the exact sequence before a failure.
6. Play a longer session and report heat, stutter, audio recovery and touch accuracy. Desktop throttling does not establish phone FPS or memory behavior. Android remains untested on hardware.

## Live assistive technology

Still pending: a real game-navigation session with VoiceOver, NVDA or TalkBack. Starting VoiceOver and hearing Codex instructions does not validate game speech. Verify navigation landmarks, crew selection, grid coordinates/placement, shield and credit announcements, pause, wave calling, Unit Stats, Mix labels/values, campaign/result navigation and reset confirmation. Confirm focus and announcement timing with the actual spoken output; automated accessible-name checks alone are insufficient.

Treydmark publication/hosting and asset-permission decisions remain separate workstreams. No participants, hardware access, spoken-output results or permissions have been invented.
