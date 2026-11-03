/* Inventory actual output and pure loader plans; never remove comparison assets. */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const web = path.resolve(__dirname,'../..'), out = path.join(web,'reports/expedition-1.1/assessment');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'ava11-assets-'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (name,data) => fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n');
try {
 fs.cpSync(path.join(web,'src'),path.join(temporary,'src'),{recursive:true});
 execFileSync(process.execPath,[path.join(web,'node_modules/typescript/bin/tsc'),'--ignoreConfig','--module','node16','--target','es2022','--strict','--skipLibCheck','--resolveJsonModule','--outDir',path.join(temporary,'compiled'),path.join(temporary,'src/assets.ts')]);
 const {assetsFor} = require(path.join(temporary,'compiled/assets.js'));
 const art = require(path.join(temporary,'compiled/game/art.js'));
 const manifest = JSON.parse(fs.readFileSync(path.join(web,'public/art/manifest.json')));
 const plans = {};
 for(const style of ['expedition','original']) for(const map of ['canyon','bridge','nest']) plans[`${style}/${map}`]=assetsFor(manifest,map,style);
 write('asset-plans.json',plans);
 const planned = new Set(Object.values(plans).flatMap(p=>[...p.images,...p.sprites].map(a=>'public/art/'+a.file)));
 const previews = new Set(Object.values(art.EXPEDITION_ENVIRONMENTS).map(a=>'public/art/'+a.file));
 const guide = new Set(Object.values(art.EXPEDITION_ENEMIES).map(a=>'public/art/'+a.file));
 const startup = JSON.parse(fs.readFileSync(path.join(out,'../performance/startup.json'))).results.find(r=>r.variant==='after');
 const initial = new Set(startup.resources.map(r=>'public'+r.path));
 const old = JSON.parse(fs.readFileSync(path.join(web,'reports/expedition-1.0/assessment/asset-rights.json')));
 const delivery = JSON.parse(fs.readFileSync(path.join(web,'art-source/expedition-1.1/defender-delivery.json')));
 const assets = old.assets.map(row=>{
  const bytes=fs.readFileSync(path.join(web,row.file));
  const battlefield=planned.has(row.file), fieldGuide=guide.has(row.file), preview=previews.has(row.file);
  return {...row,bytes:bytes.length,sha256:sha(bytes),sourceRecords:delivery.assets.some(a=>a.file===row.file)?['art-source/expedition-1.1/defender-delivery.json',...row.sourceRecords]:row.sourceRecords,
   shippedInProduction:fs.existsSync(path.join(web,'dist',row.file.replace(/^public\//,''))),
   initialCanyonDownload:initial.has(row.file),
   actualUse:{battlefield,fieldGuide,missionPreview:preview},
   loading:initial.has(row.file)?'Initial Expedition Canyon; also reused from cache':battlefield||fieldGuide||preview?'On demand: selected destination, Original comparison or Field Guide':'Not referenced by current player UI or loader plans; copied by public directory',
   unnecessaryToCurrentPlayerBuild:!battlefield&&!fieldGuide&&!preview};
 });
 const counts={rasterFiles:assets.length,retainedSchool:assets.filter(r=>r.status==='unresolved').length,generated:assets.filter(r=>r.category.startsWith('Expedition')).length,initialRasterFiles:assets.filter(r=>r.initialCanyonDownload).length,initialRasterBytes:assets.filter(r=>r.initialCanyonDownload).reduce((n,r)=>n+r.bytes,0),unusedRasterFiles:assets.filter(r=>r.unnecessaryToCurrentPlayerBuild).length,unusedRasterBytes:assets.filter(r=>r.unnecessaryToCurrentPlayerBuild).reduce((n,r)=>n+r.bytes,0),unusedSchoolFiles:assets.filter(r=>r.unnecessaryToCurrentPlayerBuild&&r.status==='unresolved').length};
 write('publication-assets.json',{date:'2026-11-02',method:'Every 104 actual public raster files cross-checked with fresh dist, current pure assetsFor plans for both styles/all destinations, explicit Field Guide and mission-preview references, and measured production startup requests. Presence is not initial use. Historical provenance is carried forward, not legal clearance.',counts,assets,otherMaterial:{...old.otherMaterial,music:{file:'public/audio/orbital-drift.wav',bytes:661544,sha256:sha(fs.readFileSync(path.join(web,'public/audio/orbital-drift.wav'))),delivery:'Only after explicit Music gesture',evidence:'scripts/build-ambient-music.py; original synthesized composition, no third-party samples. Owner publication decision still separate.'},effects:'Source-synthesized tones in src/audio.ts; no media download; no historical recording reused.'}});
 console.log(JSON.stringify(counts));
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
