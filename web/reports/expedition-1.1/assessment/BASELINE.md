# Frozen baseline and priorities

Before implementation: clean `modernization`, HEAD `b0ece92e4284ccb9919e5368cd18049a4d76a251`, sole origin `https://github.com/tr3ylbry/TowerDefense.git`. The web tree was archived to a separate temporary directory and its freshly built production output served at port4174. Baseline `npm run check`:216 rules, strict TypeScript and production build passed. Three existing production phone/audio checks passed in installed Chrome. The historical complete [1.0 matrix](https://github.com/tr3ylbry/TowerDefense/actions/runs/41521819693) is baseline evidence, not 1.1 validation.

The one-sample pre-edit probe retained here found1,123,743B imagery,1,540,208B transfer including navigation,21 unique images and8,684.8ms constrained readiness. It is an initial sanity check; the matched alternating three-sample experiment is authoritative for before/after comparisons.

| Category | Finding / decision | Priority and risk |
| --- | --- | --- |
| Performance inefficiency | Nine384px defender derivatives total332,370B for34×35 card portraits and67–96px battlefield widths. Test192px derivatives using the same quality 90 and preserved PNG sources. | High; low architecture risk; review alpha, grounding and rendered detail. |
| Performance investigation | All six atlases cost699,038B. The175,992B static cutouts were **already removed from initial loading in1.0**. Test crop/repack alternatives; do not count that old saving again. | High; reject changes without worthwhile gains. All missions need all six sheets before Begin. |
| Confirmed interaction defect | Same-turn Mix close/reopen loses the running mission's resume ownership on frozen 1.0. | Medium; settle close ownership synchronously and ignore departing dialogs' queued events. |
| Confirmed audio edge | Failed FX activation leaves its internal enabled flag set if the context stays unavailable; later OS recovery can produce cues behind an off label. | Medium; make failed activation remain off until another gesture. |
| Audio reliability risk | Native media pause events are asynchronous; a canceled-start pause must not mislabel a newer active play. | Medium; check current media state; exercise pending cancellation/retry with the real player. |
| Visual/usability | Existing three-case baseline phone check passes navigation, all 9 cards, stats and mixer. No evidence for a redesign. | Preserve design; recheck final source and wider font metrics. |
| Accessibility / device gap | Final native Safari, iPhone17, live game screen-reader speech, long physical-device performance and five first-time players are unavailable as agent evidence. | External checks remain pending; emulation is labeled. |
| Publication rights |67 retained raster derivatives lack asset-specific redistribution evidence. Unused public files are still copied to dist. | Public-release blocker; inventory actual output and recommend options without removing comparison. |

Plan: right-size only justified assets; retain the six atlas bytes/poses unless an experiment warrants a change; fix proven lifecycle edges; verify the production game and full three-engine suite; document delivery, permissions, security, performance and final-head CI separately. No new game systems, balance, hosting or dependencies.


## Confirmed during final interaction review

Compact320×568 layout at150% CSS zoom/wider font metrics exposed offscreen keyboard-selected cards and Field Guide text overflow; targeted scrolling/wrapping fixes retain all content. The owner reported a repetition gap in the15-second music and later confirmed the sample-clock loop sounded smooth. A subsequent report of intermittent toggles led to truthful FX interruption states, latest-intent guards and an idle-audio-clock gain/throttle correction reproduced in WebKit. The owner then confirmed functional toggles and reported sticky enabled coloring: shared hover/pressed styling was corrected with separate state, busy and keyboard-focus visuals. Follow-up screenshots also justified centered dialog action groups/close icons and consistent header capitalization. Each source stage is distinguished in the verification/device evidence.
