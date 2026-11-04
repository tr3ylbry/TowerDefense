// Serve an extracted candidate's parent locally, then test its real /site/ subpath.
import {chromium,webkit} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const url=process.env.AVA_ARCHIVE_URL??'http://127.0.0.1:4183/site/';
const results=[];
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]) {
 const browser=await type.launch(engine==='chromium'?{channel:process.env.PLAYWRIGHT_CHANNEL||undefined}:{});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:900}}),requests=[],errors=[],badResponses=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(r.url());});
  await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#start').disabled);
  const build=await (await page.request.get(new URL('build-info.json',url).href)).json();
  if(build.dirtyAtBuild||await page.locator('#art-toggle').count())throw Error('Archive is dirty or offers excluded comparison');
  await page.locator('#guide-open').click();await page.keyboard.press('Escape');
  await page.locator('#map-open').click();await page.locator('[data-map="nest"]').click();
  await page.waitForFunction(()=>!document.querySelector('#asset-dialog').open&&!document.querySelector('#start').disabled);
  await page.locator('#start').click();await page.getByRole('gridcell',{name:'Lane 1, tile 1, empty',exact:true}).click();
  await page.locator('#sound-toggle').click();await page.locator('#music-toggle').click();
  await page.waitForFunction(()=>document.querySelector('#music-toggle').dataset.state==='playing');
  await page.locator('#audio-mix').click();
  if(await page.locator('#status').innerText()!=='Mission paused')throw Error('Mix did not pause archive mission');
  await page.keyboard.press('Escape');
  if(await page.locator('#status').innerText()!=='Mission in progress')throw Error('Mix did not restore its own pause');
  const base=new URL(url);
  for(const raw of requests){const request=new URL(raw);if(request.origin!==base.origin)throw Error(`Foreign resource: ${raw}`);if(request.protocol!=='blob:'&&!request.pathname.startsWith(base.pathname))throw Error(`Resource escaped subpath: ${raw}`);}
  if(errors.length||badResponses.length)throw Error(JSON.stringify({errors,badResponses}));
  results.push({engine,version:browser.version(),build,url,errors,badResponses,requests:[...new Set(requests.filter(r=>!r.startsWith('blob:')))],passed:true});
 } finally {await browser.close();}
}
const out=path.resolve(import.meta.dirname,'../../reports/release-clearance/verification/archive-smoke.json');
fs.writeFileSync(out,JSON.stringify({method:'Actual extracted clean ZIP, ordinary Python static server, /site/ subsection. Real imagery/guide/Nest/placement/FX/Music/Mix. No rewritten resource routes or simulation state.',results},null,2)+'\n');
console.log(JSON.stringify(results.map(({engine,version,build,passed})=>({engine,version,build,passed}))));
