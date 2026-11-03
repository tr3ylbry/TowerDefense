import { expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    observedMusic?: { source: AudioBufferSourceNode; startedAt: number; active: boolean }[];
  }
}

/** Observe real native audio nodes without replacing their clock, data or output. */
export async function observeMusic(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const records: NonNullable<Window['observedMusic']> = [];
    window.observedMusic = records;
    const create = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = create.call(this);
      const record = {source,startedAt:0,active:false};records.push(record);
      const start=source.start,stop=source.stop;
      source.start=function(...args){start.apply(this,args);record.startedAt=this.context.currentTime;record.active=true;};
      source.stop=function(...args){stop.apply(this,args);record.active=false;};
      source.addEventListener('ended',()=>{record.active=false;});
      return source;
    };
  });
}

export async function readMusic(page: Page) {
  return page.evaluate(() => {
    const records=window.observedMusic??[],active=records.filter(r=>r.active);
    const latest=active.at(-1)??records.at(-1);
    return {created:records.length,active:active.length,contexts:new Set(records.map(r=>r.source.context)).size,buffers:new Set(records.map(r=>r.source.buffer)).size,
      time:latest?latest.source.context.currentTime-latest.startedAt:0,
      loop:latest?.source.loop??false,duration:latest?.source.buffer?.duration??0,
      framesPerLoop:latest?.source.buffer?.length??0,sampleRate:latest?.source.buffer?.sampleRate??0};
  });
}

/** Native decoders resample to the output rate; allow only one rounded sample. */
export function expectDecodedLoop(loop: {framesPerLoop:number;sampleRate:number;duration:number}): void {
  expect(loop.sampleRate).toBeGreaterThan(0);
  expect(Number.isInteger(loop.framesPerLoop)).toBe(true);
  expect(loop.duration).toBe(loop.framesPerLoop / loop.sampleRate);
  expect(Math.abs(loop.framesPerLoop - 15 * loop.sampleRate)).toBeLessThanOrEqual(1);
}
