import { afterEach, expect, it, vi } from "vitest";
import { AudioBus } from "../src/audio";

afterEach(() => vi.unstubAllGlobals());

it("keeps critical cues audible during throttled gunfire, including the first instant", async () => {
  const start = vi.fn();
  const value = {
    value: 0, cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  class Context {
    addEventListener = vi.fn();
    currentTime = 0;
    state = "running";
    async resume() {}
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
    addEventListener = vi.fn();
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

it("retries an interrupted output on the next deliberate effects gesture", async () => {
  const resume = vi.fn();
  class Context {
    addEventListener = vi.fn();
    state = "interrupted";
    async resume() { resume(); this.state = "running"; }
    close() { return Promise.resolve(); }
  }
  vi.stubGlobal("AudioContext", Context);
  const audio = new AudioBus();
  expect(await audio.setEnabled(true)).toBe(true);
  expect(resume).toHaveBeenCalledTimes(1);
  audio.destroy();
});

it("does not revive failed effects when the operating system later restores output", async () => {
  let context!: Context;
  class Context {
    addEventListener = vi.fn();
    state = "suspended";
    constructor() { context = this; }
    async resume() { /* Output remains unavailable. */ }
    createOscillator = vi.fn();
    close() { return Promise.resolve(); }
  }
  vi.stubGlobal("AudioContext", Context);
  const audio = new AudioBus();
  expect(await audio.setEnabled(true)).toBe(false);
  context.state = "running";
  audio.play("income");
  expect(context.createOscillator).not.toHaveBeenCalled();
  audio.destroy();
});

it("uses equal user defaults, changes FX gain live and keeps zero-volume effects silent", async () => {
  const gains: { gain: { value: number; setTargetAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const starts = vi.fn();
  class Context {
    addEventListener = vi.fn();
    state = "running"; currentTime = 0; destination = {};
    async resume() {}
    createGain() {
      const node = { gain: { value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
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
  expect(gains[0].gain.value).toBe(0);
  audio.play("breach");
  expect(starts).toHaveBeenCalledTimes(1);
  audio.setVolume(2);
  expect(gains[0].gain.value).toBe(1);
  audio.destroy();
});

it("reports interrupted FX truthfully and resumes on one deliberate enable instead of toggling a stale flag",async()=>{
  let stateChange=()=>{};let context!:Context;
  class Context {
    state='running';currentTime=0;destination={};
    constructor(){context=this;}
    addEventListener(_event:string,callback:()=>void){stateChange=callback;}
    async resume(){this.state='running';}
    close(){return Promise.resolve();}
  }
  vi.stubGlobal('AudioContext',Context);
  const states=vi.fn(),audio=new AudioBus(states);
  expect(await audio.setEnabled(true)).toBe(true);expect(audio.state).toBe('on');
  context.state='interrupted';stateChange();expect(audio.state).toBe('paused');
  context.state='running';stateChange();expect(audio.state).toBe('paused');
  expect(await audio.setEnabled(true)).toBe(true);expect(audio.state).toBe('on');
  expect(states.mock.calls.map(([state])=>state)).toEqual(['starting','on','paused','starting','on']);
  audio.destroy();
});

it("allows later cues and immediate volume changes when Safari's idle audio clock is stationary",async()=>{
  let milliseconds=0;vi.stubGlobal('performance',{now:()=>milliseconds});
  const start=vi.fn(),parameter={value:0,cancelScheduledValues:vi.fn(),setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()};
  class Context {
    state='running';currentTime=0;destination={};
    addEventListener(){} async resume(){} async close(){}
    createGain(){return {gain:{...parameter},connect:vi.fn(),disconnect:vi.fn()};}
    createOscillator(){return {frequency:parameter,type:'sine',connect:vi.fn(),start,stop:vi.fn()};}
  }
  vi.stubGlobal('AudioContext',Context);const audio=new AudioBus();
  await audio.setEnabled(true);audio.play('income');milliseconds=200;audio.play('income');
  expect(start).toHaveBeenCalledTimes(2);audio.setVolume(.25);audio.destroy();
});
