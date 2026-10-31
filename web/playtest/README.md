# Expedition 0.5 independent playtest kit

Status: ready for recruitment; **zero completed independent sessions**. Do not count agent/browser runs as participants. Target five first-time players, preferably two on real phones. No feedback or participant identity is pre-filled.

## Player setup

Use the same recorded, verified modernization commit for all five sessions. On a computer with Node 22.12+ installed, open the repository's `web` folder, run `npm ci`, `npm run build`, then `npm run preview`, and open the printed Local URL. This uses the production build rather than development downloads. No accounts or API keys are needed. Keep hosting/publication separate. For a physical phone, use a deliberately arranged trusted local-network preview or a separately approved hosted game; localhost on the phone does not refer to the developer's computer.

Start fresh on Canyon, Expedition artwork, sound off, 1× speed. Respect the player's system motion preference; record it and any saved override. Close unrelated tabs or apps only with the player's agreement. Record whether the game was already cached, and note any loading problem separately from deployment time. Do not read the observer guide before playing. The only initial instruction is: “Try this game as if you found it online. Say what you are thinking.”

## Observer guide (15–20 minutes)

Use [the protocol](../docs/PLAYTEST_PROTOCOL.md) and [results-template.csv](results-template.csv). Get consent before recording; use anonymous P01–P05 IDs. Record actual words and actions separately from interpretations. Do not coach counters or spending before the player encounters them.

1. Ask the objective before timing. Then invite the player to continue. Time first successful deployment from their activation of Begin mission; include any later help or mistakes and record these separately. Do not count startup download time in this number.
2. Observe chosen units, cost/income understanding, placement errors, and whether firing direction is noticed.
3. First observe the player's unprompted response to a Tank; then ask what differs and which response they choose. Mark that question as a prompt.
4. First note whether they discover Call next wave themselves. Before a prompted use, ask what it will do; capture reward, overlap, and preparation understanding. Record unprompted discovery separately from the answer after asking.
5. Let them finish/fail/restart. Record confusion, frustration, boredom/overload, difficulty, and mission timestamps.
6. After the unassisted opening, use a separate short direction task: start fresh, wait until a Scout crosses a tile, then ask the player to place a gun to its right. Observe whether the warning explains why it cannot directly hit that Scout and whether they find an effective left-side tile. Do not require deliberately losing shields. Label this prompted task separately from unassisted behavior.
7. Invite another destination without naming a preferred one; record the choice and replay interest first. If time allows, use a separate prompted Nest task to inspect its paired relay briefing. Observe reserve spending, splash/barrier choices, and adaptation between lane groups. Lack of time or insufficient progress is “not observed,” not failed comprehension.
8. On phones, test crew scrolling, the far field, overview/enlarge, panning, landscape, warning reachability, and restart. Ask the player to find the ninth, flagship defender without describing how to scroll. In Expedition 0.5 the public-facing replacement is Frontier Flagship; older comparison captures/documentation call this unit Millennium Falcon. Record the actual visible label and artwork from the tested commit. Record actual hardware versus emulation.
9. At an actual mission outcome, ask the player to explain the ending credits and find the mission economy breakdown before suggesting its location. Note whether signed entries, defender income, purchases, and the ending balance make sense. Do not require a full victory to inspect the ledger; a normal defeat also produces it.

Use the existing CSV's `open_comments` field for build conditions not represented by dedicated columns: `art=…; motion=…; audio=…; cache=cold/warm/unknown; load_issue=…; outcome=…; shields=…; mission_duration=…; ledger=…`. Keep each person's detailed notes separate using the session-record table in the protocol. No extra tracker or account is required.

Every blank result stays pending. Five sessions can identify recurring usability issues; they are not a population win-rate or enjoyment estimate. Preserve supplied notes verbatim in a consented, nonpublic location; do not commit personal recordings or names. Summarize anonymous findings in a future milestone before broad balance changes.
