import { afterEach, expect, it, vi } from "vitest";
import { AudioBus } from "../src/audio";

afterEach(() => vi.unstubAllGlobals());

it("keeps critical cues audible during throttled gunfire, including the first instant", async () => {
  const start = vi.fn();
  const value = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  class Context {
    currentTime = 0;
    state = "running";
    destination = {};
    createOscillator() {
      return {
        frequency: value,
        connect: vi.fn(),
        start,
        stop: vi.fn(),
        type: "sine",
      };
    }
    createGain() {
      return { gain: value, connect: vi.fn(), disconnect: vi.fn() };
    }
    close() {
      return Promise.resolve();
    }
  }
  vi.stubGlobal("AudioContext", Context);
  const audio = new AudioBus();
  await audio.setEnabled(true);
  audio.play("shot");
  audio.play("shot");
  expect(start).toHaveBeenCalledTimes(1);
  audio.play("breach");
  audio.play("income");
  expect(start).toHaveBeenCalledTimes(3);
  await audio.setEnabled(false);
  audio.play("breach");
  expect(start).toHaveBeenCalledTimes(3);
  audio.destroy();
});

it("reports unavailable effects instead of claiming sound is enabled", async () => {
  vi.stubGlobal("AudioContext", class {
    constructor() { throw new Error("Audio unavailable"); }
  });
  const audio = new AudioBus();
  expect(await audio.setEnabled(true)).toBe(false);
  expect(() => audio.play("income")).not.toThrow();
  audio.destroy();
});

it("honors disabling effects while the browser is still resuming audio", async () => {
  let resume!: () => void;
  const oscillator = vi.fn();
  class Context {
    state = "suspended";
    resume() {
      return new Promise<void>((resolve) => {
        resume = () => { this.state = "running"; resolve(); };
      });
    }
    createOscillator = oscillator;
    close() { return Promise.resolve(); }
  }
  vi.stubGlobal("AudioContext", Context);
  const audio = new AudioBus();
  const pending = audio.setEnabled(true);
  expect(await audio.setEnabled(false)).toBe(false);
  resume();
  expect(await pending).toBe(false);
  audio.play("shot");
  expect(oscillator).not.toHaveBeenCalled();
  audio.destroy();
});

it("uses equal user defaults, changes FX gain live and keeps zero-volume effects silent", async () => {
  const gains: { gain: { value: number; setTargetAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const starts = vi.fn();
  class Context {
    state = "running"; currentTime = 0; destination = {};
    createGain() {
      const node = { gain: { value: 0, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
      gains.push(node); return node;
    }
    createOscillator() { return { type: "sine", frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: starts, stop: vi.fn() }; }
    close() { return Promise.resolve(); }
  }
  vi.stubGlobal("AudioContext", Context);
  const audio = new AudioBus();
  await audio.setEnabled(true);
  audio.play("income");
  expect(gains[0].gain.value).toBe(0.65);
  audio.setVolume(0);
  expect(gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.015);
  audio.play("breach");
  expect(starts).toHaveBeenCalledTimes(1);
  audio.setVolume(2);
  expect(gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, 0.015);
  audio.destroy();
});
