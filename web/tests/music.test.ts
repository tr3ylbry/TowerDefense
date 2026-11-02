import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { AmbientMusic } from "../src/music";

function media() {
  const events = new Map<string, () => void>();
  const element = {
    src: "", preload: "", loop: false, volume: 1,
    play: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    addEventListener: (event: string, callback: () => void) => events.set(event, callback),
  };
  const create = vi.fn(() => element as unknown as HTMLAudioElement);
  const states = vi.fn();
  const gain = { gain: { value: 0, setTargetAtTime: vi.fn((value: number) => { gain.gain.value = value; }) }, connect: vi.fn(), disconnect: vi.fn() };
  const source = { connect: vi.fn(), disconnect: vi.fn() };
  const context = { state: "running", currentTime: 0, destination: {}, resume: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined), createGain: vi.fn(() => gain), createMediaElementSource: vi.fn(() => source), addEventListener: vi.fn() };
  const createContext = vi.fn(() => context as unknown as AudioContext);
  const music = new AmbientMusic("/audio/orbital-drift.wav", states, create, createContext);
  return { music, element, events, create, states, context, gain, createContext };
}

it("keeps music opt-in, reuses one media element and releases it on disposal", async () => {
  const { music, element, create } = media();
  expect(create).not.toHaveBeenCalled();
  expect(music.state).toBe("off");
  music.toggle();
  expect(music.state).toBe("starting");
  await vi.waitFor(() => expect(music.state).toBe("playing"));
  expect(element).toMatchObject({ preload: "none", loop: true, volume: 1 });
  music.toggle();
  expect(music.state).toBe("off");
  expect(element.pause).toHaveBeenCalled();
  music.toggle();
  await Promise.resolve();
  expect(create).toHaveBeenCalledTimes(1);
  music.destroy();
  expect(element.removeAttribute).toHaveBeenCalledWith("src");
  expect(element.load).toHaveBeenCalled();
});

it("does not revive a canceled start and requires an explicit gesture after backgrounding", async () => {
  const { music, element } = media();
  let resolve!: () => void;
  element.play.mockReturnValueOnce(new Promise<void>((done) => { resolve = done; }));
  music.toggle();
  music.toggle();
  resolve();
  await vi.waitFor(() => expect(music.state).toBe("off"));
  music.toggle();
  await vi.waitFor(() => expect(music.state).toBe("playing"));
  music.pauseForBackground();
  expect(music.state).toBe("paused");
  expect(element.play).toHaveBeenCalledTimes(2);
  music.toggle();
  await vi.waitFor(() => expect(music.state).toBe("playing"));
});

it("reports blocked/download failures and reloads the same media element on retry", async () => {
  const { music, element, events, create } = media();
  element.play.mockRejectedValueOnce(new Error("NotAllowedError"));
  music.toggle();
  await vi.waitFor(() => expect(music.state).toBe("error"));
  music.toggle();
  await vi.waitFor(() => expect(music.state).toBe("playing"));
  expect(element.load).toHaveBeenCalledTimes(1);
  events.get("error")!();
  expect(music.state).toBe("error");
  expect(create).toHaveBeenCalledTimes(1);
});

it("ships a non-silent bounded PCM loop with a continuous wrap and no clipped samples", () => {
  const wav = readFileSync(new URL("../public/audio/orbital-drift.wav", import.meta.url));
  expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
  expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
  expect(wav.readUInt16LE(22)).toBe(1);
  expect(wav.readUInt32LE(24)).toBe(22050);
  expect(wav.readUInt16LE(34)).toBe(16);
  expect(wav.length).toBe(44 + 15 * 22050 * 2);
  let square = 0, peak = 0;
  for (let i = 44; i < wav.length; i += 2) {
    const value = wav.readInt16LE(i) / 32768;
    square += value * value;
    peak = Math.max(peak, Math.abs(value));
  }
  expect(Math.sqrt(square / ((wav.length - 44) / 2))).toBeGreaterThan(0.02);
  expect(peak).toBeLessThan(0.66);
  expect(Math.abs(wav.readInt16LE(44) - wav.readInt16LE(wav.length - 2)) / 32768).toBeLessThan(0.02);
});

it("changes only the music gain, clamps levels, and preserves the user mix across retry", async () => {
  const { music, gain, createContext, context } = media();
  music.setVolume(0);
  expect(createContext).not.toHaveBeenCalled();
  music.toggle();
  await vi.waitFor(() => expect(music.state).toBe("playing"));
  expect(gain.gain.value).toBe(0);
  music.setVolume(0.65);
  expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0.65 * 0.12, 0, 0.015);
  music.setVolume(2);
  expect(gain.gain.value).toBe(0.12);
  music.setVolume(-1);
  expect(gain.gain.value).toBe(0);
  expect(context.createMediaElementSource).toHaveBeenCalledTimes(1);
  music.destroy();
  expect(context.close).toHaveBeenCalledTimes(1);
});
