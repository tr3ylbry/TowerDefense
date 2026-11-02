import { clampVolume, DEFAULT_AUDIO_VOLUME, requestPlaybackSession } from "./audio";
export type MusicState = "off" | "starting" | "playing" | "paused" | "error";

/** One opt-in media element, deferred until a gesture; no simulation clock or timers. */
export class AmbientMusic {
  private element: HTMLAudioElement | null = null;
  private revision = 0;
  private volume = DEFAULT_AUDIO_VOLUME;
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  state: MusicState = "off";

  constructor(
    private source: string,
    private onState: (state: MusicState) => void,
    private createAudio = () => new Audio(),
    private createContext = () => new AudioContext(),
  ) {}

  setVolume(value: number): void {
    this.volume = clampVolume(value);
    // Music is calibrated below short effects; both user controls start at 65%.
    if (this.context && this.gain)
      this.gain.gain.setTargetAtTime(this.volume * 0.12, this.context.currentTime, 0.015);
  }

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
    this.sourceNode?.disconnect();
    this.gain?.disconnect();
    void this.context?.close().catch(() => {});
    this.sourceNode = null;
    this.gain = null;
    this.context = null;
  }

  private async start(): Promise<void> {
    const revision = ++this.revision;
    try {
      requestPlaybackSession();
      if (!this.element) {
        this.element = this.createAudio();
        this.element.preload = "none";
        this.element.loop = true;
        this.element.volume = 1;
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
      if (!this.context) {
        this.context = this.createContext();
        this.context.addEventListener("statechange", () => {
          if (this.state === "playing" && this.context?.state !== "running") this.pauseForBackground();
        });
      }
      if (!this.sourceNode) {
        this.gain = this.context.createGain();
        this.gain.gain.value = this.volume * 0.12;
        this.sourceNode = this.context.createMediaElementSource(this.element);
        this.sourceNode.connect(this.gain);
        this.gain.connect(this.context.destination);
      }
      if (this.state === "error") this.element.load();
      this.update("starting");
      // Called directly from toggle's click handler; preserve iOS gesture activation.
      await Promise.all([this.context.resume(), this.element.play()]);
      if (revision === this.revision) {
        if (this.context.state !== "running") throw new Error("Audio output unavailable");
        this.update("playing");
      }
    } catch {
      if (revision === this.revision) {
        this.element?.pause();
        this.update("error");
      }
    }
  }

  private update(state: MusicState): void {
    this.state = state;
    this.onState(state);
  }
}
