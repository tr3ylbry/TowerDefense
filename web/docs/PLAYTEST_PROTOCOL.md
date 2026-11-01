# First-time Expedition playtest protocol

## Status and recruitment

No independent sessions were completed during Expeditions 0.3–0.6. Agent-driven browser sessions and deterministic policies are engineering evidence, not human feedback. Target five independent first-time players, with at least two using a physical phone if available. Obtain consent before recording; use anonymous session IDs and avoid collecting personal data. A session may proceed without a recording if the player prefers observer notes.

## Conditions

Use the same verified production build and record commit, browser, viewport/device, input type, art style, motion preference, whether audio is enabled, and cold/warm/unknown asset-cache conditions. Use [the existing kit](../playtest/README.md) for setup. Start a fresh page on Canyon with default credits, Expedition art, sound off, 1× speed, and the player's motion preference. No prior instruction beyond “Try this game as if you found it online. Say what you are thinking.” Allow the player to choose controls and pacing. Do not explain counters, income, firing direction, or wave calls before they encounter them. Record any later preference, speed, art, or sound changes.

Observe first, then ask. A question directing attention to a unit or control is a prompt even when it does not explain the answer. Mark observations `unprompted`, `after question`, or `after instruction`; record the words or assistance used. If a task is not reached within 15–20 minutes, write `not observed` and why. Do not extend or coach the mission merely to obtain every field.

## Session (15–20 minutes)

1. Ask “What do you think your objective is?” Record their answer verbatim.
2. After the objective question, invite them to continue. Start the deployment timer when the player activates Begin mission and stop when the first defender is actually placed. Record seconds, selected defender, placement errors, help required, and whether they discover the crew cards or keyboard. Startup readiness is a separate observation; do not include downloads or the observer's opening question in deployment time. If they never deploy, record `not completed` rather than a made-up duration.
3. Observe opening spending. Ask after the decision “What made you buy that?” Record which income units they notice and what they expect them to do. Do not treat a particular strategy as correct.
4. At the first Tank encounter, first observe their chosen response. Then ask “What seems different about this enemy?” Record the unprompted behavior separately from the prompted answer and whether information comes from the field, warnings, unit details, or guide.
5. Note whether Call next wave is discovered or used without prompting. Before a prompted use, ask “What would happen if you used that?” Record understanding of credits, the three-second lead, surviving enemies, and future schedule shift before they click. Do not count the question as spontaneous discovery.
6. Let them finish or fail. Note pauses, replacements, salvage, losses, confusion, long idle periods, and self-reported boring or overwhelming moments. Record the mission time of each observation.
7. At an actual victory or defeat, ask how many credits remain and why. Observe whether they find Mission economy themselves; if needed, prompt them to open it and label that assistance. Ask them to explain one income entry, purchases, and the ending balance in their own words. Check scrolling and Play again reachability on the device; record actual actions rather than whether the observer thinks the panel looks clear.
8. Ask whether they want another mission and why before directing them to one. If they continue, invite a restart or another destination. On a phone, ask them to inspect the far-right field and find the ninth, flagship defender without explaining scrolling/zoom. Since Expedition 0.5 the browser uses Frontier Flagship for the public-facing replacement of the historical Millennium Falcon; record the actual label and art style from the tested commit. Observe panning, targeting mistakes, warnings, landscape layout, and reachability.
9. Ask for the most confusing moment and their favorite decision. Avoid leading questions about the new features. Optional direction/Nest tasks below come after these unassisted observations and replay-interest questions.

## Session record

| Field                                                            | Record |
| ---------------------------------------------------------------- | ------ |
| Anonymous ID / verified commit / date                            |        |
| Browser / physical device or emulation / viewport / input        |        |
| Art / motion / audio / cache / startup problem or wait           |        |
| Objective understood without help                                |        |
| Time to first successful deployment / errors / hints required    |        |
| Credits, passive supply, Bush/Tree explanation in player's words |        |
| First Tank / chosen response / armor understanding               |        |
| Wave-call prediction / actual decision / reason                  |        |
| Defender selections and reasons                                  |        |
| Boring, overwhelming, or confusing moments with timestamps       |        |
| Victory/defeat, shields, duration, and outcome comprehension     |        |
| Economy disclosure discovery / signed entries / ending balance   |        |
| Phone scroll / zoom / pan / far-cell targeting / landscape       |        |
| Wants another mission? Why?                                      |        |
| Observer assistance and any recording consent                    |        |

The existing CSV remains the shared summary. Use `open_comments` for session conditions, outcome/ledger observations, or task-not-reached notes that lack a dedicated column. Preserve fuller anonymous observation notes using the table above; never replace a missing human result with an agent result. The five template rows remain pending until real sessions occur.

## Synthesis

Keep observations separate from interpretations. Report each issue's frequency out of completed sessions, severity (blocked, costly/repeated confusion, minor friction), and concrete evidence. Five sessions can find usability problems; they do not establish population win rates or statistical enjoyment claims. Retest fixes with new players when possible. Do not silently merge agent runs into participant counts.

## Optional prompted direction and Nest tasks

Use the [ready-to-use kit and blank results sheet](../playtest/README.md). For the direction task, start fresh, wait for a Scout to cross an empty tile, then ask the player to place a gun to its right. Observe whether the warning explains why it cannot directly hit that Scout and whether they find an effective empty tile to the left. Do not require deliberately losing shields. Keep this prompted task separate from natural play and do not count successful instructed recovery as spontaneous understanding.

On Nest, record understanding of the late paired lane relay, reserve spending, and whether splash/barrier choices feel useful. Ask about the actual visible briefing, without telling the player the preferred tactic. If waves 3–4 are not reached, record that limitation. These tasks extend the existing protocol; they do not create more participants. No independent sessions have been completed or invented.

## Optional prompted campaign task

After the unassisted opening and replay-interest question, use task 10 in the existing kit. Record discovery, briefing comprehension, locked-state explanation, shield-to-star explanation, and expectations about local-only progress in `open_comments` with prompts identified. Observe actual next/reload behavior only if a genuine win occurs. A later mission not reached in the time limit is not a failed player. No additional participant sheet, invented completions or separate protocol is needed.
