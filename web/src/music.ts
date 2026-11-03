import { clampVolume, DEFAULT_AUDIO_VOLUME, requestPlaybackSession } from "./audio";
export type MusicState = "off" | "starting" | "playing" | "paused" | "error";

/** One cached loop and one active source; playback stays on the audio sample clock. */
export class AmbientMusic {
  private revision = 0;
  private volume = DEFAULT_AUDIO_VOLUME;
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private download: AbortController | null = null;
  private offset = 0;
  private startedAt = 0;
  state: MusicState = "off";

  constructor(
    private source: string,
    private onState: (state: MusicState) => void,
    private createContext = () => new AudioContext(),
    private fetchAudio: typeof fetch = (...args) => fetch(...args),
  ) {}

  setVolume(value: number): void {
    this.volume = clampVolume(value);
    if (this.context && this.gain)
      this.gain.gain.setTargetAtTime(this.volume * 0.12, this.context.currentTime, 0.015);
  }

  toggle(): void {
    if (this.state === "playing" || this.state === "starting") this.stop();
    else void this.start();
  }

  pauseForBackground(): void {
    if (this.state !== "playing" && this.state !== "starting") return;
    this.cancelPlayback();
    this.update("paused");
  }

  stop(): void {
    this.cancelPlayback();
    this.update("off");
  }

  destroy(): void {
    this.stop();
    this.gain?.disconnect();
    void this.context?.close().catch(() => {});
    this.context = null;
    this.gain = null;
    this.buffer = null;
    this.offset = 0;
  }

  private cancelPlayback(): void {
    this.revision++;
    this.download?.abort();
    this.download = null;
    const node = this.sourceNode;
    this.sourceNode = null;
    if (node) {
      if (this.context && this.buffer)
        this.offset = (this.offset + this.context.currentTime - this.startedAt) % this.buffer.duration;
      node.onended = null;
      try { node.stop(); } catch { /* A source that failed to start is already silent. */ }
      node.disconnect();
    }
  }

  private async start(): Promise<void> {
    const revision = ++this.revision;
    try {
      requestPlaybackSession();
      if (!this.context) {
        this.context = this.createContext();
        this.context.addEventListener("statechange", () => {
          if (this.state === "playing" && this.context?.state !== "running") this.pauseForBackground();
        });
        this.gain = this.context.createGain();
        this.gain.gain.value = this.volume * 0.12;
        this.gain.connect(this.context.destination);
      }
      const context = this.context;
      this.update("starting");
      // Resume immediately inside the gesture, before the deferred fetch/decode.
      const resume = context.resume();
      const controller = new AbortController();
      this.download = controller;
      const load = async () => {
        if (this.buffer) return this.buffer;
        const response = await this.fetchAudio(this.source, { signal: controller.signal });
        if (!response.ok) throw new Error("Music download unavailable");
        return context.decodeAudioData(await response.arrayBuffer());
      };
      const [, buffer] = await Promise.all([resume, load()]);
      if (revision !== this.revision) return;
      this.download = null;
      if (context.state !== "running" || buffer.duration <= 0) throw new Error("Audio output unavailable");
      this.buffer = buffer;
      const node = context.createBufferSource();
      node.buffer = buffer;
      node.loop = true;
      node.loopStart = 0;
      node.loopEnd = buffer.duration;
      node.connect(this.gain!);
      this.sourceNode = node;
      node.onended = () => {
        if (this.sourceNode !== node) return;
        this.cancelPlayback();
        this.update("paused");
      };
      this.startedAt = context.currentTime;
      node.start(0, this.offset);
      this.update("playing");
    } catch {
      if (revision === this.revision) {
        this.cancelPlayback();
        this.update("error");
      }
    }
  }

  private update(state: MusicState): void {
    this.state = state;
    this.onState(state);
  }
}
