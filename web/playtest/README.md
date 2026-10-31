# Expedition 0.4 independent playtest kit

Status: ready for recruitment; **zero completed independent sessions**. Do not count agent/browser runs as participants. Target five first-time players, preferably two on real phones. No feedback or participant identity is pre-filled.

## Player setup

Use the same recorded modernization commit. On a computer with Node22.12+ installed, open the repository's `web` folder, run `npm ci`, then `npm run dev`, and open the printed Local URL. No accounts or API keys are needed. Keep hosting/publication separate. For a physical phone, use a deliberately arranged trusted local-network preview or a separately approved hosted game; localhost on the phone does not refer to the developer's computer.

Start fresh on Canyon, normal artwork/motion, sound off, 1× speed. Do not read the observer guide before playing. The only initial instruction is: “Try this game as if you found it online. Say what you are thinking.”

## Observer guide (15–20 minutes)

Use [the protocol](../docs/PLAYTEST_PROTOCOL.md) and [results-template.csv](results-template.csv). Get consent before recording; use anonymous P01–P05 IDs. Record actual words and actions separately from interpretations. Do not coach counters or spending before the player encounters them.

1. Ask the objective; time first successful deployment from the usable Begin control.
2. Observe chosen units, cost/income understanding, placement errors, and whether firing direction is noticed.
3. At the first Tank, ask what differs and which response the player chooses.
4. Ask what Call next wave will do before use; capture reward, overlap, and preparation understanding.
5. Let them finish/fail/restart. Record confusion, frustration, boredom/overload, difficulty, and mission timestamps.
6. After the unassisted opening, use a separate short direction task: start fresh, wait until a Scout crosses a tile, then ask the player to place a gun to its right. Observe whether the warning explains why it cannot directly hit that Scout and whether they find an effective left-side tile. Do not require deliberately losing shields. Label this prompted task separately from unassisted behavior.
7. Try Nest; ask what the paired relay briefing suggests. Observe reserve spending, splash/barrier choices, adaptation between lane groups, and whether another mission sounds appealing.
8. On phones, test crew scrolling, the far field, overview/enlarge, panning, landscape, warning reachability, and restart. Record actual hardware versus emulation.

Every blank result stays pending. Five sessions can identify recurring usability issues; they are not a population win-rate or enjoyment estimate. Preserve supplied notes verbatim in a consented, nonpublic location; do not commit personal recordings or names. Summarize anonymous findings in a future milestone before broad balance changes.
