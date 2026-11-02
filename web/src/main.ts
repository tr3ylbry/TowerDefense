import "./style.css";
import { COLS, ENEMIES, isBlocked, MAPS, ROWS, TOWERS } from "./game/content";
import {
  EXPEDITION_ENEMIES,
  EXPEDITION_TOWERS,
  EXPEDITION_ENVIRONMENTS,
} from "./game/art";
import type { EnemyKind, MapKind, TowerKind } from "./game/content";
import { Simulation } from "./game/simulation";
import type { Snapshot } from "./game/simulation";
import { MISSIONS, CAMPAIGN_ORDER } from "./game/missions";
import { HARD_DESCRIPTION } from "./game/challenges";
import type { MissionId } from "./game/missions";
import { validateContent } from "./game/validate-content";
import { CampaignSave } from "./campaign/save";
import { CompletionRecorder, isUnlocked, rating } from "./campaign/progress";
import type { Completion } from "./campaign/progress";
import { CampaignBoard, campaignMarkup } from "./campaign/board";
import { AudioBus } from "./audio";
import type { Battlefield } from "./battlefield";
import type { ArtManifest, ArtStyle } from "./assets";
import { coverage, crewDetails, waveCallDetails } from "./guidance";
import { laneThreats, placementWarning, threatAdvice } from "./game/threats";

const app = document.querySelector<HTMLDivElement>("#app")!;
validateContent();
const simulation = new Simulation();
const campaignSave = new CampaignSave();
const completionRecorder = new CompletionRecorder();
let campaignMode = false;
let completedAttempt = -1;
let completion: Completion | null = null;
const audio = new AudioBus();
const towerKinds = Object.keys(TOWERS) as TowerKind[];
const base = import.meta.env.BASE_URL;
let selected: TowerKind | "salvage" | null = "astro";
let cursor: { row: number; col: number } | null = null;
let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let battlefield: Battlefield | undefined;
let assetBusy = false;
let assetRequest: {
  map: MapKind;
  style: ArtStyle;
  apply: () => void;
  resume: boolean;
} | null = null;
let lastPhase = "";
let lastWave = 0;
let lastMap = "";
let ready = false;
let loadError = false;
let lastUiSignature = "";
let directionExplained = false;
let artStyle: "expedition" | "original" = "expedition";
let focused = false;
let zoomed = false;

let storedMotion: boolean | null = null;
try {
  const saved = localStorage.getItem("ava-reduced-motion");
  if (saved !== null) {
    storedMotion = saved === "true";
    reducedMotion = storedMotion;
  }
} catch {
  /* Storage can be disabled. */
}

const helmet =
  '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 29v-8a13 13 0 0 1 26 0v8l-5 10H16Z" fill="currentColor"/><rect x="15" y="15" width="18" height="13" rx="5" fill="#18303a"/><path d="M19 35h10" stroke="#f5a47d" stroke-width="3"/></svg>';
const missionReceipt = `
  <details id="mission-receipt" hidden>
    <summary><span>Mission economy</span><span class="receipt-code" aria-hidden="true">ECON / 01</span></summary>
    <div class="receipt-terminal">
      <div id="receipt-summary" class="receipt-stats" role="group" aria-label="Crew and spending">
        <span><strong id="receipt-deployed">0</strong> deployed</span>
        <span><strong id="receipt-lost">0</strong> lost</span>
        <span><strong id="receipt-spent">0</strong> spent</span>
      </div>
      <table id="receipt-sources">
        <caption>Started with 230.</caption>
        <thead><tr><th scope="col">Credit source</th><th scope="col">Spacebucks</th></tr></thead>
        <tbody>
          <tr><th scope="row">Outpost supply</th><td id="receipt-supply">+0</td></tr>
          <tr><th scope="row">Defender income</th><td id="receipt-growth">+0</td></tr>
          <tr><th scope="row">Alien bounties</th><td id="receipt-bounties">+0</td></tr>
          <tr><th scope="row">Early-wave bonuses</th><td id="receipt-calls">+0</td></tr>
          <tr><th scope="row">Salvage recovered</th><td id="receipt-salvage">+0</td></tr>
          <tr class="receipt-debit"><th scope="row">Crew purchases</th><td id="receipt-purchases">−0</td></tr>
        </tbody>
        <tfoot><tr><th scope="row">Ending balance</th><td id="receipt-balance">0</td></tr></tfoot>
      </table>
    </div>
  </details>`;
