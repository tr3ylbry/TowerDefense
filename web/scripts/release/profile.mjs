/** Paired serial cold production navigations. No fake game clock or state. */
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve(import.meta.dirname,'../../reports/release-clearance/performance');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||undefined});
const results=[];
try {
 for(const constrained of [false,true])for(let sample=0;sample<3;sample++)for(const [variant,url]of [
  ['baseline',process.env.AVA_BEFORE_URL??'http://127.0.0.1:4180/'],
  ['release',process.env.AVA_AFTER_URL??'http://127.0.0.1:4181/'],
 ]) {
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();page.setDefaultTimeout(120000);
  await page.addInitScript(()=>{
   const w=window;w.releaseReadiness=null;
   new MutationObserver(()=>{const s=document.querySelector('#start');if(w.releaseReadiness===null&&s&&!s.disabled&&s.textContent.includes('Begin mission'))w.releaseReadiness=performance.now();}).observe(document,{subtree:true,attributes:true,childList:true});
  });
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');
  if(constrained){await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:75000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
  await page.goto(url);await page.waitForFunction(()=>window.releaseReadiness!==null);await page.waitForLoadState('networkidle');
  const record=await page.evaluate(()=>({readyMs:window.releaseReadiness,navigationTransferBytes:performance.getEntriesByType('navigation')[0].transferSize,resources:performance.getEntriesByType('resource').map(r=>({path:new URL(r.name).pathname,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,initiatorType:r.initiatorType}))}));
  const unique=[...new Map(record.resources.map(r=>[r.path,r])).values()];
  const images=unique.filter(r=>r.path.startsWith('/art/')&&/\.(png|webp|svg)$/.test(r.path));
  results.push({variant,constrained,sample,...record,imageCount:images.length,imageEncodedBytes:images.reduce((n,r)=>n+r.encodedBodySize,0),requestEntries:record.resources.length+1,uniqueRequestCount:unique.length+1,totalTransferBytes:record.navigationTransferBytes+record.resources.reduce((n,r)=>n+r.transferSize,0)});
  await context.close();
 }
 const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
 const summaries=[];
 for(const variant of ['baseline','release'])for(const constrained of [false,true]){
  const rows=results.filter(r=>r.variant===variant&&r.constrained===constrained);
  summaries.push({variant,constrained,readyMedianMs:median(rows.map(r=>r.readyMs)),readySamples:rows.map(r=>r.readyMs),imageBytes:rows[0].imageEncodedBytes,totalTransferBytes:rows[0].totalTransferBytes,requests:rows[0].requestEntries,uniqueRequests:rows[0].uniqueRequestCount});
 }
 const afterInfo=await (await fetch(new URL('build-info.json',process.env.AVA_AFTER_URL??'http://127.0.0.1:4181/'))).json();
 const record={baselineRevision:'4507737204724009d4a9d72c9626993541a27d26',releaseBuild:afterInfo,browser:browser.version(),conditions:'Apple M5/macOS; installed Chrome; paired alternating serial fresh contexts. Normal unthrottled, constrained4×CPU/150ms/200000Bps down/75000Bps up. Readiness is actual enabled Begin mission. Counts include navigation; image bodies counted once per art URL including new SVGs, not favicon. Network bytes include transfer overhead/compression. Small desktop timing differences are descriptive/no speedup claim.',summaries,results};
 fs.writeFileSync(path.join(out,'startup.json'),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(summaries));
}finally{await browser.close();}
