import { actionArrow } from "../icons";
import { ENVIRONMENTS } from "../game/environments";
import type { MapKind } from "../game/environments";
import { CAMPAIGN_ORDER, MISSIONS } from "../game/missions";
import type { MissionId } from "../game/missions";
import { EXPEDITION_ENVIRONMENTS } from "../game/art";
import { campaignSummary, isUnlocked } from "./progress";
import type { Progress } from "./progress";
import { HARD_DESCRIPTION } from "../game/challenges";
import type { Difficulty } from "../game/challenges";

// Trusted authored content only. Saved values are assigned through textContent below.
export const campaignMarkup = `
<dialog id="campaign-dialog" aria-labelledby="campaign-title">
  <button class="dialog-close" data-close aria-label="Close mission control">×</button>
  <p class="eyebrow">EXPEDITION / CHAPTER ONE</p>
  <h2 id="campaign-title" tabindex="-1">Chart a path.<br>Hold every frontier.</h2>
  <p id="campaign-progress" role="status"></p>
  <p class="campaign-rule">One shield, one star. Win with all three for three stars. Your best rating stays with you.</p>
  <p id="campaign-save-warning" class="save-warning" role="status" hidden></p>
  <p id="campaign-active-note"></p>
  <div id="campaign-sectors">${(Object.keys(ENVIRONMENTS) as MapKind[])
    .map(
      (environment) => `
    <section class="campaign-sector" aria-labelledby="sector-${environment}">
      <div class="sector-heading"><img data-sector-art="${environment}" alt="" width="144" height="81" decoding="async"><div><span class="micro-label">SECTOR ${ENVIRONMENTS[environment].number}</span><h3 id="sector-${environment}">${ENVIRONMENTS[environment].name}</h3></div></div>
      <div class="campaign-cards">${CAMPAIGN_ORDER.filter(
        (id) => MISSIONS[id].environment === environment,
      )
        .map((id) => {
          const mission = MISSIONS[id];
          return `<article class="campaign-card" data-mission-card="${id}"><div class="campaign-card-top"><span class="mission-index">${String(mission.order).padStart(2, "0")}</span><span id="rating-${id}" class="card-rating"></span></div><h4>${mission.title}</h4><p>${mission.description}</p><p id="state-${id}" class="card-state"></p><button data-review="${id}" class="secondary-button" aria-describedby="state-${id}"><span data-review-label>Review mission ${String(mission.order).padStart(2, "0")}</span> ${actionArrow}</button></article>`;
        })
        .join("")}</div>
    </section>`,
    )
    .join("")}</div>
  <section id="campaign-briefing" class="campaign-briefing" aria-labelledby="briefing-title" hidden>
    <p id="briefing-number" class="eyebrow"></p><h3 id="briefing-title" tabindex="-1"></h3>
    <p id="briefing-copy"></p><p id="briefing-tactics"></p>
    <div id="difficulty-choice" class="difficulty-choice" hidden><label for="difficulty">Difficulty</label><select id="difficulty" aria-describedby="difficulty-description"><option value="normal">Normal</option><option value="hard">Hard challenge · prototype</option></select><p id="difficulty-description"></p></div>
    <p class="campaign-rule">Four waves · 230 starting credits · 3 shields · all nine defenders. No permanent upgrades.</p>
    <p id="briefing-warning"></p>
    <div class="dialog-actions"><button id="campaign-back" class="secondary-button">Back to missions</button><button id="campaign-launch" class="primary-button"><span id="campaign-launch-label">Prepare mission</span> ${actionArrow}</button></div>
  </section>
  <div class="campaign-footer"><button id="campaign-standalone" class="secondary-button">Standalone destinations ${actionArrow}</button><button id="campaign-reset" class="nav-button">Reset campaign progress</button></div>
  <p class="campaign-rule">Progress is saved only in this browser. In-progress missions are not saved.</p>
</dialog>
<dialog id="campaign-reset-dialog" aria-labelledby="campaign-reset-title"><h2 id="campaign-reset-title">Clear your expedition record?</h2><p>Delete campaign completions, stars and saved best results in this browser. Sound and reduced-motion settings stay as they are. This cannot be undone.</p><div class="dialog-actions"><button id="campaign-reset-cancel" class="secondary-button" autofocus>Keep progress</button><button id="campaign-reset-confirm" class="primary-button">Reset campaign progress</button></div></dialog>`;

