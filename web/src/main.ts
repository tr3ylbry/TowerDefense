import "./style.css";
import { COLS, ENEMIES, isBlocked, MAPS, ROWS, TOWERS } from "./game/content";
import type { MapKind, TowerKind } from "./game/content";
import { Simulation } from "./game/simulation";
import type { Snapshot } from "./game/simulation";
import { AudioBus } from "./audio";
import type { ArtManifest } from "./battlefield";

const app = document.querySelector<HTMLDivElement>("#app")!;
const simulation = new Simulation();
const audio = new AudioBus();
const towerKinds = Object.keys(TOWERS) as TowerKind[];
const base = import.meta.env.BASE_URL;
let selected: TowerKind | "salvage" | null = "astro";
let cursor: { row: number; col: number } | null = null;
let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let destroyBattlefield: (() => void) | undefined;
let lastPhase = "";
let lastWave = 0;
let lastMap = "";
let ready = false;
let loadError = false;
let lastUiSignature = "";

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
app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="${base}" aria-label="Astronauts vs Aliens home"><span class="brand-icon">${helmet}</span><span>ASTRONAUTS<span class="wordmark-sub">vs ALIENS<span class="edition"> BROWSER EDITION</span></span></span></a>
    <nav aria-label="Main"><span class="nav-active">The mission</span><button id="guide-open" class="nav-button">Field guide <span>↗</span></button><a href="https://github.com/tr3ylbry/TowerDefense/tree/school-project-2019" target="_blank" rel="noopener noreferrer">The original <span>↗</span></a></nav>
    <span class="lab-mark">TREYDMARK<span>EXPERIMENTS IN PLAY</span></span>
  </header>
  <main id="mission">
    <section class="mission-heading" aria-labelledby="mission-title"><div><p class="eyebrow"><span class="signal-dot"></span> EXPEDITION 001 <span class="eyebrow-line"></span> ORBITAL DEFENSE</p><h1 id="mission-title">A little space.<br class="mobile-break"> A lot to defend<span>.</span></h1></div><p class="mission-intro">A familiar crew. An unfamiliar frontier.<br>Build your defenses and hold the line.</p></section>
    <div class="mission-bar"><div class="location"><span id="location-number" class="location-number">01</span><div><span class="micro-label">YOUR DESTINATION</span><h2 id="location-name">The Canyon</h2></div><span id="location-tag" class="location-tag">FIRST CONTACT</span><button id="map-open" class="destination-button" aria-haspopup="dialog">Change destination ↗</button></div><div class="mission-tools"><button id="sound-toggle" aria-label="Toggle sound effects" class="tool" aria-pressed="false" title="Toggle synthesized sound effects">♪ <span>Sound off</span></button><button id="motion-toggle" aria-label="Reduce decorative animation" class="tool" aria-pressed="${reducedMotion}" title="Reduce decorative animation">◌ <span>Reduced motion</span></button><button id="restart" aria-label="Restart" class="tool" title="Restart mission">↻ <span>Restart</span></button></div></div>
    <p id="terrain-note" class="terrain-note">Open terrain. All nine defenders available.</p>
    <div class="play-layout">
      <section class="battle-panel" aria-label="Mission control">
        <div class="telemetry"><div class="telemetry-item"><span class="micro-label">SPACEBUCKS</span><strong class="credits"><span aria-hidden="true">◈</span> <span id="credits">230</span></strong></div><div class="telemetry-item"><span class="micro-label">OUTPOST INTEGRITY</span><strong id="integrity" class="integrity" aria-label="3 shields remaining">◆ ◆ ◆</strong></div><div class="telemetry-item wave-item"><span class="micro-label">WAVE <span id="wave-number">0</span> / ${MAPS.canyon.waves.length}</span><span class="wave-track" aria-hidden="true">${MAPS.canyon.waves.map((_, i) => `<i data-wave="${i + 1}"></i>`).join("")}</span></div><div class="time-controls"><button id="speed" aria-label="Switch to double speed">1×</button><button id="pause" disabled aria-label="Pause mission">Ⅱ <span>Pause</span></button></div></div>
        <div class="battle-scroll"><div class="board-stack"><div id="phaser" aria-hidden="true"></div><div id="battle-grid" class="battle-grid" role="grid" aria-label="Battlefield, 6 lanes and 9 columns" aria-describedby="grid-help"></div><div id="overlay" class="mission-overlay"><div class="overlay-card"><span class="overline">A TRANSMISSION FROM THE FRONTIER</span><div class="overlay-orbit">${helmet}</div><h2 id="overlay-title">Home is behind you.<br>Hold the line.</h2><p id="overlay-body">Defend the canyon through four incoming waves.<br>Deploy your crew. Keep the outpost standing.</p><button id="start" class="primary-button" disabled><span>Preparing the mission…</span> <span aria-hidden="true">↗</span></button><p id="overlay-note" class="overlay-note">Pick a defender, then choose a tile. That's your first move.</p></div></div></div></div>
        <div class="field-status"><span id="status"><span class="signal-dot"></span> Awaiting your command</span><span id="countdown">4 WAVES · 3 SHIELDS · ONE OUTPOST</span></div>
        <p id="grid-help" class="grid-help"><span><kbd>1</kbd>–<kbd>9</kbd> select crew</span><span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> move · <kbd>Enter</kbd> deploy</span><span><kbd>P</kbd> pause · <kbd>X</kbd> salvage</span><span class="touch-help">Swipe the field or rotate for a wider view.</span></p>
      </section>
      <aside class="crew-panel" aria-labelledby="crew-title"><div class="crew-heading"><div><span class="micro-label">BUILD YOUR DEFENSE</span><h2 id="crew-title">Meet your crew<span> / 09</span></h2></div><span class="tiny-cross">✳</span></div><div class="roster-hint">9 defenders · scroll to explore · keys 1–9</div><div class="crew-list" role="group" aria-label="Defender roster">${towerKinds
        .map((kind, i) => {
          const tower = TOWERS[kind];
          return `<button class="crew-card ${kind === "astro" ? "selected" : ""}" data-tower="${kind}" aria-pressed="${kind === "astro"}" aria-label="${tower.name}, ${tower.cost} credits. ${tower.description}"><span class="portrait" style="background-image:url('${base}art/${tower.sprite}-idle.png')"></span><span class="crew-info"><span class="crew-role">${tower.role}</span><strong>${tower.name}</strong><span class="crew-description">${tower.description}</span></span><span class="crew-price">◈ ${tower.cost}<kbd>${i + 1}</kbd></span></button>`;
        })
        .join(
          "",
        )}</div><button id="salvage" class="salvage-button" aria-pressed="false"><span>⌁</span><span>Salvage a defender<small>Recover 40% of its cost</small></span><kbd>X</kbd></button><div class="field-tip"><span class="micro-label">A NOTE FROM MISSION CONTROL</span><p>Build your economy early.<br><strong>Bushes and Trees keep the crew growing.</strong></p><span class="tip-line"></span><span class="income-note">Outpost supply: +30 credits / 5 sec</span></div></aside>
    </div>
    <div class="dispatch" id="announcement" role="status" aria-live="polite" aria-atomic="true">Select a crew member to get started.</div>
    <footer><span><span class="footer-dot"></span> MADE FOR THE JOY OF BUILDING.</span><span>A school project, reimagined. <button id="credits-open">Meet the original team ↗</button></span></footer>
  </main>
  <dialog id="guide-dialog" aria-labelledby="guide-title"><button class="dialog-close" data-close aria-label="Close field guide">×</button><span class="eyebrow">FIELD GUIDE / 001</span><h2 id="guide-title">Every outpost starts<br>with a good plan.</h2><ol><li><strong>Deploy.</strong> Choose one of nine crew cards, then click or tap an empty tile. Explosive Astro Joe and Moon Zeus hit clusters; the Falcon fires three rounds into one lane.</li><li><strong>Fund the mission.</strong> Money Bushes produce 25 credits every 6 seconds; Money Trees produce 60 every 8. The outpost provides 30 every 5 seconds.</li><li><strong>Buy time.</strong> Asteroids block enemies. Place attackers behind them. Acid pools on Sky Bridge and The Nest prevent deployment, but aliens can cross them. Salvage returns 40% of a defender's cost.</li><li><strong>Hold the line.</strong> Clear four waves. An alien reaching the left edge costs one shield. Lose all three and the outpost falls.</li></ol><p>Use number keys 1–9 to select crew. Tab to the field, use arrow keys to move, and Enter or Space to place. P pauses, X selects salvage, and Escape cancels selection. Moving to another tab pauses the mission.</p><h3 class="guide-subtitle">Know the invaders</h3><div class="alien-guide">${Object.values(
    ENEMIES,
  )
    .map(
      (enemy) =>
        `<article><span class="alien-portrait" style="background-image:url('${base}art/${enemy.sprite}-walk.png')" aria-hidden="true"></span><div><h4>${enemy.name}</h4><p>${enemy.description}</p><small>${enemy.health} health · ${enemy.reward} credit bounty</small></div></article>`,
    )
    .join(
      "",
    )}</div><button class="primary-button" data-close>Back to the frontier ↗</button></dialog>
  <dialog id="credits-dialog" aria-labelledby="credits-title"><button class="dialog-close" data-close aria-label="Close credits">×</button><span class="eyebrow">THE ORIGINAL CREW / 2019</span><h2 id="credits-title">Built together.<br>Explored further.</h2><p>The original Astronauts vs Aliens was created for CSC 335 by <strong>Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau.</strong></p><p>This browser edition is Trey's independent continuation, exploring animation, interaction, and game systems. Original art is retained from the school project; its external provenance is still being documented.</p><a class="primary-button" href="https://github.com/tr3ylbry/TowerDefense/tree/school-project-2019" target="_blank" rel="noopener noreferrer">Explore the original project ↗</a></dialog>
  <dialog id="map-dialog" aria-labelledby="map-title"><button class="dialog-close" data-close aria-label="Close destinations">×</button><span class="eyebrow">THREE ORIGINAL FRONTIERS</span><h2 id="map-title">Choose your destination.</h2><p id="map-warning">Each destination has four waves and the full original roster.</p><div class="destination-list">${(
    Object.keys(MAPS) as MapKind[]
  )
    .map((kind) => {
      const map = MAPS[kind];
      return `<button class="destination-card" data-map="${kind}" aria-label="Choose ${map.name}"><img src="${base}art/${map.background}.webp" alt="" width="144" height="81"><span><span class="micro-label">${map.number} / ${map.tag}</span><strong>${map.name}</strong><span>${map.description}</span></span><span aria-hidden="true">↗</span></button>`;
    })
    .join(
      "",
    )}</div><button class="secondary-button" data-close>Keep current destination</button></dialog>
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
        if (card.offsetTop < roster.scrollTop)
          roster.scrollTop = card.offsetTop;
        else if (
          card.offsetTop + card.offsetHeight >
          roster.scrollTop + roster.clientHeight
        )
          roster.scrollTop =
            card.offsetTop + card.offsetHeight - roster.clientHeight;
      }
    });
  get("salvage").setAttribute("aria-pressed", String(kind === "salvage"));
  announce(
    kind === "salvage"
      ? "Salvage selected. Choose a defender to recover 40% of its cost."
      : kind
        ? `${TOWERS[kind].name} selected. Choose an empty tile.`
        : "Selection cleared.",
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
    });
    button.addEventListener("pointerenter", () => {
      cursor = { row, col };
    });
    button.addEventListener("pointerleave", () => {
      if (document.activeElement !== button) cursor = null;
    });
    button.addEventListener("blur", () => {
      cursor = null;
    });
    button.addEventListener("click", () => {
      if (!selected) {
        announce("Choose a defender from your crew first.");
        return;
      }
      const result =
        selected === "salvage"
          ? simulation.remove(row, col)
          : simulation.place(selected, row, col);
      announce(result.message);
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
  const signature = JSON.stringify([
    ready,
    state.map,
    state.phase,
    Math.floor(state.elapsed),
    state.credits,
    state.integrity,
    state.kills,
    state.wave,
    state.speed,
    state.enemies.length,
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
  const map = MAPS[state.map];
  document.title = `Astronauts vs Aliens — ${map.name}`;
  grid.inert = state.phase !== "playing";
  get("location-name").textContent = map.name;
  get("location-number").textContent = map.number;
  get("location-tag").textContent = map.tag;
  get("terrain-note").textContent = map.description;
  document.querySelectorAll<HTMLElement>("[data-map]").forEach((card) => {
    card.setAttribute("aria-pressed", String(card.dataset.map === state.map));
  });
  get("credits").textContent = String(state.credits);
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
  pause.disabled = state.phase !== "playing" && state.phase !== "paused";
  pause.innerHTML =
    state.phase === "paused" ? "▷ <span>Resume</span>" : "Ⅱ <span>Pause</span>";
  pause.setAttribute(
    "aria-label",
    state.phase === "paused" ? "Resume mission" : "Pause mission",
  );
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
    const label = `Lane ${Math.floor(i / COLS) + 1}, tile ${(i % COLS) + 1}, ${blocked ? "acid pool, deployment blocked" : tower ? `${TOWERS[tower.kind].name}, ${Math.ceil(tower.health)} health` : "empty"}`;
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
  get("countdown").textContent =
    state.phase === "playing"
      ? state.nextWaveIn !== null
        ? `NEXT WAVE IN ${state.nextWaveIn}s`
        : `${state.enemies.length} HOSTILES REMAINING`
      : `${state.kills} HOSTILES CLEARED`;
  if (state.wave !== lastWave) {
    if (state.wave > 0)
      announce(`Wave ${state.wave}: ${map.waves[state.wave - 1].title}.`);
    lastWave = state.wave;
  }
  if (!loadError && (state.phase !== lastPhase || state.map !== lastMap)) {
    lastPhase = state.phase;
    lastMap = state.map;
    overlay.hidden = state.phase === "playing";
    overlay.classList.toggle("compact-overlay", state.phase === "paused");
    const title = get("overlay-title");
    const body = get("overlay-body");
    const note = get("overlay-note");
    if (state.phase === "ready") {
      title.innerHTML = "Home is behind you.<br>Hold the line.";
      body.textContent = `${map.name} · ${map.waves.length} incoming waves. ${map.description}`;
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
      start.innerHTML =
        '<span>Play again</span><span aria-hidden="true">↗</span>';
      note.textContent =
        state.phase === "won"
          ? "Same frontier. A new strategy."
          : "Try placing Astro Joe in each lane and keeping income units behind the line.";
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
  if (!ready) return;
  const { phase } = simulation.snapshot();
  if (phase === "paused") simulation.resume();
  else {
    if (phase === "won" || phase === "lost") simulation.restart();
    simulation.start();
  }
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
pause.addEventListener("click", () => {
  simulation.togglePause();
  render(simulation.snapshot());
});
get("speed").addEventListener("click", () => {
  simulation.setSpeed(simulation.snapshot().speed === 1 ? 2 : 1);
  render(simulation.snapshot());
});
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
]) {
  const dialog = get<HTMLDialogElement>(id);
  dialog.addEventListener("close", () => {
    if (resumeAfterDialog) simulation.resume();
    resumeAfterDialog = false;
    render(simulation.snapshot());
  });
  dialog
    .querySelectorAll<HTMLElement>("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => closeDialog(dialog)),
    );
}
get("map-open").addEventListener("click", () => {
  get("map-warning").textContent =
    simulation.snapshot().phase === "ready"
      ? "Each destination has four waves and the full original roster."
      : "Choosing a destination resets your current deployment and progress. Closing this window keeps your mission.";
  openDialog("map-dialog");
});
document.querySelectorAll<HTMLButtonElement>("[data-map]").forEach((card) => {
  card.addEventListener("click", () => {
    resumeAfterDialog = false;
    if (simulation.snapshot().phase !== "ready") simulation.restart();
    const result = simulation.chooseMap(card.dataset.map as MapKind);
    lastWave = 0;
    select("astro");
    closeDialog(get("map-dialog"));
    render(simulation.snapshot());
    announce(result.message);
    start.focus();
  });
});
get("guide-open").addEventListener("click", () => openDialog("guide-dialog"));
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
    document.querySelector("dialog[open]")
  )
    return;
  const key = event.key.toLowerCase();
  if (/^[1-9]$/.test(key)) {
    event.preventDefault();
    select(towerKinds[Number(key) - 1]);
  } else if (key === "p") {
    event.preventDefault();
    simulation.togglePause();
    render(simulation.snapshot());
  } else if (key === "x") {
    event.preventDefault();
    select(selected === "salvage" ? null : "salvage");
  } else if (key === "escape") select(null);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && simulation.snapshot().phase === "playing") {
    simulation.pause();
    render(simulation.snapshot());
    announce("Mission paused while you were away.");
  }
});

async function initialize(): Promise<void> {
  try {
    const response = await fetch(`${base}art/manifest.json`);
    if (!response.ok) throw new Error("Asset manifest unavailable");
    const art = (await response.json()) as ArtManifest;
    if (
      !Array.isArray(art.sprites) ||
      !Array.isArray(art.backgrounds) ||
      !Array.isArray(art.images)
    )
      throw new Error("Invalid asset manifest");
    const { mountBattlefield } = await import("./battlefield");
    destroyBattlefield = mountBattlefield({
      parent: get("phaser"),
      simulation,
      art,
      selection: () => selected,
      reducedMotion: () => reducedMotion,
      cursor: () => cursor,
      onState: render,
      onEvent: (event) => {
        if (event.type === "shot") audio.play("shot", event.kind === "zeus");
        else if (event.type === "income") audio.play("income");
        else if (event.type === "breach") audio.play("breach");
      },
      onReady: () => {
        ready = true;
        start.disabled = false;
        start.innerHTML =
          '<span>Begin mission</span><span aria-hidden="true">↗</span>';
        render(simulation.snapshot());
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
    destroyBattlefield?.();
    audio.destroy();
  });
