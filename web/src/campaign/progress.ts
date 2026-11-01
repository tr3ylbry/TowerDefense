import { CAMPAIGN_ORDER, MISSIONS } from "../game/missions";
import type { MissionId } from "../game/missions";
import type { Simulation, Snapshot } from "../game/simulation";

export type Stars = 1 | 2 | 3;
export interface BestResult {
  stars: Stars;
  shields: Stars;
  duration: number | null;
  kills: number | null;
}
export interface Progress {
  version: 1;
  best: Partial<Record<MissionId, BestResult>>;
}
export const emptyProgress = (): Progress => ({ version: 1, best: {} });
export function isUnlocked(progress: Progress, id: MissionId): boolean {
  const prerequisite = MISSIONS[id].prerequisite;
  return (
    Boolean(progress.best[id]) ||
    prerequisite === null ||
    Boolean(progress.best[prerequisite])
  );
}
export function rating(
  result: Pick<Snapshot, "phase" | "integrity">,
): 0 | Stars {
  return result.phase === "won" &&
    Number.isInteger(result.integrity) &&
    result.integrity >= 1 &&
    result.integrity <= 3
    ? (result.integrity as Stars)
    : 0;
}
export function campaignSummary(progress: Progress) {
  const completed = CAMPAIGN_ORDER.filter((id) => progress.best[id]);
  return {
    completed: completed.length,
    stars: completed.reduce((sum, id) => sum + progress.best[id]!.stars, 0),
    next:
      CAMPAIGN_ORDER.find(
        (id) => !progress.best[id] && isUnlocked(progress, id),
      ) ?? null,
  };
}
export interface Completion {
  mission: MissionId;
  stars: Stars;
  previous: number;
  best: Stars;
}
/** Reads the actual simulation, once per attempt. UI overlays never award completion. */
export class CompletionRecorder {
  private attempt = -1;
  private game: Simulation | null = null;
  private result: Completion | null = null;
  observe(game: Simulation, progress: Progress): Completion | null {
    const state = game.snapshot();
    if (game === this.game && game.attemptId === this.attempt)
      return this.result;
    const stars = rating(state);
    if (
      !stars ||
      state.pendingSpawns ||
      state.enemies.length ||
      !isUnlocked(progress, state.mission)
    )
      return null;
    this.game = game;
    this.attempt = game.attemptId;
    const previous = progress.best[state.mission]?.stars ?? 0;
    if (stars > previous)
      progress.best[state.mission] = {
        stars,
        shields: stars,
        duration: state.elapsed,
        kills: state.kills,
      };
    this.result = {
      mission: state.mission,
      stars,
      previous,
      best: Math.max(previous, stars) as Stars,
    };
    return this.result;
  }
}