app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="${base}" aria-label="Astronauts vs Aliens home"><span class="brand-icon" aria-hidden="true">${helmet}</span><span class="wordmark-copy" aria-hidden="true"><span class="wordmark-astronauts">ASTRONAUTS</span><span class="wordmark-versus">vs</span><span class="wordmark-aliens">ALIENS</span><span class="edition">EXPEDITION 1.0</span></span></a>
    <nav aria-label="Main"><button id="campaign-nav" class="nav-button" aria-haspopup="dialog">Campaign ↗</button><span id="mode-label" class="nav-active">Standalone</span><button id="guide-open" class="nav-button">Field guide <span>↗</span></button><a href="https://github.com/tr3ylbry/TowerDefense/tree/school-project-2019" target="_blank" rel="noopener noreferrer">The original <span>↗</span></a></nav>
    <span class="lab-mark">TREYDMARK<span>EXPERIMENTS IN PLAY</span></span>
  </header>
  <main id="mission">
    <section class="mission-heading" aria-labelledby="mission-title"><div><p class="eyebrow"><span class="signal-dot"></span> EXPEDITION 001 <span class="eyebrow-line"></span> ORBITAL DEFENSE</p><h1 id="mission-title">A little space.<br class="mobile-break"> A lot to defend<span>.</span></h1></div><p class="mission-intro">A familiar crew. An unfamiliar frontier.<br>Build your defenses and hold the line.</p></section>
    <div class="mission-bar"><div class="location"><span id="location-number" class="location-number">01</span><div><span class="micro-label">YOUR DESTINATION</span><h2 id="location-name">The Canyon</h2></div><span id="location-tag" class="location-tag">FIRST CONTACT</span><button id="map-open" disabled class="destination-button" aria-haspopup="dialog">Change destination ↗</button></div><div class="mission-tools"><button id="art-toggle" disabled class="tool" aria-label="Show original art" aria-pressed="false">◈ <span>Expedition art</span></button><button id="focus-toggle" class="tool" aria-label="Enter focused view" aria-pressed="false">⛶ <span>Focus</span></button><button id="play-guide" class="tool" aria-label="Field guide">? <span>Guide</span></button><button id="sound-toggle" aria-label="Toggle sound effects" class="tool" aria-pressed="false" title="Toggle synthesized sound effects">♪ <span>Sound off</span></button><button id="motion-toggle" aria-label="Reduce decorative animation" class="tool" aria-pressed="${reducedMotion}" title="Reduce decorative animation">◌ <span>Reduced motion</span></button><button id="restart" aria-label="Restart" class="tool" title="Restart mission">↻ <span>Restart</span></button></div></div>
    <p id="save-warning" class="save-warning" role="status" hidden></p><p id="terrain-note" class="terrain-note">Open terrain. All nine defenders available.</p>
    <div class="play-layout">
      <section class="battle-panel" aria-label="Mission control">
        <div class="telemetry"><div class="telemetry-item"><span class="micro-label">SPACEBUCKS</span><strong id="credit-balance" class="credits" role="group" aria-label="230 credits available"><span aria-hidden="true">◈</span> <span id="credits">230</span></strong></div><div class="telemetry-item"><span class="micro-label">OUTPOST INTEGRITY</span><strong id="integrity" class="integrity" aria-label="3 shields remaining">◆ ◆ ◆</strong></div><div class="telemetry-item wave-item"><span class="micro-label"><span id="current-difficulty" hidden>HARD</span>WAVE <span id="wave-number">0</span> / ${MAPS.canyon.waves.length}</span><span class="wave-track" aria-hidden="true">${MAPS.canyon.waves.map((_, i) => `<i data-wave="${i + 1}"></i>`).join("")}</span></div><div class="time-controls"><button id="speed" aria-label="Switch to double speed" title="Simulation speed, independent of difficulty">1×</button><button id="pause" disabled aria-label="Pause mission">Ⅱ <span>Pause</span></button></div></div>
        <div class="battle-scroll"><div class="board-stack"><div id="phaser" aria-hidden="true"></div><div id="battle-grid" class="battle-grid" role="grid" aria-label="Battlefield, 6 lanes and 9 columns" aria-describedby="grid-help"></div><div id="overlay" class="mission-overlay"><div class="overlay-card"><span class="overline">A TRANSMISSION FROM THE FRONTIER</span><div class="overlay-orbit">${helmet}</div><h2 id="overlay-title">Home is behind you.<br>Hold the line.</h2><p id="overlay-body">Defend the canyon through four incoming waves.<br>Deploy your crew. Keep the outpost standing.</p><div id="mode-choice" class="mode-choice"><span>Standalone · no saved stars.</span><button id="campaign-entry" class="nav-button" aria-haspopup="dialog" disabled>Explore campaign ↗</button></div>${missionReceipt}<p id="mission-rating" class="mission-rating" hidden></p><button id="start" class="primary-button" disabled><span>Preparing the mission…</span> <span aria-hidden="true">↗</span></button><div id="campaign-result-actions" class="campaign-result-actions" hidden><button id="campaign-next" class="secondary-button">Next mission ↗</button><button id="campaign-return" class="secondary-button">Mission control</button></div><p id="overlay-note" class="overlay-note">Pick a defender, then choose a tile. That's your first move.</p></div></div></div></div>
        <div class="wave-control"><div class="wave-copy"><p id="wave-forecast" class="wave-forecast" aria-label="Wave briefing"><span id="wave-title"></span><span id="wave-composition"></span><span id="wave-tactic"></span></p><p id="wave-timing" class="wave-timing"></p><p id="wave-risk" class="wave-risk"></p></div><button id="call-wave" class="call-wave" disabled aria-describedby="wave-timing wave-risk" aria-keyshortcuts="N">Call next wave <span>+0</span></button></div><div class="threat-strip"><p id="incoming-summary" aria-label="Incoming threats">Watching the approaches · next 5 seconds</p><button id="field-zoom" aria-pressed="false" aria-label="Enlarge battlefield">⊕ Enlarge field</button></div><aside id="passed-threat" hidden aria-label="Passed firing coverage"><p id="passed-summary" role="status"></p><details id="direction-help"><summary>Why can’t they fire?</summary><p>Fresh shots travel right. The marked hostile has passed the guns’ direct firing lines. If an empty forward firing tile remains, place a gun there and check armor. Salvage can open an occupied tile, but cannot restore a firing line after the hostile passes every legal muzzle. Removing its blocker lets it advance and may cost a shield. Splash and shots already in flight may still help. Farther-right placements can defend future arrivals.</p></details></aside><div class="field-status"><span id="status"><span class="signal-dot"></span> Awaiting your command</span><span id="coverage-status" class="coverage-status"></span><span id="defense-alert" class="defense-alert"></span><span id="countdown">4 WAVES · 3 SHIELDS · ONE OUTPOST</span></div>
        <p id="grid-help" class="grid-help"><span><kbd>1</kbd>–<kbd>9</kbd> select crew</span><span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> move · <kbd>Enter</kbd> deploy</span><span><kbd>P</kbd> pause · <kbd>X</kbd> salvage</span><span class="touch-help">Tap crew, then a tile. Enlarge for bigger targets.</span></p>
      </section>
      <aside class="crew-panel" aria-labelledby="crew-title"><div class="crew-heading"><h2 id="crew-title">Deploy your crew</h2><span id="supply-status">Supply +30 / 5s</span></div><div class="crew-list" role="group" aria-label="Defender roster">${towerKinds
        .map((kind, i) => {
          const tower = TOWERS[kind];
          return `<button class="crew-card ${kind === "astro" ? "selected" : ""}" data-tower="${kind}" aria-pressed="${kind === "astro"}" aria-label="${tower.name}, ${tower.cost} credits. ${tower.description}"><span class="portrait" data-art-tower="${kind}" style="background-image:url('${base}art/${EXPEDITION_TOWERS[kind].file}')"></span><span class="crew-info"><span class="crew-role">${tower.role}</span><strong>${tower.name}</strong><span class="crew-description">${tower.description}</span></span><span class="crew-price"><span class="crew-cost">◈ ${tower.cost}</span><kbd>${i + 1}</kbd></span></button>`;
        })
        .join(
          "",
        )}</div><div class="crew-details"><p id="selected-detail"><strong>Astro Joe · 50 credits</strong><span>Steady fire. Your first line of defense.</span></p><button id="salvage" class="salvage-button" aria-pressed="false" aria-label="Salvage a defender, recover 40% of its cost">⌁ Salvage <kbd>X</kbd></button></div></aside>
    </div>
    <div class="dispatch" id="announcement" role="status" aria-live="polite" aria-atomic="true">Select a crew member to get started.</div>
    <footer><span><span class="footer-dot"></span> MADE FOR THE JOY OF BUILDING.</span><span>A school project, reimagined. <button id="credits-open">Meet the original team ↗</button></span></footer>
  </main>
  <dialog id="guide-dialog" aria-labelledby="guide-title"><button class="dialog-close" data-close aria-label="Close field guide">×</button><span class="eyebrow">FIELD GUIDE / 001</span><h2 id="guide-title">Every outpost starts<br>with a good plan.</h2><ol><li><strong>Deploy.</strong> Choose one of nine crew cards, then click or tap an empty tile. Tanks absorb 80% of ordinary fire: TARS ignores plating; plasma and explosives partially pierce it. Explosive Astro Joe and Moon Zeus hit clusters; the Frontier Flagship fires three rounds into one lane.</li><li><strong>Fund the mission.</strong> Money Bushes produce 25 credits every 6 seconds; Money Trees produce 60 every 8. The outpost provides 30 every 5 seconds.</li><li><strong>Buy time.</strong> Asteroids block enemies. Place attackers behind them. Acid pools on Sky Bridge and The Nest prevent deployment, but aliens can cross them. Salvage returns 40% of a defender's cost.</li><li><strong>Hold the line.</strong> Clear four waves. An alien reaching the left edge costs one shield. Lose all three and the outpost falls.</li></ol><p>Use number keys 1–9 to select crew. Tab to the field, use arrow keys to move, and Enter or Space to place. P pauses, X selects salvage, and Escape cancels selection. Moving to another tab pauses the mission. N calls an eligible wave early.</p><p><strong>Choose your pace.</strong> After a wave finishes entering, Call next wave brings the next arrival to three game seconds from now. Gain two credits per whole second saved, up to 40 per wave. Later waves move earlier by the same amount; surviving aliens stay on the field. Each wave can pay once. Lane warnings show actual arrivals in the next five game seconds: an arrow for ordinary enemies, a diamond for plated Tanks, and !! for Gargantua.</p><p><strong>Read the field.</strong> Blue plate sparks mean armor resisted most of a hit. A mint impact means a piercing hit. An orange outline marks a defender taking damage; a triangle and critical label mark health below 30%. On phones, Enlarge field gives a closer view you can pan; Overview restores the whole field.</p><h3 class="guide-subtitle">Know the invaders</h3><div class="alien-guide">${Object.entries(
    ENEMIES,
  )
    .map(
      ([kind, enemy]) =>
        `<article><span class="alien-portrait" data-art-enemy="${kind}" style="background-image:url('${base}art/${EXPEDITION_ENEMIES[kind as EnemyKind].file}')" aria-hidden="true"></span><div><h4>${enemy.name}</h4><p>${enemy.description}</p><small>${enemy.health} health · ${enemy.reward} credit bounty</small></div></article>`,
    )
    .join(
      "",
    )}</div><button class="primary-button" data-close>Back to the frontier ↗</button></dialog>
  <dialog id="credits-dialog" aria-labelledby="credits-title"><button class="dialog-close" data-close aria-label="Close credits">×</button><span class="eyebrow">THE ORIGINAL CREW / 2019</span><h2 id="credits-title">Built together.<br>Explored further.</h2><p>The original Astronauts vs Aliens was created for CSC 335 by <strong>Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.</strong></p><p>This browser edition is Trey's independent continuation, exploring animation, interaction, and game systems. Original art is retained from the school project; its external provenance is still being documented. Expedition artwork illustrates all three environments, nine defenders, and six alien types, with simulation-driven procedural motion. Frontier Flagship is an original interpretation of the school unit named Millennium Falcon; the original name and artwork remain in the school history. Use the art switch to compare the illustrations with the retained school assets.</p><a class="primary-button" href="https://github.com/tr3ylbry/TowerDefense/tree/school-project-2019" target="_blank" rel="noopener noreferrer">Explore the original project ↗</a></dialog>
  <dialog id="map-dialog" aria-labelledby="map-title"><button class="dialog-close" data-close aria-label="Close destinations">×</button><span class="eyebrow">THREE ORIGINAL FRONTIERS</span><h2 id="map-title">Choose your destination.</h2><p id="map-warning">Each destination has four waves and the full original roster.</p><div class="destination-list">${(
    Object.keys(MAPS) as MapKind[]
  )
    .map((kind) => {
      const map = MAPS[kind];
      return `<button class="destination-card" data-map="${kind}" aria-label="Choose ${map.name}"><img loading="lazy" decoding="async" src="${base}art/${EXPEDITION_ENVIRONMENTS[kind].file}" alt="" width="144" height="81"><span><span class="micro-label">${map.number} / ${map.tag}</span><strong>${map.name}</strong><span>${map.description}</span></span><span aria-hidden="true">↗</span></button>`;
    })
    .join(
      "",
    )}</div><button id="campaign-switch" class="primary-button">Campaign mission control ↗</button><button class="secondary-button" data-close>Keep current destination</button></dialog>
  <dialog id="asset-dialog" aria-labelledby="asset-title"><span class="eyebrow">MISSION RESOURCES</span><h2 id="asset-title">Preparing artwork…</h2><p id="asset-message" role="status">Your mission is paused while artwork loads.</p><progress id="asset-progress" aria-label="Loading artwork"></progress><div class="dialog-actions"><button id="asset-retry" class="primary-button" hidden>Retry artwork</button><button id="asset-cancel" class="secondary-button" hidden>Keep current mission</button></div></dialog>
  ${campaignMarkup}
  <dialog id="restart-dialog" aria-labelledby="restart-title"><span class="eyebrow">MISSION CONTROL</span><h2 id="restart-title">Start a fresh mission?</h2><p>Your current deployment and progress will be reset.</p><div class="dialog-actions"><button id="restart-cancel" class="secondary-button">Keep playing</button><button id="restart-confirm" class="primary-button">Restart mission ↗</button></div></dialog>
