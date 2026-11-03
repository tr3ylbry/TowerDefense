// Independent production geometry probe; public controls and real element bounds.
import {chromium,webkit} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('../../reports/expedition-1.1',import.meta.url));
const url=process.env.AVA_TEST_URL??'http://127.0.0.1:4175/';
const results=[];
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const b=await type.launch();
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:844,height:390}]){
  const p=await b.newPage({viewport});await p.goto(url);await p.waitForFunction(()=>!document.querySelector('#start').disabled);
  for(const focused of [false,true]){
   if(focused)await p.locator('#start').click();
   const metrics=await p.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s),v=e.getBoundingClientRect();return {left:v.left,right:v.right,top:v.top,bottom:v.bottom,width:v.width,height:v.height};};
    return {bar:r('.mission-bar'),location:r('.location'),tools:r('.mission-tools'),first:r('#art-toggle'),buttons:[...document.querySelectorAll('.mission-tools .tool')].filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),board:r('.board-stack'),pageWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,css:document.querySelector('link[rel=stylesheet]').href};
   });
   assert(metrics.pageWidth<=viewport.width+1,'Page overflow');
   if(metrics.tools.top>=metrics.location.bottom-1)assert(Math.abs(metrics.first.left-metrics.location.left)<1,'Wrapped toolbar must share destination left edge');
   for(const item of metrics.buttons){assert(item.left>=metrics.bar.left-1,item.id+' clipped left');assert(item.right<=metrics.bar.right+1,item.id+' clipped right');}
   if(focused&&viewport.height===390){assert(metrics.board.top>=0,'Field top clipped');assert(metrics.board.bottom<=390+1,'Field bottom clipped');}
   results.push({engine,version:b.version(),viewport,focused,...metrics});
   if((viewport.width===390&&!focused)||(viewport.height===390&&focused))await p.screenshot({path:`${root}/visual/${engine}-toolbar-left-${focused?'landscape':'portrait'}.png`});
  }
  await p.close();
 }
 await b.close();
}
await writeFile(`${root}/verification/toolbar-alignment.json`,JSON.stringify({method:'Fresh production pages; actual bounds in normal/focused desktop, portrait and landscape; wrapped controls align within1px to destination left; all buttons contained and active landscape field fully visible.',results},null,2)+'\n');console.log(JSON.stringify({checks:results.length,failures:0}));
