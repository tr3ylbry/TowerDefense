import { MISSIONS } from "../game/missions";
import type { MissionId } from "../game/missions";
import { emptyProgress } from "./progress";
import type { BestResult, Progress, Stars } from "./progress";

export const SAVE_KEY = "ava-campaign";
export const RECOVERY_KEY = "ava-campaign-recovery";
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const stars = (value: unknown): value is Stars =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 3;
const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export function decodeSave(raw: string): {
  progress: Progress;
  recovered: boolean;
  incompatible: boolean;
} {
  const progress = emptyProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { progress, recovered: true, incompatible: false };
  }
  if (!object(data) || data.version !== 1)
    return { progress, recovered: false, incompatible: true };
  let recovered = !object(data.best);
  if (object(data.best))
    for (const [id, value] of Object.entries(data.best)) {
      if (
        !Object.hasOwn(MISSIONS, id) ||
        !object(value) ||
        !stars(value.stars)
      ) {
        recovered = true;
        continue;
      }
      const duration =
        value.duration === null || nonnegative(value.duration)
          ? value.duration
          : null;
      const kills =
        value.kills === null ||
        (nonnegative(value.kills) && Number.isInteger(value.kills))
          ? value.kills
          : null;
      if (
        value.shields !== value.stars ||
        duration !== value.duration ||
        kills !== value.kills
      )
        recovered = true;
      progress.best[id as MissionId] = {
        stars: value.stars,
        shields: value.stars,
        duration,
        kills,
      } as BestResult;
    }
  // Completion records are independent evidence. Keep valid later wins instead of inventing earlier stars.
  return { progress, recovered, incompatible: false };
}

/** Storage failures never interrupt the simulation; incompatible originals stay untouched until reset. */
export class CampaignSave {
  progress = emptyProgress();
  warning = "";
  private storage?: StoragePort;
  private protected = false;
  private lastRead: string | null = null;
  constructor(getStorage: () => StoragePort = () => localStorage) {
    try {
      this.storage = getStorage();
      const raw = this.storage.getItem(SAVE_KEY);
      this.lastRead = raw;
      if (raw === null) return;
      const decoded = decodeSave(raw);
      this.progress = decoded.progress;
      if (decoded.incompatible) {
        this.protected = true;
        this.warning =
          "This campaign save uses an unsupported version. It is preserved; play continues in memory. Reset campaign to enable saving.";
      } else if (decoded.recovered) {
        // Preserve the complete original before any future write; if backup fails, don't overwrite it.
        this.protected = true;
        if (this.storage.getItem(RECOVERY_KEY) === null)
          this.storage.setItem(RECOVERY_KEY, raw);
        else if (this.storage.getItem(RECOVERY_KEY) !== raw) {
          this.warning =
            "Recovered valid campaign results. Original saves are preserved; play continues in memory until campaign reset.";
          return;
        }
        this.protected = false;
        this.warning =
          "Recovered valid campaign results. A copy of the damaged save is preserved; you can reset campaign progress in Mission control.";
      }
    } catch {
      this.protected = true;
      this.warning =
        "Campaign saving is unavailable. You can keep playing; progress stays in this tab until it closes.";
    }
  }
  save(): void {
    if (this.protected) return;
    try {
      const current = this.storage!.getItem(SAVE_KEY);
      if (current !== this.lastRead && current !== null) {
        const decoded = decodeSave(current);
        if (decoded.incompatible || decoded.recovered) {
          this.protected = true;
          this.warning =
            "Campaign data changed in another tab and has been preserved. Play continues in memory; reload to review the save or reset campaign progress.";
          return;
        }
        // Merge independent valid wins instead of overwriting another tab's better result.
        for (const [id, result] of Object.entries(decoded.progress.best)) {
          const mission = id as MissionId;
          if (result.stars > (this.progress.best[mission]?.stars ?? 0))
            this.progress.best[mission] = result;
        }
      }
      const serialized = JSON.stringify(this.progress);
      this.storage!.setItem(SAVE_KEY, serialized);
      this.lastRead = serialized;
    } catch {
      this.warning =
        "Campaign saving is unavailable. You can keep playing; progress stays in this tab until it closes.";
    }
  }
  /** Caller must obtain explicit confirmation. Only this module's two keys are touched. */
  reset(): void {
    this.progress = emptyProgress();
    try {
      if (!this.storage) throw new Error("Storage unavailable");
      this.storage.removeItem(SAVE_KEY);
      this.storage.removeItem(RECOVERY_KEY);
      this.lastRead = null;
      this.protected = false;
      this.warning = "";
    } catch {
      this.protected = true;
      this.warning =
        "Campaign reset in this tab. Stored progress could not be cleared; it may return after reload.";
    }
  }
}
