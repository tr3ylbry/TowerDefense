# Expedition-only candidate handoff

The current candidate is **RC.2**; the armor-piercing robot is **Augie** (the stable internal key is unchanged). Record the exact candidate revision from its build metadata, rather than reusing an rc.1 result.

Use the existing [five-player kit](README.md), [protocol](../docs/PLAYTEST_PROTOCOL.md) and [anonymous results template](results-template.csv). All five independent P01–P05 sessions remain pending. Owner development play and automated runs do not fill a participant row.

## Ready-to-send invitation (owner sends only after arranging authorized access)

“Would you try a small browser strategy game for 15–20 minutes? You do not need experience. Start as if you found it online and say what you are thinking; the first few minutes are unassisted. Then we may try a few short controls/tasks. No account or personal information is needed. Participation is optional, and you may stop at any time. We will keep anonymous notes; recording requires your separate consent.”

**Access:** there is no approved public test URL. The owner can share a deliberately arranged trusted local-network preview of the exact candidate or arrange separately approved hosting. On the development computer: `npm ci`, `npm run build:release`, `npm run preview:release`. For a phone on trusted Wi-Fi, explicitly bind the preview to the local network and use the computer's current LAN address; phone localhost is not the computer. Do not reuse an old address or claim it is a permanent link. Record the candidate revision from `build-info.json`. Do not send the invitation or distribute the build automatically.

After the unassisted opening, invite a defender purchase/placement, Unit Stats (including Augie’s armor-piercing role), Salvage, pause/resume, an early-wave call, and an outcome/mission-economy inspection. If time permits, ask them to explore Campaign and optional First Contact Hard; record any task not reached. Do not erase existing progress without consent. Ask: What were you trying to do? What felt unclear or frustrating? What would make you want another mission? Use the existing protocol for prompted versus unprompted observations and timing.

Record anonymous P01–P05 notes/actual words separately from interpretations, plus revision, hardware/browser, cache, motion/audio settings and tasks actually reached. Do not commit names, contact details, recordings or identifying browser data. Obtain explicit consent before recording and agree who can access it and when it will be deleted.

## Short real-phone recheck

On the owner's iPhone 17/Safari (and another real phone if available), record exact iOS/browser version and candidate revision. Check portrait/landscape safe-area fit, real touch placement in far lanes, Enlarge/pan/Overview, crew scrolling and all names, Unit Stats and Salvage, centered dialogs and left aligned controls. Check text enlargement without clipping essential actions. Enable FX/Music separately, move both sliders including zero, open/close Mix from playing and prepaused states. Listen through two 15-second loop boundaries, switch apps/lock/unlock or accept a real audio interruption, then explicitly resume. Play an extended session with restart/destination/reload and note heat, stutter, battery and lost input. Emulation does not mark this complete.

## Focused live screen-reader recheck

Use actual VoiceOver+Safari, NVDA+Firefox/Chrome, or TalkBack+Chrome and record which combination was really tested. Listen to Campaign cards/lock reasons/briefings, defender name/price/selected state, grid row/column/occupied/blocked labels and placement results. Verify credits and shields are discoverable without disruptive continuous chatter; listen to real threat/breach/wave-call announcements and pause/resume state. Reach results/ratings/economy, save warnings and reset confirmation. Check focus after closing dialogs and keyboard/touch exploration. Note speech actually heard, duplicates, omissions and navigation barriers. Semantic/keyboard automation does not establish spoken output quality or fully nonvisual game usability.
