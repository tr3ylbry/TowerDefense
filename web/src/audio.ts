export const DEFAULT_AUDIO_VOLUME = 0.65;
export type EffectsState = "off" | "starting" | "on" | "paused" | "error";
export const clampVolume = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

/** Declare deliberate playback where supported; no microphone/session permissions. */
export function requestPlaybackSession(): void {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  try { if (session && session.type !== "playback") session.type = "playback"; } catch { /* Optional browser hint. */ }
}

/** Small original synthesized effects: no audio downloads or autoplay. */
export class AudioBus {
  private context: AudioContext | null = null;
  private enabled = false;
  private revision = 0;
  private volume = DEFAULT_AUDIO_VOLUME;
  private master: GainNode | null = null;
  private lastTone: Partial<Record<"shot" | "income" | "breach", number>> = {};
  state: EffectsState = "off";

  constructor(private onState: (state: EffectsState) => void = () => {}) {}

  async setEnabled(enabled: boolean): Promise<boolean> {
    const revision = ++this.revision;
    this.enabled = enabled;
    this.applyVolume();
    this.update(enabled ? "starting" : "off");
    if (!enabled) return false;
    try {
      requestPlaybackSession();
      if (!this.context) {
        this.context = new AudioContext();
        this.context.addEventListener("statechange", () => {
          if (this.state === "on" && this.context?.state !== "running") {
            this.revision++;
            this.enabled = false;
            this.applyVolume();
            this.update("paused");
          }
        });
      }
      // Reassert gesture activation even if an idle Safari context says running.
      await this.context.resume();
    } catch {
      if (revision === this.revision) this.enabled = false;
    }
    if (revision !== this.revision) return false;
    // A failed activation must not silently become audible on a later OS resume.
    this.enabled = this.enabled && this.context?.state === "running";
    this.applyVolume();
    if (this.enabled) delete this.lastTone.income;
    this.update(this.enabled ? "on" : "error");
    return this.enabled;
  }

  setVolume(value: number): void {
    this.volume = clampVolume(value);
    this.applyVolume();
  }

  private applyVolume(): void {
    if (this.context && this.master) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      // FX can be idle between cues. Apply immediately even if its audio clock
      // has stopped advancing; a scheduled ramp would leave a stale mix value.
      this.master.gain.value = this.enabled ? this.volume : 0;
    }
  }

  private update(state: EffectsState): void {
    this.state = state;
    this.onState(state);
  }

  play(type: "shot" | "income" | "breach", heavy = false): void {
    const context = this.context;
    const cueTime = performance.now() / 1000;
    if (
      !this.enabled ||
      this.volume === 0 ||
      !context ||
      context.state !== "running" ||
      cueTime - (this.lastTone[type] ?? -Infinity) <
        (type === "shot" ? 0.075 : 0.15)
    )
      return;
    this.lastTone[type] = cueTime;
    if (!this.master) {
      this.master = context.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(context.destination);
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency =
      type === "income" ? 620 : type === "breach" ? 90 : heavy ? 140 : 310;
    oscillator.type = type === "shot" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.45,
      now + 0.11,
    );
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  destroy(): void {
    this.revision++;
    this.enabled = false;
    this.master?.disconnect();
    this.master = null;
    void this.context?.close().catch(() => {});
    this.context = null;
    this.update("off");
  }
}
