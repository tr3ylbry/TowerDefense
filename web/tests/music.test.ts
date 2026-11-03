import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { AmbientMusic } from "../src/music";

function player() {
  const nodes: {buffer: AudioBuffer|null; loop: boolean; loopStart:number; loopEnd:number; onended:(()=>void)|null; start:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>;connect:ReturnType<typeof vi.fn>;disconnect:ReturnType<typeof vi.fn>}[]=[];
  const gain={gain:{value:0,setTargetAtTime:vi.fn((value:number)=>{gain.gain.value=value;})},connect:vi.fn(),disconnect:vi.fn()};
  const buffer={duration:15} as AudioBuffer;
  let stateChange=()=>{};
  const context={state:"running",currentTime:0,destination:{},resume:vi.fn().mockResolvedValue(undefined),close:vi.fn().mockResolvedValue(undefined),createGain:vi.fn(()=>gain),decodeAudioData:vi.fn().mockResolvedValue(buffer),
    addEventListener:vi.fn((_event:string,callback:()=>void)=>{stateChange=callback;}),
    createBufferSource:vi.fn(()=>{const node={buffer:null,loop:false,loopStart:0,loopEnd:0,onended:null,start:vi.fn(),stop:vi.fn(),connect:vi.fn(),disconnect:vi.fn()};nodes.push(node);return node;})};
  const create=vi.fn(()=>context as unknown as AudioContext);
  const fetchAudio=vi.fn<typeof fetch>().mockResolvedValue({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)} as Response);
  const states=vi.fn();
  const music=new AmbientMusic('/audio/orbital-drift.wav',states,create,fetchAudio);
  return {music,nodes,gain,buffer,context,create,fetchAudio,states,interrupt:()=>stateChange()};
}

it("keeps music opt-in, reuses one decoded buffer and stops/disconnects each old source",async()=>{
  const {music,nodes,context,create,fetchAudio,buffer}=player();
  expect(create).not.toHaveBeenCalled();expect(fetchAudio).not.toHaveBeenCalled();expect(music.state).toBe('off');
  music.toggle();expect(music.state).toBe('starting');
  await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(nodes[0]).toMatchObject({buffer,loop:true,loopStart:0,loopEnd:15});
  expect(nodes[0].start).toHaveBeenCalledWith(0,0);
  context.currentTime=16.25;music.toggle();
  expect(music.state).toBe('off');expect(nodes[0].stop).toHaveBeenCalledTimes(1);expect(nodes[0].disconnect).toHaveBeenCalledTimes(1);
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(nodes[1].buffer).toBe(buffer);expect(nodes[1].start).toHaveBeenCalledWith(0,1.25);
  expect(fetchAudio).toHaveBeenCalledTimes(1);expect(create).toHaveBeenCalledTimes(1);
  music.destroy();expect(nodes[1].stop).toHaveBeenCalledTimes(1);expect(context.close).toHaveBeenCalledTimes(1);
});

it("aborts a canceled download and ignores its late decode without reviving playback",async()=>{
  const {music,context,fetchAudio,nodes}=player();
  let resolve!:(buffer:AudioBuffer)=>void;
  context.decodeAudioData.mockReturnValueOnce(new Promise<AudioBuffer>(done=>{resolve=done;}));
  music.toggle();await vi.waitFor(()=>expect(context.decodeAudioData).toHaveBeenCalled());
  const signal=fetchAudio.mock.calls[0][1]!.signal!;
  music.toggle();expect(signal.aborted).toBe(true);
  resolve({duration:15} as AudioBuffer);await Promise.resolve();await Promise.resolve();
  expect(music.state).toBe('off');expect(nodes).toHaveLength(0);
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(nodes).toHaveLength(1);
});

it("requires a deliberate gesture after backgrounding or an interrupted output",async()=>{
  const {music,context,nodes,interrupt}=player();
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  context.currentTime=3;context.state='interrupted';interrupt();
  expect(music.state).toBe('paused');expect(nodes[0].stop).toHaveBeenCalledTimes(1);
  context.state='running';interrupt();expect(music.state).toBe('paused');
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(nodes[1].start).toHaveBeenCalledWith(0,3);
  music.pauseForBackground();expect(music.state).toBe('paused');
});

it("reports download, decode and output failures and retries without overlapping sources",async()=>{
  const {music,fetchAudio,context,nodes}=player();
  fetchAudio.mockResolvedValueOnce({ok:false} as Response);
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('error'));
  expect(nodes).toHaveLength(0);
  context.decodeAudioData.mockRejectedValueOnce(new Error('Bad audio'));
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('error'));
  context.resume.mockRejectedValueOnce(new Error('NotAllowedError'));
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('error'));
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(nodes).toHaveLength(1);
});

it("destroying a pending start never schedules a late source",async()=>{
  const {music,context,nodes}=player();let resolve!:(value:AudioBuffer)=>void;
  context.decodeAudioData.mockReturnValueOnce(new Promise<AudioBuffer>(done=>{resolve=done;}));
  music.toggle();await vi.waitFor(()=>expect(context.decodeAudioData).toHaveBeenCalled());
  music.destroy();resolve({duration:15} as AudioBuffer);await Promise.resolve();await Promise.resolve();
  expect(nodes).toHaveLength(0);expect(music.state).toBe('off');
});

it("changes only the music gain, clamps levels, and preserves the user mix across retry",async()=>{
  const {music,gain,create}=player();music.setVolume(0);expect(create).not.toHaveBeenCalled();
  music.toggle();await vi.waitFor(()=>expect(music.state).toBe('playing'));
  expect(gain.gain.value).toBe(0);music.setVolume(.65);
  expect(gain.gain.setTargetAtTime).toHaveBeenLastCalledWith(.65*.12,0,.015);
  music.setVolume(2);expect(gain.gain.value).toBe(.12);music.setVolume(-1);expect(gain.gain.value).toBe(0);
  music.destroy();expect(gain.disconnect).toHaveBeenCalledTimes(1);
});

it("ships a non-silent bounded PCM loop with a continuous wrap and no clipped samples",()=>{
  const wav=readFileSync(new URL('../public/audio/orbital-drift.wav',import.meta.url));
  expect(wav.toString('ascii',0,4)).toBe('RIFF');expect(wav.toString('ascii',8,12)).toBe('WAVE');
  expect(wav.readUInt16LE(22)).toBe(1);expect(wav.readUInt32LE(24)).toBe(22050);expect(wav.readUInt16LE(34)).toBe(16);
  expect(wav.length).toBe(44+15*22050*2);let square=0,peak=0;
  for(let i=44;i<wav.length;i+=2){const value=wav.readInt16LE(i)/32768;square+=value*value;peak=Math.max(peak,Math.abs(value));}
  expect(Math.sqrt(square/((wav.length-44)/2))).toBeGreaterThan(.02);expect(peak).toBeLessThan(.66);
  expect(Math.abs(wav.readInt16LE(44)-wav.readInt16LE(wav.length-2))/32768).toBeLessThan(.02);
});
