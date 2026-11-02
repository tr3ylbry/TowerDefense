/** Small original synthesized effects: no audio downloads or autoplay. */
export class AudioBus {
  private context: AudioContext | null = null;
  private enabled = false;
  private revision = 0;
  private lastTone: Partial<Record<"shot" | "income" | "breach", number>> = {};

  async setEnabled(enabled: boolean): Promise<boolean> {
    const revision = ++this.revision;
    this.enabled = enabled;
    if (!enabled) return false;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      if (revision === this.revision) this.enabled = false;
    }
    return this.enabled && this.context?.state === "running";
  }

  play(type: "shot" | "income" | "breach", heavy = false): void {
    const context = this.context;
    if (
      !this.enabled ||
      !context ||
      context.state !== "running" ||
      context.currentTime - (this.lastTone[type] ?? -Infinity) <
        (type === "shot" ? 0.075 : 0.15)
    )
      return;
    this.lastTone[type] = context.currentTime;
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
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  destroy(): void {
    this.revision++;
    this.enabled = false;
    void this.context?.close();
    this.context = null;
  }
}
