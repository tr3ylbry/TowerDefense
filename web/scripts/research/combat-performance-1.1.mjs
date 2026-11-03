// Actual production mission, public controls and earned-credit barriers only.
// Unlocked save is navigation setup, never evidence of earned campaign completion.
import {chromium} from '@playwright/test';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=new URL('../../reports/expedition-1.1/',import.meta.url);
await mkdir(new URL('visual/',out),{recursive:true});
const browser=await chromium.launch({channel:process.env.AVA_PROFILE_CHANNEL||undefined});
const observations=[];
const ids=['first-contact','canyon-escalation','broken-ground','bridge-under-siege','into-the-nest','heart-of-the-swarm'];
const percentile=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.min(xs.length-1,Math.floor(xs.length*p))];
try{
 for(const variant of ['before','after']){
  const url=variant==='before'?'http://127.0.0.1:4174/':'http://127.0.0.1:4175/';
  const context=await browser.newContext({viewport:{width:1280,height:900},...(variant==='after'?{recordVideo:{dir:fileURLToPath(new URL('visual/',out)),size:{width:1280,height:900}}}:{})});
  const page=await context.newPage(),errors=[],origins=new Set();
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>origins.add(new URL(r.url()).origin));
  await page.addInitScript(ids=>localStorage.setItem('ava-campaign',JSON.stringify({version:1,best:Object.fromEntries(ids.map(id=>[id,{stars:3,shields:3,duration:100,kills:33}]))})),ids);
  await page.goto(url);await page.locator('#start').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('#start').disabled);
  await page.locator('#campaign-nav').click();await page.locator('[data-review="heart-of-the-swarm"]').click();await page.locator('#campaign-launch').click();
  await page.waitForFunction(()=>!document.querySelector('#asset-dialog').open&&!document.querySelector('#start').disabled);
  await page.locator('#start').click();await page.locator('#speed').click();await page.locator('[data-tower="wall"]').click();
  await page.evaluate(()=>{
   const frames=[],dense=[],hostiles=[],heap=[];
   window.combatMetrics={frames,dense,hostiles,heap,stop:false};let last=performance.now();
   const tick=now=>{const m=window.combatMetrics;if(m.stop)return;
    const playing=document.querySelector('#overlay').hidden;
    const count=Number(document.querySelector('#countdown').textContent.match(/(\d+) HOSTILES/)?.[1]??0);
    if(playing){frames.push(now-last);if(count>=20)dense.push(now-last);}
    last=now;requestAnimationFrame(tick);
   };requestAnimationFrame(tick);
  });
  let peak=0,iterations=0,captured=false;const started=Date.now();
  while(Date.now()-started<100000&&await page.locator('#overlay').isHidden()){
   deploy: for(const tile of [4,3,2,1]) for(let lane=1;lane<=6;lane++){
    if(!await page.locator('#overlay').isHidden())break deploy;
    if(Number(await page.locator('#credits').innerText())<35)break;
    const cell=page.getByRole('gridcell',{name:`Lane ${lane}, tile ${tile}, empty`,exact:true});
    if(await cell.count())await cell.click();
   }
   if(await page.locator('#call-wave').isEnabled())await page.keyboard.press('n');
   const label=await page.locator('#countdown').innerText();
   const current=Number(label.match(/(\d+) HOSTILES/)?.[1]??0);
   if(current>peak){peak=current;if(!captured&&peak>=30){captured=true;await page.screenshot({path:variant==='after'?fileURLToPath(new URL('visual/actual-dense-combat.png',out)):'/private/tmp/ava11-before-dense.png'});}}
   await page.evaluate(({current,iterations})=>{
    const m=window.combatMetrics;m.hostiles.push({at:performance.now(),count:current});
    if(iterations%10===0&&performance.memory)m.heap.push({at:performance.now(),used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize});
   },{current,iterations});iterations++;await page.waitForTimeout(150);
  }
  const metrics=await page.evaluate(()=>{window.combatMetrics.stop=true;return window.combatMetrics;});
  observations.push({variant,peakPublicHostileCount:peak,durationWallMs:Date.now()-started,outcome:await page.locator('#status').innerText(),errors,origins:[...origins],frames:metrics.frames.length,medianFrameMs:percentile(metrics.frames,.5),p95FrameMs:percentile(metrics.frames,.95),denseFrames:metrics.dense.length,denseP95Ms:percentile(metrics.dense,.95),over33ms:metrics.frames.filter(x=>x>33.3).length,raw:metrics});
  const video=page.video();await context.close();if(video){await video.saveAs(fileURLToPath(new URL('visual/actual-dense-combat.webm',out)));await unlink(await video.path());}
 }
 await writeFile(new URL('performance/actual-combat.json',out),JSON.stringify({browser:browser.version(),method:'One serial frozen1.0/current1.1 Heart of the Swarm production mission per build, default2x via public speed control, earned-credit Asteroid-only formation and public early calls. All-unlocked storage is navigation setup. No simulation objects, spawns, money or clock edits. Native rAF intervals include whole app/control/screenshot overhead, not pure GPU/Scene time. Dense subset requires publicly displayed >=20 hostiles after final wave; not a50-unit synthetic fixture. Heap points have uncontrolled GC and cannot establish a memory saving/leak result. Single-run observations are descriptive, not a rendering speedup claim.',observations},null,2)+'\n');
 console.log(JSON.stringify(observations.map(({raw,...rest})=>rest)));
}finally{await browser.close();}
