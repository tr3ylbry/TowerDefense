export const DEFAULT_AUDIO_VOLUME = 0.65;
export const clampVolume = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

/** Declare deliberate playback where supported; no microphone/session permissions. */
export function requestPlaybackSession(): void {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  try { if (session) session.type = "playback"; } catch { /* Optional browser hint. */ }
}

/** Small original synthesized effects: no audio downloads or autoplay. */
export class AudioBus {
  private context: AudioContext | null = null;
  private enabled = false;
  private revision = 0;
  private volume = DEFAULT_AUDIO_VOLUME;
  private master: GainNode | null = null;
  private lastTone: Partial<Record<"shot" | "income" | "breach", number>> = {};

  async setEnabled(enabled: boolean): Promise<boolean> {
    const revision = ++this.revision;
    this.enabled = enabled;
    if (!enabled) return false;
    try {
      requestPlaybackSession();
      this.context ??= new AudioContext();
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      if (revision === this.revision) this.enabled = false;
    }
    return this.enabled && this.context?.state === "running";
  }

  setVolume(value: number): void {
    this.volume = clampVolume(value);
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.015);
  }

  play(type: "shot" | "income" | "breach", heavy = false): void {
    const context = this.context;
    if (
      !this.enabled ||
      this.volume === 0 ||
      !context ||
      context.state !== "running" ||
      context.currentTime - (this.lastTone[type] ?? -Infinity) <
        (type === "shot" ? 0.075 : 0.15)
    )
      return;
    this.lastTone[type] = context.currentTime;
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
  }
}
