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
      return { gain: value, connect: vi.fn() };
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
