# Focused security and dependency review

Scope: browser-only TypeScript/Phaser application, authored content, local saves, asset/audio loading and a fresh production output. Reviewed using the JavaScript frontend guidance in the security-best-practices skill. This is a focused release review, not proof of complete security or a penetration test.

## Advisory and dependency results

`npm-audit.json`: zero known advisories from the npm registry on 2026-11-02. `production-dependencies.json`: Phaser 4.2.1 and eventemitter3 5.0.4; all tooling remains pinned in the lockfile. No dependency added or upgraded. The only package-version change is the app's 1.1.0 milestone number. The runtime is bundled locally; no CDN scripts, external fonts, analytics, accounts, backend, database, credentials or API keys are introduced.

A clean temporary-copy `npm ci && npm run check` verifies installation from the lockfile; final output hashes are compared with the workspace build. No script permissions were broadened. The final reproducibility record identifies the tested source hashes; a prior clean build is not evidence for a later source revision.

## Findings by severity

No confirmed Critical, High or Medium exploitable issue was found in the reviewed client paths. No unsupported security clearance is implied.

**R1 — Distribution notice gap (release packaging, corrected).** The production Phaser bundle did not retain a complete MIT permission notice, and no separate notices file was shipped. `public/THIRD_PARTY_NOTICES.txt` now carries the exact installed Phaser and eventemitter3 license/copyright texts and is copied to dist. This does not license the game artwork or historical team project.

**R2 — Unused assets in production (low exposure / public-rights concern, documented).** `public/` copying includes 38 raster files not referenced by the current player UI/loader, totaling 3,061,535B.26 of these are retained school derivatives with unknown asset-specific permissions. This is not secret leakage; it is unnecessary distribution and a rights-review burden. Visible Original comparison is deliberately preserved. The publication-assets report proposes an explicit future distribution decision.

**R3 — Hosting policy remains external (informational).** No production host/response-header configuration is present in this browser repo, so deployment CSP and embedding/security headers cannot be verified here. No blanket wildcard, insecure browser flag or new policy bypass was added. A future host can establish an appropriate same-origin script/media/image policy after checking Phaser's blob/image loading and intended Treydmark embedding. Local HTTP preview is not treated as a TLS vulnerability.

## Reviewed boundaries and evidence

- `src/main.ts`: authored interface markup and later phase/result `innerHTML` assignments contain static authored strings, trusted content constants and finite simulation-derived values. URL/query/storage strings do not flow into them. Campaign warnings/results and CrewInspector stats use DOM creation/textContent. `security-source-locations.txt` provides current search locations; inspect the source for line-level context.
- `src/campaign/save.ts:15–64`: JSON parsing is caught; object shape/version, known mission IDs, stars, finite nonnegative durations and integer kills are validated. Unsupported/corrupt originals are preserved, best valid results merge, storage failures fall back to in-memory play, and reset touches only the two campaign keys after confirmation. `src/main.ts` protects optional motion preference reads/writes. There is no server authority or monetary/account trust in local stars.
- `src/assets.ts` and `src/battlefield.ts`: assets come from authored map/style manifests under the local base path, not user URLs. Mandatory files block Begin; transactional failures remain paused with retry/cancel and cached successes. Existing tests exercise these paths without disabling security.
- `src/music.ts`: same-origin fetch after gesture, HTTP/decode failures exposed, pending download aborted on cancel, revision checks prevent stale starts, one cached buffer and one active source, and explicit recovery after interrupted output. Audio context creation/activation failures are caught. FX now reports starting/interrupted/error states instead of retaining an inaccurate enabled label. Optional navigator audio-session hint is feature-detected/caught and not repeatedly reassigned unnecessarily.
- Native dialog, popover, matchMedia and visualViewport use the current supported browser APIs; visualViewport is optional. Three-engine tests cover current engines. Old unsupported browsers are not promised a polyfill. No microphone, camera, geolocation or notification permission is requested.
- Measured startup and actual-combat request inventories use only their own localhost origin. The Original links are explicit user-opened GitHub navigation with `noopener noreferrer`; no automatic third-party request is needed to play.
- `production-output.json` checks actual output. Source rigs, research reports, test fixtures, traces, `node_modules`, .git and environment files are outside dist. Public art metadata/README files are present and contain historical provenance, not credentials; consider excluding unnecessary metadata in the future approved distribution.

The asset-specific permissions and identity questions are a separate public-release blocker; an empty advisory list does not resolve them.
