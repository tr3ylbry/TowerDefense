# Preserved gameplay and Hard reassessment

[Normal study](normal/summary.json):1,296 runs (six missions×six policies×three call modes×12 seeds3352019–3352030), every previously reported0.9 outcome/economy/research field matches exactly. [Frozen standalone parity](normal/original-parity.json):36 runs, all three original maps, original0.5 baseline `5647f09b44520af8a0d7382b3532ac2c8362c914`, same definitions/spawns and per-step snapshots/events/actions. The established public APIs exercise earned-credit actions, early calls, pause, speed and restart. [Reproduction](../../../scripts/research/campaign-1.0.cjs).

[Hard reassessment](hard.json):432 exact matches against0.9 (216 Normal+216 selected Hard), including shields, duration, purchases/replacements, income/spending, calls, actual threat-seconds, overlap and bounded policy timeouts. [Reproduction](../../../scripts/research/challenges-1.0.cjs). No new candidate is proposed, so the four rejected0.9 variants are not needlessly rerun or exposed as extra tiers.

| First Contact | Wins | Lost | Policy timeouts | Mean overlap | Mean peak live enemies |
| ------------- | ---: | ---: | --------------: | -----------: | ---------------------: |
| Normal        |  210 |    5 |               1 |       12.53s |                   6.72 |
| Hard          |  175 |   40 |               1 |       24.64s |                   9.77 |

Hard keeps230 starting credits, three shields, the original first wave, existing unit stats and wave starts. More later Sprinters/Tanks plus six-lane relays and+5s reinforcements increase pressure. Opening options still include four50-credit Astro Joes with30 left, or six35-credit barriers with20 left. Economy, armor and mixed policies win36/36 each; reactive35/36 and splash32/36. Ordinary-fire-only cheap loses36/36, supporting a clearer briefing about plating counters. TARS is not uniquely required. Aggressive calls increase overlap and leave existing threats on the field; the visible reward/risk explanation remains accurate.

Implemented refinement: the Hard relay briefing explicitly says ordinary fire is resisted, TARS ignores plating and plasma/shells partly pierce it. No schedules, rewards, health, damage, resources or save rules change. Hard remains First Contact-only, opt-in, distinct from speed; mission review defaults to Normal, restart retains Hard, leaving/changing missions clears it. Existing public-win/loss and completion-recorder tests retain Normal records and prevent Hard stars/unlocks.

One fixed Hard splash/clear-field policy still reaches its600s bound with a passed Tank. Retained as a policy timeout, not removed from win rates or declared an unavoidable player softlock. The existing salvage/breach recovery guidance remains. Synthetic outcomes cannot establish fairness, enjoyment, pacing preference or visual readability. Independent first-time players remain0/5; developer Canyon comments are prior developer observations. Broader Hard support is not recommended before actual players show interest and understand its counters/risk.
