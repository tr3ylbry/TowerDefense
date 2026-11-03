# Expedition 1.1 — Performance, UX and release-candidate hardening

## Outcome and baseline

This milestone consolidates the existing game: smaller defender delivery, reliable dialog/audio lifecycles, a continuous music loop, truthful toggle highlighting and two narrow-layout corrections. There are no new missions, combat systems, difficulty tiers, dependencies or save migrations.

The clean starting revision was `b0ece92e4284ccb9919e5368cd18049a4d76a251` on `modernization`. Its web tree and fresh production build were frozen separately before edits. The baseline passed 216 rules, strict TypeScript and production build; its [complete prior CI run](https://github.com/tr3ylbry/TowerDefense/actions/runs/41521819693) belongs to 1.0. [Baseline findings](../reports/expedition-1.1/assessment/BASELINE.md) distinguish confirmed defects, optimization opportunities and external gaps.

## Loading and asset decisions

All missions can spawn all six aliens. Their six required atlases therefore remain in the initial transaction: **699,038 bytes and 248 poses**, unchanged from 1.0. Deferring them would add combat-readiness complexity. Crop/repack experiments preserved every pose but cropping increased aggregate bytes; the best per-kind repack saved only about 2.6 KB. Lossless encoding was larger. Those changes were rejected rather than degrading articulation or complicating metadata.

The nine defender images were oversized for their 34×35px card portraits and 67–96px world widths. Rebuilding proportional 192px derivatives from preserved PNGs, at the same quality 90, reduced their combined size **332,370 → 125,742 bytes**. Runtime geometry/foot anchors come from generated metadata. Decoded alpha matches the resampled source; both dimensions retain at least twice the world resolution. [Manifest](../art-source/expedition-1.1/defender-delivery.json) and [rebuild script](../scripts/prepare-delivery-1.1.py) retain source/output/script hashes and prior records.

Initial imagery is now **917,115 bytes**, a **206,628-byte / 18.4% reduction**. It comprises six atlases (699,038), nine defenders (125,742), selected Canyon scenery (87,406), and five retained projectiles (4,929). Static alien portraits load only with Field Guide; other scenery, acid, Original sheets and mission previews remain selected/on demand. Music is deferred until a gesture. The 175,992-byte static battlefield preload saving was already implemented in 1.0 and is not claimed again.

## Matched performance

The [performance report](../reports/expedition-1.1/performance/README.md) contains the final table, raw samples, source hashes and limitations. Measurements alternate fresh production contexts against frozen 1.0, with three samples per build/condition. Constrained mode retains 4× CPU, 150ms latency, 200,000 B/s download and 75,000 B/s upload. Readiness means the actual enabled Begin mission control; transfer includes navigation.

The improvement is principally image transfer/startup. All six alien atlas bytes and pose selection are unchanged; no rendering speedup is claimed. The 900,000-byte image target remains exceeded by **17,115 bytes (1.9%)**, an explicit residual budget exception. The earlier 6.65-second loading result is historical context, not this matched baseline.

The 50-sprite, all-six-kind production fixture retains 51 display objects/10 textures and a 16.7ms median interval in three serial runs per build. A separate actual Heart of the Swarm recording uses earned-credit barriers, real spawns and public wave calls, reaching roughly 50 live enemies. Whole-app intervals, decode/parse measurements, repeated mission/style transitions and ten restarts are recorded separately. Texture handles plateau after warmup, with one canvas and no observed errors; those counts and uncontrolled heap samples do not prove reduced memory use or absence of leaks. Phone FPS, heat and long-session behavior remain unmeasured.

## Interface, mobile and accessibility corrections

- Mix now owns its pause synchronously, including rapid close/reopen and native Escape. It resumes only the present running mission it paused. Prepaused, backgrounded, completed or replaced missions cannot be resumed by a stale close event. Focus returns to Mix.
- Number-key crew selection scrolls its card vertically and horizontally into view. Pointer selection keeps the existing behavior.
- Field Guide entries wrap safely at compact widths with 150% CSS zoom and wider Verdana font metrics. Content and controls remain available.
- Dialog action groups are centered consistently in destinations, Field Guide, Credits, restart/reset/recovery and campaign navigation. Close glyphs are centered in 44px targets. Header labels use consistent capitalization, including dynamic on/off/art states.
- Seafoam tool highlighting follows `aria-pressed`, with amber while busy. Hover cannot impersonate an enabled toggle or stay highlighted after a touch disables it. Enlarge also has a visible enabled state. Keyboard focus retains its separate outline; existing Salvage/crew/destination selection indicators remain.

Desktop, tablet, compact portrait, landscape, enlarged text, keyboard, touch targets, Overview/panning, both nine-card rosters, Unit Stats and Salvage are covered by browser regressions. Unit Stats remains nonmodal and does not pause play; actual health/plating/refund values are asserted. These are implementation/emulation checks, not physical-device or live spoken-output certification.

## Music, FX and mixer reliability

Orbital Drift remains the same source-authored 15-second/128 BPM WAV, with independent default-off FX/Music controls and 65% sliders. The owner reported an audible gap on repetition. A cached decoded buffer now loops natively on the Web Audio sample clock, using one active source, instead of restarting a media element. HTTP/decode/activation failure, held download cancellation, rapid taps and interrupted output have explicit recovery and stale-request guards. Pausing a mission still allows deliberate music playback; hiding the page stops music and requires Resume.

The owner then confirmed a smooth loop but reported inconsistent toggles. FX now exposes starting/on/paused/error state from its actual context rather than a separate UI flag. A suspended channel offers Resume; failed activation stays silent until a new gesture. Safari's idle audio clock also exposed stale gain automation and cue throttling. FX volume applies immediately, and cue rate limiting uses wall time while envelopes still use the audio clock. Repeated audio-session hints are avoided.

Production tests observe real audio contexts/sources/gains. Two real 15-second boundaries retain one source and one fetch; an offline rendering repeats every decoded sample exactly with nonzero seam energy. Independent suspension, resume, zero volume, cancellation, latest-intent taps, restart and destination transitions are asserted. The owner subsequently confirmed functional toggles and identified sticky enabled color; the final pointer/touch styling fix has its own regressions. Final physical-device color/background/interruption checks remain explicit in the [device checklist](../reports/expedition-1.1/assessment/DEVICE_CHECKLIST.md).

The loop uses deferred decoded PCM memory (about 2.65 MB mono at 44.1kHz), trading a small opt-in buffer for reliable continuous playback. No initial audio download, new composition, third-party recording or autoplay is introduced.

## Gameplay, campaign, animation and saves

Combat, content, schedules, wave calling, armor, economy, shield ratings, campaign progression and save/progress sources are byte-identical to 1.0. First Contact Hard remains opt-in, deterministic and isolated from Normal stars; no other mission gains Hard. Save version 1, corruption/unsupported-version recovery, storage fallback, reset confirmation and settings isolation are unchanged.

[Preservation audit](../reports/expedition-1.1/verification/preservation.json) verifies all 248 illustrated poses, atlas hashes/alpha/geometry, and all 419 Original frames proportionally fitted inside 86×62 world pixels within 100×74 lane cells. No alien was regenerated. [Standalone parity](../reports/expedition-1.1/verification/standalone-parity.json) retains 36 stepwise runs against the frozen original browser baseline; only the already-approved Explosive Astro Joe → Astro Joe X display name is normalized. No combat value is normalized away.

The retained suite exercises public-control victories on all six campaign missions, three standalone environments, wins/losses, unlocks, persistence/reload, best-star replay and lost replay, economy receipts, early calls, Hard isolation, transactional loading/retry/cancel, animation state, speed, reduced motion and art comparison. [Visual evidence](../reports/expedition-1.1/visual/README.md) distinguishes animated real combat, the 50-sprite fixture and emulated/native screenshots.

## Output, permissions and security

[Publication inventory](../reports/expedition-1.1/assessment/PUBLICATION_ASSETS.md) covers all **104 raster outputs: 67 retained school derivatives and 37 generated derivatives**. All 67 school entries still lack asset-specific permission evidence. Generated provenance and source-authored music have documented derivation; they do not clear school/franchise rights. All original contributors remain credited.

There are **38 currently unused but shipped rasters, totaling 3,061,535 bytes**: 26 school files and 12 generated/source delivery copies. They are not initial downloads. No Original feature or historical file was silently excluded. The recommended future public build replaces/clears five projectiles, explicitly decides Original comparison distribution, selects approved output and removes unnecessary copies. This is a product/permission decision, not a new packaging system in 1.1.

The [focused security/dependency review](../reports/expedition-1.1/assessment/SECURITY.md) records zero known npm advisories on 2026-11-02, pinned unchanged dependencies, local runtime network paths, guarded browser APIs, validated storage and transactional failures. Complete Phaser/eventemitter3 MIT notices now ship in `THIRD_PARTY_NOTICES.txt`. The fresh output inventory checks for development-only artifacts; a clean lockfile installation and final build hash comparison establish same-host reproducibility. An audit is not proof of complete security. Production hosting headers and release configuration remain external.

## Verification and Git delivery

There are **223 rule tests and 75 browser scenarios per engine** (225 checks across Chromium, Firefox and WebKit), retaining all prior coverage. Four offline animation-tool tests, asset regeneration/integrity, 36 standalone parity runs, strict TypeScript and production build supplement the browser matrix. Independent production verification runs the 72 player-UI scenarios; three animation-lab scenarios require test fixtures deliberately absent from production output. The full CI matrix retains all 75 scenarios in every engine, using the existing six-shard arrangement and real virtual audio output.

[Verification index](../reports/expedition-1.1/verification/README.md) records results, source boundaries and the 20 required player journeys. Final Git delivery must identify the exact pushed head and its complete Actions conclusion; the historical 1.0 run is not validation of 1.1. A queued or running job is not a pass. The workflow runs installation, rules, strict build and all three engines without skips or browser-security flags. The verification index explains decoder/row portability and slow-driver synchronization corrections; exact sample repetition, source reuse, the1px centering bound and all six three-star campaign victories remain required. Production output is byte-identical across these test-only follow-ups.

Changes are grouped into asset delivery, lifecycle/audio/interface stabilization, and evidence/documentation commits on `modernization`. The original Java source/assets/docs/presentation, contributor attribution, `master` and annotated `school-project-2019` tag remain preserved. The only remote remains the owner's independent TowerDefense repository. No history rewrite, collaborator-repository change, public deployment, Treydmark/Labs, Vercel or DNS modification is included. Exact commit IDs, push status and final-head CI are recorded with delivery rather than embedding a self-referential commit ID in this document.

## Readiness decisions

**Engineering release candidate: Conditionally ready, subject to the final-head matrix gate.** Automated behavior, preserved rules/saves/animations, targeted mobile fixes and measured loading support a controlled candidate. Accept the remaining 17,115-byte image-budget exception explicitly; finish final physical-phone audio/toggle/landscape checks and live game screen-reader validation. No confirmed high-severity functional defect remains in the verified scope. Test success cannot establish subjective gait quality, long phone sessions or every OS audio interruption.

**Public release: Not ready.** Asset permissions/naming review, five independent first-time-player sessions (0/5), final physical-device/real-world performance and live assistive-technology evidence remain outstanding. Treydmark owns publication and hosting separately. The next work is validation/clearance and an approved distribution decision, followed by site integration when authorized; further game-system expansion is not required for this milestone.