`;

const get = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const start = get<HTMLButtonElement>("start");
const pause = get<HTMLButtonElement>("pause");
const overlay = get("overlay");
const grid = get("battle-grid");
const announcement = get("announcement");
const cells: HTMLButtonElement[] = [];
let focusIndex = 0;

function announce(message: string): void {
  announcement.textContent = message;
}
function select(kind: TowerKind | "salvage" | null): void {
  selected = kind;
  document
    .querySelectorAll<HTMLButtonElement>("[data-tower]")
    .forEach((card) => {
      const active = card.dataset.tower === kind;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
      if (active) {
        const roster = card.parentElement!;
        if (card.offsetLeft < roster.scrollLeft)
          roster.scrollLeft = card.offsetLeft;
        else if (
          card.offsetLeft + card.offsetWidth >
          roster.scrollLeft + roster.clientWidth
        )
          roster.scrollLeft =
            card.offsetLeft + card.offsetWidth - roster.clientWidth;
      }
    });
  renderSelection(simulation.snapshot());
  get("salvage").setAttribute("aria-pressed", String(kind === "salvage"));
  announce(
    kind === "salvage"
      ? "Salvage selected. Choose a defender to recover 40% of its cost."
      : kind
        ? `${TOWERS[kind].name} selected. Choose an empty tile.`
        : "Selection cleared.",
  );
}

function renderSelection(state: Snapshot): void {
  const detail = get("selected-detail");
  const lines = crewDetails(selected, state, cursor);
  const signature = lines.join("|");
  if (detail.dataset.signature === signature) return;
  detail.dataset.signature = signature;
  detail.replaceChildren(
    ...lines.map((line, index) => {
      const element = document.createElement(
        index === 0 ? "strong" : index === 1 ? "span" : "small",
      );
      element.textContent = line;
      return element;
    }),
  );
}
for (let row = 0; row < ROWS; row++) {
  const gridRow = document.createElement("div");
  gridRow.setAttribute("role", "row");
  for (let col = 0; col < COLS; col++) {
    const button = document.createElement("button");
    button.className = "field-cell";
    button.type = "button";
    button.setAttribute("role", "gridcell");
    button.setAttribute(
      "aria-label",
      `Lane ${row + 1}, tile ${col + 1}, empty`,
    );
    button.tabIndex = row === 0 && col === 0 ? 0 : -1;
    const index = row * COLS + col;
    button.addEventListener("focus", () => {
      cells[focusIndex].tabIndex = -1;
      focusIndex = index;
      button.tabIndex = 0;
      cursor = { row, col };
      renderSelection(simulation.snapshot());
    });
    button.addEventListener("pointerenter", () => {
      cursor = { row, col };
      renderSelection(simulation.snapshot());
    });
    button.addEventListener("pointerleave", () => {
      if (document.activeElement !== button) cursor = null;
      renderSelection(simulation.snapshot());
    });
    button.addEventListener("blur", () => {
      cursor = null;
      renderSelection(simulation.snapshot());
    });
    button.addEventListener("click", () => {
      if (!selected) {
        announce("Choose a defender from your crew first.");
        return;
      }
      const caution =
        selected === "salvage"
          ? null
          : placementWarning(selected, simulation.snapshot(), row, col);
      const result =
        selected === "salvage"
          ? simulation.remove(row, col)
          : simulation.place(selected, row, col);
      announce(
        result.ok && caution ? `${result.message} ${caution}` : result.message,
      );
      button.classList.toggle("invalid-cell", !result.ok);
      setTimeout(() => button.classList.remove("invalid-cell"), 400);
      render(simulation.snapshot());
    });
    button.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight")
        next = row * COLS + Math.min(COLS - 1, col + 1);
      else if (event.key === "ArrowLeft")
        next = row * COLS + Math.max(0, col - 1);
      else if (event.key === "ArrowDown")
        next = Math.min(ROWS - 1, row + 1) * COLS + col;
      else if (event.key === "ArrowUp")
        next = Math.max(0, row - 1) * COLS + col;
      else return;
      event.preventDefault();
      cells[next].focus();
    });
    gridRow.append(button);
    cells.push(button);
  }
  grid.append(gridRow);
}

function render(state: Snapshot): void {
  const hard = simulation.difficulty === "hard";
  const ratedCampaign = campaignMode && !hard;
  if (
    ratedCampaign &&
    state.phase === "won" &&
    completedAttempt !== simulation.attemptId
  ) {
    completedAttempt = simulation.attemptId;
    completion = completionRecorder.observe(simulation, campaignSave.progress);
    if (completion) campaignSave.save();
  }
  showSaveWarning();
  const passed = laneThreats(state).filter((t) => t.passed);
  const signature = JSON.stringify([
    ready,
    assetBusy,
    focused,
    zoomed,
    state.incoming.map((item) => [
      item.row,
      item.threat,
      item.count,
      Math.ceil(item.in),
    ]),
    state.nextWave?.canLaunch,
    state.nextWave?.reward,
    state.map,
    state.mission,
    simulation.attemptId,
    campaignMode,
    hard,
    state.phase,
    Math.floor(state.elapsed),
    state.credits,
    state.integrity,
    state.kills,
    state.wave,
    state.speed,
    state.enemies.length,
    passed.map((t) => [t.row, t.enemy.id, t.rescueCol]),
    state.towers.map(({ id, kind, row, col, health }) => ({
      id,
      kind,
      row,
      col,
      health,
    })),
  ]);
  if (signature === lastUiSignature) return;
  lastUiSignature = signature;
  get<HTMLButtonElement>("map-open").disabled =
    (!ready && !loadError) || assetBusy;
  get<HTMLButtonElement>("art-toggle").disabled = !ready || assetBusy;
  get<HTMLButtonElement>("campaign-nav").disabled = !ready || assetBusy;
  get<HTMLButtonElement>("campaign-entry").disabled = !ready || assetBusy;
  get("mode-label").textContent = hard
    ? "Hard challenge"
    : campaignMode
      ? "Campaign"
      : "Standalone";
  get("current-difficulty").hidden = !hard;
  get("mode-choice").hidden = campaignMode || state.phase !== "ready";
  renderSelection(state);
  const threatBox = get("passed-threat");
  const help = get<HTMLDetailsElement>("direction-help");
  if (state.phase === "ready") {
    directionExplained = false;
    help.open = false;
  }
  threatBox.hidden = passed.length === 0;
  const advice = passed.map(threatAdvice).join(" ");
  if (get("passed-summary").textContent !== advice)
    get("passed-summary").textContent = advice;
  if (passed.length && !directionExplained) {
    help.open = true;
    directionExplained = true;
  }
  const growers = state.towers.filter((x) => TOWERS[x.kind].income > 0).length;
  get("supply-status").textContent =
    `Supply +30 in ${state.economy.supplyIn}s · ${growers} income ${growers === 1 ? "unit" : "units"}`;
  const map = MAPS[state.map];
  const mission = MISSIONS[state.mission];
  document.body.classList.toggle("focused-play", focused);
  document.body.classList.toggle("zoomed-field", zoomed);
  get("focus-toggle").setAttribute("aria-pressed", String(focused));
  get("focus-toggle").setAttribute(
    "aria-label",
    focused ? "Leave focused view" : "Enter focused view",
  );
  const upcoming = state.nextWave;
  const counts = new Map<string, number>();
  for (const kind of upcoming?.enemies ?? [])
    counts.set(ENEMIES[kind].name, (counts.get(ENEMIES[kind].name) ?? 0) + 1);
  get("wave-title").textContent = upcoming
    ? `UP NEXT · ${upcoming.title} · ${upcoming.enemies.length} hostiles${upcoming.enemies.includes("tank") ? ` · ${upcoming.enemies.filter((kind) => kind === "tank").length} plated` : ""}`
    : state.phase === "won"
      ? "OUTPOST SECURED · All waves cleared."
      : state.phase === "lost"
        ? "MISSION ENDED · Try a new formation."
        : "FINAL WAVE · Clear every remaining hostile.";
  get("wave-composition").textContent = upcoming
    ? [...counts].map(([name, count]) => `${count} ${name}`).join(" / ")
    : "";
  get("wave-tactic").textContent =
    upcoming?.briefing ??
    (state.pendingSpawns > 0
      ? (
          simulation.waves[state.wave - 1] as
            import("./game/content").Wave | undefined
        )?.briefing
      : "") ??
    "";
  const call = get<HTMLButtonElement>("call-wave");
  call.disabled = assetBusy || !upcoming?.canLaunch;
  call.querySelector("span")!.textContent = upcoming?.canLaunch
    ? `+${upcoming.reward} credits`
    : "N";
  call.setAttribute(
    "aria-label",
    upcoming?.canLaunch
      ? `Call wave ${upcoming.number} early for ${upcoming.reward} credits`
      : "Call next wave early",
  );
  const [timing, risk] = waveCallDetails(state);
  get("wave-timing").textContent = timing;
  get("wave-timing").hidden = !timing;
  get("wave-risk").textContent = risk;
  get("incoming-summary").textContent = state.incoming.length
    ? state.incoming
        .map(
          (item) =>
            `L${item.row + 1} ${item.threat === "heavy" ? "!!" : item.threat === "armored" ? "◇" : "›"} ${item.kinds.map((kind) => (kind === "scout" ? "Scout" : ENEMIES[kind].name)).join(" + ")} in ${Math.ceil(item.in)}s`,
        )
        .join(" · ")
    : "Watching the approaches · next 5 seconds";
  const critical = state.towers.filter(
    (tower) => tower.health / TOWERS[tower.kind].health < 0.3,
  );
  get("defense-alert").textContent = critical.length
    ? `⚠ ${critical.length} critical · ${critical
        .slice(0, 2)
        .map((tower) => `L${tower.row + 1} ${TOWERS[tower.kind].name}`)
        .join(", ")}`
    : "";
  document.title = `Astronauts vs Aliens — ${campaignMode ? mission.title : map.name}${hard ? " · Hard" : ""}`;
  grid.inert = assetBusy || state.phase !== "playing";
  get("location-name").textContent = campaignMode ? mission.title : map.name;
  get("map-open").textContent = campaignMode
    ? "Mission control ↗"
    : "Change destination ↗";
  get("location-number").textContent = campaignMode
    ? String(mission.order).padStart(2, "0")
    : map.number;
  get("location-tag").textContent = hard
    ? "HARD PROTOTYPE"
    : campaignMode
      ? `CAMPAIGN / ${map.name}`
      : map.tag;
  get("terrain-note").textContent = hard
    ? "First Contact · Hard: compact relays, more Sprinters and Tanks. Results do not save stars."
    : map.description;
  document.querySelectorAll<HTMLElement>("[data-map]").forEach((card) => {
    card.setAttribute("aria-pressed", String(card.dataset.map === state.map));
  });
  get("credits").textContent = String(state.credits);
  get("credit-balance").setAttribute(
    "aria-label",
    `${state.credits} credits available`,
  );
  get("integrity").textContent = Array.from({ length: 3 }, (_, i) =>
    i < state.integrity ? "◆" : "◇",
  ).join(" ");
  get("integrity").setAttribute(
    "aria-label",
    `${state.integrity} shields remaining`,
  );
  get("wave-number").textContent = String(state.wave);
  get("speed").textContent = `${state.speed}×`;
  get("speed").setAttribute(
    "aria-label",
    `Switch to ${state.speed === 1 ? "double" : "normal"} speed`,
  );
  document
    .querySelectorAll<HTMLElement>("[data-wave]")
    .forEach((item) =>
      item.classList.toggle("filled", Number(item.dataset.wave) <= state.wave),
    );
  pause.disabled =
    assetBusy || (state.phase !== "playing" && state.phase !== "paused");
  const pauseLabel =
    state.phase === "paused" ? "Resume mission" : "Pause mission";
  // Keep the pointer target stable across live telemetry updates.
  if (pause.getAttribute("aria-label") !== pauseLabel) {
    pause.innerHTML =
      state.phase === "paused"
        ? "▷ <span>Resume</span>"
        : "Ⅱ <span>Pause</span>";
    pause.setAttribute("aria-label", pauseLabel);
  }
  document
    .querySelectorAll<HTMLElement>("[data-tower]")
    .forEach((card) =>
      card.classList.toggle(
        "unaffordable",
        state.credits < TOWERS[card.dataset.tower as TowerKind].cost,
      ),
    );
  cells.forEach((cell, i) => {
    const tower = state.towers.find(
      (tower) => tower.row === Math.floor(i / COLS) && tower.col === i % COLS,
    );
    const blocked = isBlocked(state.map, Math.floor(i / COLS), i % COLS);
    cell.classList.toggle("blocked-cell", blocked);
    const critical = Boolean(
      tower && tower.health / TOWERS[tower.kind].health < 0.3,
    );
    cell.classList.toggle("critical-cell", critical);
    const label = `Lane ${Math.floor(i / COLS) + 1}, tile ${(i % COLS) + 1}, ${blocked ? "acid pool, deployment blocked" : tower ? `${TOWERS[tower.kind].name}, ${Math.ceil(tower.health)} health${critical ? ", critical" : ""}` : "empty"}`;
    if (cell.getAttribute("aria-label") !== label)
      cell.setAttribute("aria-label", label);
  });
  const phaseLabels = {
    ready: "Awaiting your command",
    playing: "Mission in progress",
    paused: "Mission paused",
    won: "Outpost secured",
    lost: "Signal lost",
  };
  get("status").textContent = phaseLabels[state.phase];
  get("coverage-status").textContent =
    state.phase === "playing" ? coverage(state) : "";
  get("countdown").textContent =
    state.phase === "playing"
      ? state.nextWaveIn !== null
        ? `NEXT WAVE IN ${state.nextWaveIn}s`
        : `${state.enemies.length} HOSTILES REMAINING`
      : `${state.kills} HOSTILES CLEARED`;
  if (state.wave !== lastWave) {
    if (state.wave > 0)
      announce(
        `Wave ${state.wave}: ${simulation.waves[state.wave - 1].title}.`,
      );
    lastWave = state.wave;
  }
  if (
    !loadError &&
    (state.phase !== lastPhase ||
      `${state.mission}/${campaignMode}/${hard}` !== lastMap)
  ) {
    lastPhase = state.phase;
    lastMap = `${state.mission}/${campaignMode}/${hard}`;
    overlay.hidden = state.phase === "playing";
    overlay.classList.toggle("compact-overlay", state.phase === "paused");
    const title = get("overlay-title");
    const body = get("overlay-body");
    const note = get("overlay-note");
    const receipt = get<HTMLDetailsElement>("mission-receipt");
    receipt.hidden = state.phase !== "won" && state.phase !== "lost";
    receipt.open = false;
    get("mission-rating").hidden =
      !ratedCampaign || (state.phase !== "won" && state.phase !== "lost");
    get("campaign-result-actions").hidden =
      !campaignMode || (state.phase !== "won" && state.phase !== "lost");
    if (state.phase === "won" || state.phase === "lost")
      start.setAttribute(
        "aria-describedby",
        `overlay-title overlay-body${ratedCampaign ? " mission-rating" : ""}`,
      );
    else start.removeAttribute("aria-describedby");
    if (state.phase === "ready") {
      title.innerHTML = "Home is behind you.<br>Hold the line.";
      if (campaignMode)
        title.textContent = hard ? `${mission.title} · Hard` : mission.title;
      body.textContent =
        "Choose a crew card, then an empty tile. Guns fire right: place them to the left of approaching aliens. Cover all six lanes and protect three shields.";
      if (campaignMode)
        body.textContent = hard
          ? HARD_DESCRIPTION
          : `${mission.briefing} ${mission.tactics}`;
      start.innerHTML =
        '<span>Begin mission</span><span aria-hidden="true">↗</span>';
      note.textContent =
        "Pick a defender, then choose a tile. That's your first move.";
    } else if (state.phase === "paused") {
      title.textContent = "Take a breath, trooper.";
      body.textContent =
        "The whole battlefield is on hold. Your crew will be right here.";
      start.innerHTML =
        '<span>Resume mission</span><span aria-hidden="true">↗</span>';
      note.textContent = "P to resume · No time passes while paused.";
      if (!document.querySelector("dialog[open]")) start.focus();
    } else if (state.phase === "won" || state.phase === "lost") {
      title.innerHTML =
        state.phase === "won"
          ? `${map.name} secured.<br>Nice work, commander.`
          : "The signal went quiet.<br>Try a new formation.";
      body.textContent = `${state.kills} hostiles cleared · ${Math.floor(state.elapsed / 60)}m ${Math.floor(state.elapsed % 60)}s elapsed · ${state.integrity} shields remaining`;
      get("campaign-next").hidden = hard;
      if (ratedCampaign) {
        if (state.phase === "won")
          title.textContent = `${mission.title} complete.`;
        const earned = rating(state);
        const best = campaignSave.progress.best[state.mission]?.stars ?? 0;
        get("mission-rating").textContent =
          `${"★".repeat(earned)}${"☆".repeat(3 - earned)} · ${earned}/3 stars · Best: ${best}/3${completion?.mission === state.mission && earned ? ` · Previous best: ${completion.previous}/3` : ""}. Victory earns one star per remaining shield.`;
        const next = CAMPAIGN_ORDER[mission.order];
        get("campaign-next").textContent = next
          ? `Next: ${MISSIONS[next].title} ↗`
          : "Next mission ↗";
        get("campaign-next").hidden =
          state.phase !== "won" ||
          !next ||
          !isUnlocked(campaignSave.progress, next);
      }
      if (hard)
        title.textContent =
          state.phase === "won"
            ? "First Contact · Hard secured."
            : "Hard challenge lost. Try a new formation.";
      const economy = state.economy;
      get("receipt-deployed").textContent = String(economy.purchases);
      get("receipt-lost").textContent = String(economy.losses);
      get("receipt-spent").textContent = String(economy.spent);
      for (const source of [
        "supply",
        "growth",
        "bounties",
        "calls",
        "salvage",
      ] as const)
        get(`receipt-${source}`).textContent = `+${economy[source]}`;
      get("receipt-purchases").textContent = `−${economy.spent}`;
      get("receipt-balance").textContent = String(state.credits);
      start.innerHTML =
        '<span>Play again</span><span aria-hidden="true">↗</span>';
      note.textContent =
        state.phase === "won"
          ? "Same frontier. A new strategy."
          : "Cover every lane, then add TARS or plasma before the plated wave.";
      if (
        campaignMode &&
        mission.order === CAMPAIGN_ORDER.length &&
        state.phase === "won"
      )
        note.textContent = "Chapter one complete. All six frontiers secured.";
      if (hard)
        note.textContent =
          "Hard prototype · Results are not saved. Play again, or choose Normal in Mission control.";
      announce(
        state.phase === "won"
          ? "Mission complete. The outpost is safe."
          : "Mission lost. All outpost shields are gone.",
      );
      start.focus();
    }
  }
}

start.addEventListener("click", () => {
  if (!ready || assetBusy) return;
  const { phase } = simulation.snapshot();
  if (phase === "paused") simulation.resume();
  else {
    if (phase === "won" || phase === "lost") {
      simulation.restart();
      directionExplained = false;
    }
    simulation.start();
  }
  focused = true;
  window.scrollTo({ top: 0 });
  render(simulation.snapshot());
  cells[focusIndex].focus();
  announce("Mission started. Deploy your crew and protect all six lanes.");
});
document
  .querySelectorAll<HTMLButtonElement>("[data-tower]")
  .forEach((card) =>
    card.addEventListener("click", () =>
      select(card.dataset.tower as TowerKind),
    ),
  );
get("salvage").addEventListener("click", () =>
  select(selected === "salvage" ? null : "salvage"),
);
function togglePause(): void {
  simulation.togglePause();
  const state = simulation.snapshot();
  render(state);
  if (state.phase === "playing") cells[focusIndex].focus();
}
pause.addEventListener("click", togglePause);
get("speed").addEventListener("click", () => {
  simulation.setSpeed(simulation.snapshot().speed === 1 ? 2 : 1);
  render(simulation.snapshot());
});
get("focus-toggle").addEventListener("click", () => {
  focused = !focused;
  render(simulation.snapshot());
  window.scrollTo({ top: 0 });
});
get("art-toggle").addEventListener("click", () => {
  const nextStyle: ArtStyle =
    artStyle === "expedition" ? "original" : "expedition";
  requestArtwork(
    simulation.snapshot().map,
    nextStyle,
    () => {
      artStyle = nextStyle;
      document.documentElement.classList.toggle(
        "original-art",
        artStyle === "original",
      );
      applyArtwork();
      get("art-toggle").setAttribute(
        "aria-pressed",
        String(artStyle === "original"),
      );
      get("art-toggle").setAttribute(
        "aria-label",
        artStyle === "original" ? "Show expedition art" : "Show original art",
      );
      get("art-toggle").querySelector("span")!.textContent =
        artStyle === "original" ? "Original art" : "Expedition art";
      announce(
        artStyle === "original"
          ? "Original school project art selected. Combat rules are unchanged."
          : "Expedition art selected: three illustrated environments, all nine defenders, and all six alien types.",
      );
    },
    simulation.snapshot().phase === "playing",
  );
});
get("field-zoom").addEventListener("click", () => {
  zoomed = !zoomed;
  get("field-zoom").setAttribute("aria-pressed", String(zoomed));
  get("field-zoom").setAttribute(
    "aria-label",
    zoomed ? "Show battlefield overview" : "Enlarge battlefield",
  );
  get("field-zoom").textContent = zoomed ? "⊖ Overview" : "⊕ Enlarge field";
  render(simulation.snapshot());
});
function callNextWave(): void {
  const upcoming = simulation.snapshot().nextWave;
  const result = simulation.launchNextWave();
  render(simulation.snapshot());
  announce(
    result.ok && upcoming
      ? `${result.message} Remaining waves moved about ${Math.round(upcoming.secondsSaved)}s earlier.`
      : result.message,
  );
  if (result.ok) cells[focusIndex].focus();
}
get("call-wave").addEventListener("click", callNextWave);
function requestArtwork(
  map: MapKind,
  style: ArtStyle,
  apply: () => void,
  resume: boolean,
): void {
  if (assetBusy || !battlefield || !ready) return;
  assetRequest = { map, style, apply, resume };
  simulation.pause();
  get<HTMLDialogElement>("asset-dialog").showModal();
  void loadArtwork();
}
async function loadArtwork(): Promise<void> {
  const request = assetRequest;
  if (!request || !battlefield) return;
  assetBusy = true;
  get("asset-title").textContent =
    request.map !== simulation.snapshot().map
      ? `Preparing ${MAPS[request.map].name}…`
      : `Preparing ${request.style === "original" ? "original" : "Expedition"} artwork…`;
  get("asset-message").textContent =
    "Your mission is paused. Only missing artwork will download.";
  get("asset-progress").hidden = false;
  get("asset-retry").hidden = true;
  get("asset-cancel").hidden = true;
  render(simulation.snapshot());
  try {
    await battlefield.prepare(request.map, request.style);
    request.apply();
    finishArtwork();
  } catch {
    // Successfully loaded textures remain cached; retry only fetches missing files.
    get("asset-title").textContent = "Artwork did not arrive.";
    get("asset-message").textContent =
      "Your current mission is safe and paused. Retry, or keep its current artwork and destination.";
    get("asset-progress").hidden = true;
    get("asset-retry").hidden = false;
    get("asset-cancel").hidden = false;
    get("asset-retry").focus();
  }
}
function finishArtwork(): void {
  const request = assetRequest;
  assetRequest = null;
  assetBusy = false;
  get<HTMLDialogElement>("asset-dialog").close();
  if (request?.resume && !document.hidden) simulation.resume();
  render(simulation.snapshot());
  if (simulation.snapshot().phase === "playing") cells[focusIndex].focus();
  else start.focus();
}
get("asset-retry").addEventListener("click", () => void loadArtwork());
get("asset-cancel").addEventListener("click", () => {
  finishArtwork();
  announce("Kept the current mission and artwork.");
});
get("asset-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  if (!get("asset-cancel").hidden) finishArtwork();
});
function applyArtwork(): void {
  document
    .querySelectorAll<HTMLElement>("[data-art-tower]")
    .forEach((portrait) => {
      const kind = portrait.dataset.artTower as TowerKind;
      const artwork =
        artStyle === "expedition" ? EXPEDITION_TOWERS[kind] : undefined;
      portrait.style.backgroundImage = `url("${base}art/${artwork?.file ?? `${TOWERS[kind].sprite}-idle.png`}")`;
      portrait.classList.toggle("expedition-portrait", Boolean(artwork));
    });
  document
    .querySelectorAll<HTMLElement>("[data-art-enemy]")
    .forEach((portrait) => {
      const kind = portrait.dataset.artEnemy as EnemyKind;
      const artwork =
        artStyle === "expedition" ? EXPEDITION_ENEMIES[kind] : undefined;
      portrait.style.backgroundImage = `url("${base}art/${artwork?.file ?? `${ENEMIES[kind].sprite}-walk.png`}")`;
      portrait.classList.toggle("expedition-portrait", Boolean(artwork));
    });
  for (const map of Object.keys(MAPS) as MapKind[])
    document.querySelector<HTMLImageElement>(`[data-map="${map}"] img`)!.src =
      `${base}art/${artStyle === "expedition" ? EXPEDITION_ENVIRONMENTS[map].file : `${MAPS[map].background}.webp`}`;
}
applyArtwork();
let sound = false;
get("sound-toggle").addEventListener("click", () => {
  sound = !sound;
  void audio.setEnabled(sound);
  get("sound-toggle").setAttribute("aria-pressed", String(sound));
  get("sound-toggle").querySelector("span")!.textContent = sound
    ? "Sound on"
    : "Sound off";
});
get("motion-toggle").addEventListener("click", () => {
  reducedMotion = !reducedMotion;
  storedMotion = reducedMotion;
  applyMotion();
  try {
    localStorage.setItem("ava-reduced-motion", String(reducedMotion));
  } catch {
    /* Optional preferences. */
  }
});
function applyMotion(): void {
  document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  get("motion-toggle").setAttribute("aria-pressed", String(reducedMotion));
}
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
motionQuery.addEventListener("change", (event) => {
  if (storedMotion === null) {
    reducedMotion = event.matches;
    applyMotion();
  }
});
applyMotion();

let resumeAfterDialog = false;
function openDialog(id: string): void {
  resumeAfterDialog = simulation.snapshot().phase === "playing";
  simulation.pause();
  render(simulation.snapshot());
  get<HTMLDialogElement>(id).showModal();
}
function closeDialog(dialog: HTMLDialogElement): void {
  dialog.close();
}
for (const id of [
  "guide-dialog",
  "credits-dialog",
  "restart-dialog",
  "map-dialog",
  "campaign-dialog",
]) {
  const dialog = get<HTMLDialogElement>(id);
  dialog.addEventListener("close", () => {
    if (document.querySelector("dialog[open]")) return;
    if (resumeAfterDialog && !document.hidden) simulation.resume();
    resumeAfterDialog = false;
    render(simulation.snapshot());
  });
  dialog
    .querySelectorAll<HTMLElement>("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => closeDialog(dialog)),
    );
}
function showSaveWarning(): void {
  const notice = get("save-warning");
  if (notice.textContent !== campaignSave.warning)
    notice.textContent = campaignSave.warning;
  notice.hidden = !campaignSave.warning;
}
const campaignBoard = new CampaignBoard((id) => {
  if (isUnlocked(campaignSave.progress, id)) campaignBoard.review(id);
});
function updateCampaign(): void {
  const state = simulation.snapshot();
  campaignBoard.update(
    campaignSave.progress,
    campaignSave.warning,
    state.phase === "playing" || state.phase === "paused",
    MISSIONS[state.mission].title,
  );
}
function openCampaign(): void {
  updateCampaign();
  campaignBoard.overview();
  openDialog("campaign-dialog");
  get("campaign-title").focus();
}
function swapDialog(from: string, to: string): void {
  const resume = resumeAfterDialog;
  resumeAfterDialog = false;
  get<HTMLDialogElement>(from).close();
  get<HTMLDialogElement>(to).showModal();
  // Dialog close events are asynchronous: don't let the departing dialog resume this one.
  queueMicrotask(() => {
    resumeAfterDialog = resume;
  });
}
function prepareCampaign(id: MissionId): void {
  if (!isUnlocked(campaignSave.progress, id) || !ready || assetBusy) return;
  const difficulty = campaignBoard.difficulty;
  const resume = resumeAfterDialog;
  resumeAfterDialog = false;
  get<HTMLDialogElement>("campaign-dialog").close();
  requestArtwork(
    MISSIONS[id].environment,
    artStyle,
    () => {
      simulation.restart();
      simulation.chooseMission(id);
      if (difficulty === "hard") simulation.chooseDifficulty("hard");
      campaignMode = true;
      completion = null;
      lastWave = 0;
      lastPhase = "";
      directionExplained = false;
      focused = false;
      select("astro");
      announce(
        `${MISSIONS[id].title} prepared. Review your briefing, then begin.`,
      );
    },
    resume,
  );
}
get("campaign-nav").addEventListener("click", openCampaign);
get("campaign-entry").addEventListener("click", openCampaign);
get("campaign-return").addEventListener("click", openCampaign);
get("campaign-next").addEventListener("click", () => {
  const next = CAMPAIGN_ORDER[MISSIONS[simulation.snapshot().mission].order];
  if (!next) return;
  openCampaign();
  campaignBoard.review(next);
});
get("campaign-switch").addEventListener("click", () => {
  updateCampaign();
  campaignBoard.overview();
  swapDialog("map-dialog", "campaign-dialog");
  get("campaign-title").focus();
});
get("campaign-standalone").addEventListener("click", () => {
  get("map-warning").textContent =
    "Standalone play does not award campaign stars. Choosing a destination resets the current deployment; closing keeps it.";
  swapDialog("campaign-dialog", "map-dialog");
});
get("campaign-back").addEventListener("click", () => campaignBoard.overview());
get("campaign-launch").addEventListener("click", () => {
  if (campaignBoard.selected) prepareCampaign(campaignBoard.selected);
});
get("campaign-reset").addEventListener("click", () =>
  get<HTMLDialogElement>("campaign-reset-dialog").showModal(),
);
get("campaign-reset-cancel").addEventListener("click", () =>
  get<HTMLDialogElement>("campaign-reset-dialog").close(),
);
get("campaign-reset-confirm").addEventListener("click", () => {
  campaignSave.reset();
  // Refresh an existing outcome without allowing its already-observed win to save again.
  completion = null;
  lastPhase = "";
  lastUiSignature = "";
  campaignBoard.overview();
  updateCampaign();
  showSaveWarning();
  get<HTMLDialogElement>("campaign-reset-dialog").close();
  get("campaign-reset").focus();
});
get("map-open").addEventListener("click", () => {
  if (campaignMode) {
    openCampaign();
    return;
  }
  get("map-warning").textContent =
    simulation.snapshot().phase === "ready"
      ? "Each destination has four waves and the full original roster."
      : "Choosing a destination resets your current deployment and progress. Closing this window keeps your mission.";
  openDialog("map-dialog");
});
document.querySelectorAll<HTMLButtonElement>("[data-map]").forEach((card) => {
  card.addEventListener("click", () => {
    const map = card.dataset.map as MapKind;
    const resume = resumeAfterDialog;
    resumeAfterDialog = false;
    closeDialog(get("map-dialog"));
    requestArtwork(
      map,
      artStyle,
      () => {
        if (simulation.snapshot().phase !== "ready") simulation.restart();
        const result = simulation.chooseMap(map);
        campaignMode = false;
        completion = null;
        lastWave = 0;
        lastPhase = "";
        select("astro");
        announce(result.message);
      },
      resume,
    );
  });
});
get("guide-open").addEventListener("click", () => openDialog("guide-dialog"));
get("play-guide").addEventListener("click", () => openDialog("guide-dialog"));
get("credits-open").addEventListener("click", () =>
  openDialog("credits-dialog"),
);
get("restart").addEventListener("click", () => {
  if (simulation.snapshot().phase === "ready") return;
  openDialog("restart-dialog");
});
get("restart-cancel").addEventListener("click", () =>
  closeDialog(get("restart-dialog")),
);
get("restart-confirm").addEventListener("click", () => {
  resumeAfterDialog = false;
  simulation.restart();
  directionExplained = false;
  lastWave = 0;
  select("astro");
  closeDialog(get("restart-dialog"));
  render(simulation.snapshot());
  start.focus();
});

document.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    assetBusy ||
    document.querySelector("dialog[open]")
  )
    return;
  const key = event.key.toLowerCase();
  if (event.repeat && ["n", "p", "x"].includes(key)) return;
  if (/^[1-9]$/.test(key)) {
    event.preventDefault();
    select(towerKinds[Number(key) - 1]);
  } else if (key === "p") {
    event.preventDefault();
    togglePause();
  } else if (key === "n") {
    event.preventDefault();
    callNextWave();
  } else if (key === "x") {
    event.preventDefault();
    select(selected === "salvage" ? null : "salvage");
  } else if (key === "escape") select(null);
});
document.addEventListener("visibilitychange", () => {
  // Any dialog/transition backgrounded during a pause requires explicit resume.
  if (document.hidden) {
    resumeAfterDialog = false;
    if (assetRequest) assetRequest.resume = false;
  }
  if (document.hidden && simulation.snapshot().phase === "playing") {
    simulation.pause();
    render(simulation.snapshot());
    announce("Mission paused while you were away.");
  }
});

async function initialize(): Promise<void> {
  try {
    // Independent downloads overlap; artwork still waits for validated metadata.
    const [art, { mountBattlefield }] = await Promise.all([
      fetch(`${base}art/manifest.json`).then((response) => {
        if (!response.ok) throw new Error("Asset manifest unavailable");
        return response.json() as Promise<ArtManifest>;
      }),
      import("./battlefield"),
    ]);
    if (
      !Array.isArray(art.sprites) ||
      !Array.isArray(art.backgrounds) ||
      !Array.isArray(art.images)
    )
      throw new Error("Invalid asset manifest");
    battlefield = mountBattlefield({
      parent: get("phaser"),
      simulation,
      art,
      selection: () => selected,
      reducedMotion: () => reducedMotion,
      artStyle: () => artStyle,
      cursor: () => cursor,
      onState: render,
      onEvent: (event) => {
        if (event.type === "shot") audio.play("shot", event.kind === "zeus");
        else if (event.type === "income" || event.type === "wave-called")
          audio.play("income");
        else if (event.type === "defender-lost" && event.kind)
          announce(`${TOWERS[event.kind].name} lost in lane ${event.row + 1}.`);
        else if (event.type === "breach") {
          audio.play("breach");
          const state = simulation.snapshot();
          // One event-driven notice per breach; outcomes have their own announcement.
          if (state.phase === "playing")
            announce(
              `Breach in lane ${event.row + 1}. ${state.integrity} ${state.integrity === 1 ? "shield remains" : "shields remain"}. Check that lane's firing coverage.`,
            );
        }
      },
      onReady: () => {
        ready = true;
        start.disabled = false;
        start.innerHTML =
          '<span>Begin mission</span><span aria-hidden="true">↗</span>';
        render(simulation.snapshot());
      },
      onProgress: (fraction) => {
        if (!loadError && !ready)
          start.querySelector("span")!.textContent =
            `Loading artwork · ${Math.round(fraction * 100)}%`;
      },
      onError: loadFailed,
    });
  } catch (error) {
    console.error("Mission initialization failed", error);
    loadFailed();
  }
}
function loadFailed(): void {
  loadError = true;
  ready = false;
  render(simulation.snapshot());
  overlay.hidden = false;
  grid.inert = true;
  start.disabled = false;
  start.innerHTML =
    '<span>Retry loading</span><span aria-hidden="true">↻</span>';
  get("overlay-title").textContent = "We lost the transmission.";
  get("overlay-body").textContent =
    "Some mission resources could not load. Check your connection and try again.";
  start.addEventListener("click", () => location.reload(), { once: true });
}
grid.inert = true;
void initialize();
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    battlefield?.destroy();
    audio.destroy();
  });
