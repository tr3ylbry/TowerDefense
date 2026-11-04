// Actual candidate combat through public controls/earned credits. No game-state edits.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve(import.meta.dirname,'../../reports/release-clearance');
fs.mkdirSync(path.join(out,'visual'),{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||undefined});
const ids=['first-contact','canyon-escalation','broken-ground','bridge-under-siege','into-the-nest','heart-of-the-swarm'];
const percentile=(a,p)=>[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.floor(a.length*p))];
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(ids=>localStorage.setItem('ava-campaign',JSON.stringify({version:1,best:Object.fromEntries(ids.map(id=>[id,{stars:3,shields:3,duration:100,kills:33}]))})),ids);
 const url=process.env.AVA_AFTER_URL??'http://127.0.0.1:4182/';
 await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#start').disabled);
 const build=await (await page.request.get(new URL('build-info.json',url).href)).json();
 await page.locator('#campaign-nav').click();await page.locator('[data-review="heart-of-the-swarm"]').click();await page.locator('#campaign-launch').click();
 await page.waitForFunction(()=>!document.querySelector('#asset-dialog').open&&!document.querySelector('#start').disabled);
 await page.locator('#start').click();await page.locator('#speed').click();
 await page.evaluate(()=>{
  window.denseRelease={frames:[],dense:[],stop:false};let last=performance.now();
  const tick=now=>{const m=window.denseRelease;if(m.stop)return;const count=Number(document.querySelector('#countdown').textContent.match(/(\d+) HOSTILES/)?.[1]??0);if(document.querySelector('#overlay').hidden){m.frames.push(now-last);if(count>=20)m.dense.push(now-last);}last=now;requestAnimationFrame(tick);};requestAnimationFrame(tick);
 });
 const slots=[['bush',1,3,60],['astro',1,1,50],['bush',2,3,60],['explosive',2,1,85],['startrell',3,1,75],['tars',4,1,100],['zeus',5,1,125],
  ...[5,4,3,2].flatMap(tile=>Array.from({length:6},(_,i)=>['wall',i+1,tile,35]))];
 const deployed=[],hostiles=[],began=Date.now();let peak=0,index=0,captured=false;
 while(Date.now()-began<100000&&await page.locator('#overlay').isHidden()) {
  if(index<slots.length) {
   const [kind,lane,tile,cost]=slots[index];
   const cell=page.getByRole('gridcell',{name:`Lane ${lane}, tile ${tile}, empty`,exact:true});
   if(!(await cell.count()))index++;
   else if(Number(await page.locator('#credits').innerText())>=cost) {
    await page.locator(`[data-tower="${kind}"]`).click();await cell.click();deployed.push({kind,lane,tile});index++;
   }
  }
  if(await page.locator('#call-wave').isEnabled())await page.keyboard.press('n');
  const count=Number((await page.locator('#countdown').innerText()).match(/(\d+) HOSTILES/)?.[1]??0);
  peak=Math.max(peak,count);hostiles.push({wallMs:Date.now()-began,count});
  if(!captured&&count>=20&&deployed.some(s=>s.kind==='zeus')) {await page.screenshot({path:path.join(out,'visual/dense-projectile-combat.png')});captured=true;}
  await page.waitForTimeout(100);
 }
 const metrics=await page.evaluate(()=>{window.denseRelease.stop=true;return window.denseRelease;});
 const result={build,browser:browser.version(),method:'One real Heart of the Swarm production attempt; all-unlocked local save is navigation setup only, never progression evidence. All five gun families are bought with earned credits; public2× speed/early calls and actual barriers. No simulation objects, credits, spawns, damage or clock edits. Native rAF includes complete app/control/screenshot overhead. Dense subset uses actual public >=20 hostiles. One descriptive run, not a rendering speedup/memory claim.',deployed,hostiles,peakHostiles:peak,outcome:await page.locator('#status').innerText(),durationWallMs:Date.now()-began,errors,medianFrameMs:percentile(metrics.frames,.5),p95FrameMs:percentile(metrics.frames,.95),denseP95Ms:percentile(metrics.dense,.95),frames:metrics.frames.length,denseFrames:metrics.dense.length,captured,raw:metrics};
 fs.writeFileSync(path.join(out,'performance/dense-combat.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({peak,kindCount:new Set(deployed.map(s=>s.kind)).size,outcome:result.outcome,errors,frames:result.frames,denseFrames:result.denseFrames,p95:result.p95FrameMs}));
 if(peak<20||!['astro','explosive','startrell','tars','zeus'].every(kind=>deployed.some(s=>s.kind===kind))||errors.length)process.exitCode=1;
}finally{await browser.close();}