export class CampaignBoard {
  selected: MissionId | null = null;
  private get = <T extends HTMLElement = HTMLElement>(id: string) =>
    document.getElementById(id) as T;
  constructor(onReview: (id: MissionId) => void) {
    this.get("difficulty").addEventListener("change", () =>
      this.describeDifficulty(),
    );
    for (const id of CAMPAIGN_ORDER)
      this.get<HTMLButtonElement>(`state-${id}`)
        .closest("article")!
        .querySelector("button")!
        .addEventListener("click", () => onReview(id));
  }
  update(
    progress: Progress,
    warning: string,
    active: boolean,
    currentTitle: string,
  ): void {
    const summary = campaignSummary(progress);
    this.get("campaign-progress").textContent =
      `${summary.completed} / 6 missions complete · ${summary.stars} / 18 stars${summary.next ? ` · Next: ${MISSIONS[summary.next].title}` : " · Chapter one complete. Every frontier secured."}`;
    const notice = this.get("campaign-save-warning");
    notice.hidden = !warning;
    notice.textContent = warning;
    this.get("campaign-active-note").textContent = active
      ? `${currentTitle} is paused. Closing mission control keeps your deployment. Preparing another mission abandons it after confirmation below.`
      : "Choose an available mission to review its briefing. Original destinations are always available in standalone play.";
    for (const id of CAMPAIGN_ORDER) {
      const result = progress.best[id];
      const unlocked = isUnlocked(progress, id);
      this.get(`rating-${id}`).textContent = result
        ? `${"★".repeat(result.stars)}${"☆".repeat(3 - result.stars)} · Best ${result.stars}/3`
        : "☆☆☆ · Unrated";
      this.get(`state-${id}`).textContent = result
        ? result.stars < 3
          ? "Complete · Replay to protect more shields"
          : "Complete · All three stars. Try a different formation"
        : unlocked
          ? "Available · Ready to explore"
          : `Locked · Complete ${MISSIONS[MISSIONS[id].prerequisite!].title} to unlock`;
      const card = document.querySelector<HTMLElement>(
        `[data-mission-card="${id}"]`,
      )!;
      card.classList.toggle("locked-mission", !unlocked);
      card.querySelector<HTMLButtonElement>("button")!.disabled = !unlocked;
      card.querySelector<HTMLElement>("[data-review-label]")!.textContent =
        `${result ? "Replay" : "Review"} mission ${String(MISSIONS[id].order).padStart(2, "0")}`;
    }
    this.get("briefing-warning").textContent = active
      ? "This starts a fresh deployment. Your current mission will be abandoned. Saved stars are kept."
      : "Prepare the battlefield, then choose Begin mission when ready.";
    this.get("campaign-launch-label").textContent = active
      ? "Abandon current mission & prepare"
      : "Prepare mission";
    const base = import.meta.env.BASE_URL;
    document
      .querySelectorAll<HTMLImageElement>("[data-sector-art]")
      .forEach((image) => {
        const file =
          EXPEDITION_ENVIRONMENTS[image.dataset.sectorArt as MapKind].file;
        if (!image.getAttribute("src")) image.src = `${base}art/${file}`;
      });
  }
  review(id: MissionId): void {
    this.selected = id;
    const mission = MISSIONS[id];
    this.get("campaign-sectors").hidden = true;
    this.get("campaign-briefing").hidden = false;
    this.get("briefing-number").textContent =
      `MISSION ${String(mission.order).padStart(2, "0")} / ${ENVIRONMENTS[mission.environment].name}`;
    this.get("briefing-title").textContent = mission.title;
    this.get("briefing-copy").textContent = mission.briefing;
    this.get("briefing-tactics").textContent = mission.tactics;
    this.get("difficulty-choice").hidden = id !== "first-contact";
    this.get<HTMLSelectElement>("difficulty").value = "normal";
    this.describeDifficulty();
    this.get("briefing-title").focus();
  }
  get difficulty(): Difficulty {
    return this.selected === "first-contact" &&
      this.get<HTMLSelectElement>("difficulty").value === "hard"
      ? "hard"
      : "normal";
  }
  private describeDifficulty(): void {
    this.get("difficulty-description").textContent =
      this.difficulty === "hard"
        ? HARD_DESCRIPTION
        : "The established campaign. Shield-based stars and unlocks are saved. The optional Hard prototype changes First Contact only.";
  }
  overview(): void {
    this.get("campaign-sectors").hidden = false;
    this.get("campaign-briefing").hidden = true;
    const id = this.selected;
    this.selected = null;
    if (id)
      document
        .querySelector<HTMLButtonElement>(`[data-review="${id}"]`)!
        .focus();
  }
}
