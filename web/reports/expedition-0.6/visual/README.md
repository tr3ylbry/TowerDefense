# Campaign visual evidence

These are actual application captures. The six mission victories and chapter-complete board come from public controls, real elapsed gameplay and earned credits in the Chromium six-win campaign scenario. Progress was earned sequentially, persisted/reloaded, and survived a lost replay. No injected victory state or fake balance was used. The first desktop sequence was captured before the later enlarged-dialog and reset-display fixes; those patches do not redesign the captured desktop views and have separate regressions. These are not pixel-matched comparisons or human playtest observations.

| Capture                                                                                                   | Context                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [First Contact](first-contact-victory.png)                                                                | Original Canyon schedule, campaign completion and ledger                                 |
| [Canyon Escalation](canyon-escalation-victory.png)                                                        | New runner/pincer mission won                                                            |
| [Broken Ground](broken-ground-victory.png)                                                                | Original Bridge schedule won                                                             |
| [Bridge Under Siege](bridge-under-siege-victory.png)                                                      | New paired siege mission won                                                             |
| [Into the Nest](into-the-nest-victory.png)                                                                | Original Nest relays won                                                                 |
| [Heart of the Swarm](heart-of-the-swarm-victory.png)                                                      | New three-stage finale won                                                               |
| [Chapter complete](chapter-complete-board.png)                                                            | Six actual completions and eighteen earned stars                                         |
| [Portrait Firefox](campaign-phone-portrait-firefox.png) / [WebKit](campaign-phone-portrait-webkit.png)    | Linux CI-like DejaVu fonts, 390×844, 150% CSS content enlargement, empty progress        |
| [Landscape Firefox](campaign-phone-landscape-firefox.png) / [WebKit](campaign-phone-landscape-webkit.png) | 844×390, same enlarged-content stress and corrected contained dialog                     |
| [Native Safari board](native-safari-board.png)                                                            | Safari 27.0.1 actual app window, empty campaign progress                                 |
| [Native Safari paused comparison](native-safari-paused-original.png)                                      | One Astro deployed using Return, P paused, school comparison selected without restarting |

[Collapsed phone result](campaign-phone-collapsed-defeat.png) shows an actual undefended campaign defeat with replay/return inside the scrollable field before opening economy. A validated test save supplies the prior best rating solely for the reset regression; those stars are not claimed as earned in this capture.

The portable browser cases also capture enlarged-phone victory/Next navigation. Browser output folders are disposable test diagnostics. The repository captures above document the final appearance without claiming physical-phone or screen-reader coverage. Native desktop Safari is separate from WebKit automation; no iPhone, OS mobile text-size or real touch session is implied. The existing five independent participant records remain blank/pending.
