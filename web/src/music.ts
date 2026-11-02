export type MusicState = "off" | "starting" | "playing" | "paused" | "error";

/** One opt-in media element, deferred until a gesture; no simulation clock or timers. */
export class AmbientMusic {
  private element: HTMLAudioElement | null = null;
  private revision = 0;
  state: MusicState = "off";

  constructor(
    private source: string,
    private onState: (state: MusicState) => void,
    private createAudio = () => new Audio(),
  ) {}

  toggle(): void {
    if (this.state === "playing" || this.state === "starting") this.stop();
    else void this.start();
  }

  pauseForBackground(): void {
    if (this.state !== "playing" && this.state !== "starting") return;
    this.revision++;
    this.element?.pause();
    this.update("paused");
  }

  stop(): void {
    this.revision++;
    this.element?.pause();
    this.update("off");
  }

  destroy(): void {
    this.stop();
    if (this.element) {
      this.element.removeAttribute("src");
      this.element.load();
      this.element = null;
    }
  }

  private async start(): Promise<void> {
    const revision = ++this.revision;
    if (!this.element) {
      this.element = this.createAudio();
      this.element.preload = "none";
      this.element.loop = true;
      this.element.volume = 0.24;
      this.element.src = this.source;
      this.element.addEventListener("error", () => {
        if (this.state === "off") return;
        this.revision++;
        this.element?.pause();
        this.update("error");
      });
      this.element.addEventListener("pause", () => {
        if (this.state === "playing") this.update("paused");
      });
    }
    if (this.state === "error") this.element.load();
    this.update("starting");
    try {
      // Called directly from toggle's click handler; preserve iOS gesture activation.
      await this.element.play();
      if (revision === this.revision) this.update("playing");
    } catch {
      if (revision === this.revision) this.update("error");
    }
  }

  private update(state: MusicState): void {
    this.state = state;
    this.onState(state);
  }
}
