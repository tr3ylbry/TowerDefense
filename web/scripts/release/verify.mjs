/** Inspect actual output, not just the source allowlist. Exits nonzero on any unexpected file. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const web=path.resolve(import.meta.dirname,'../..');
const require=createRequire(import.meta.url);
const output=path.resolve(web,process.env.AVA_RELEASE_EVIDENCE??'.release-verification');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'ava-release-verify-'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const walk=root=>fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(root,e.name)):[path.join(root,e.name)]);
try {
  fs.cpSync(path.join(web,'src'),path.join(temporary,'src'),{recursive:true});
  fs.mkdirSync(path.join(temporary,'scripts/release'),{recursive:true});
  fs.copyFileSync(path.join(web,'scripts/release/assets.ts'),path.join(temporary,'scripts/release/assets.ts'));
  execFileSync(process.execPath,[path.join(web,'node_modules/typescript/bin/tsc'),'--ignoreConfig','--module','node16','--target','es2022','--strict','--skipLibCheck','--outDir',path.join(temporary,'compiled'),path.join(temporary,'scripts/release/assets.ts')]);
  const {releaseFiles,releaseManifest}=require(path.join(temporary,'compiled/scripts/release/assets.js'));
  const expected=new Set([...releaseFiles(),'art/manifest.json','index.html','build-info.json']);
  const dist=path.join(web,'dist-release');
  const candidate=JSON.parse(fs.readFileSync(path.join(web,'scripts/release/candidate.json')));
  const build=JSON.parse(fs.readFileSync(path.join(dist,'build-info.json')));
  if(build.distribution!==`expedition-only-${candidate.identifier}`)throw Error('Release candidate identifier differs from configuration');
  const files=walk(dist).sort().map(file=>{const bytes=fs.readFileSync(file);return {file:path.relative(dist,file).split(path.sep).join('/'),bytes:bytes.length,sha256:sha(bytes)};});
  const actual=new Set(files.map(f=>f.file));
  const unexpected=files.filter(f=>!expected.has(f.file)&&!/^assets\/(index-[\w-]+\.(js|css)|battlefield-[\w-]+\.js|phaser-[\w-]+\.js)$/.test(f.file));
  const chunkRoles=[/^assets\/index-[\w-]+\.js$/, /^assets\/index-[\w-]+\.css$/, /^assets\/battlefield-[\w-]+\.js$/, /^assets\/phaser-[\w-]+\.js$/];
  const ambiguousChunks=chunkRoles.filter(role=>files.filter(f=>role.test(f.file)).length!==1).map(String);
  const missing=[...expected].filter(f=>!actual.has(f));
  const manifest=JSON.parse(fs.readFileSync(path.join(dist,'art/manifest.json')));
  if(JSON.stringify(manifest)!==JSON.stringify(releaseManifest))throw Error('Distribution manifest differs from explicit release manifest');
  const old=JSON.parse(fs.readFileSync(path.join(web,'reports/expedition-1.1/assessment/publication-assets.json')));
  const exclusions=old.assets.filter(a=>!actual.has(a.file.replace(/^public\//,''))).map(a=>({...a,releaseIncluded:false,reason:a.status==='unresolved'?'Historical school derivative; permission absent':a.unnecessaryToCurrentPlayerBuild?'Unused generated derivative/source-size output':'Unexpected exclusion'}));
  const forbidden=old.assets.filter(a=>a.status==='unresolved'&&actual.has(a.file.replace(/^public\//,'')));
  if(missing.length||unexpected.length||forbidden.length||ambiguousChunks.length)throw Error(JSON.stringify({missing,unexpected,forbidden,ambiguousChunks}));
  // Lowercase compatibility keys/filenames and clearly historical source records are allowed.
  // This production candidate ships no historical documents; its executable/public copy
  // must not retain the previous capitalized playable identity.
  const identityLeaks=files.filter(f=>/\.(js|html|json|txt)$/.test(f.file)&&/\bTARS\b/.test(fs.readFileSync(path.join(dist,f.file),'utf8')));
  if(identityLeaks.length)throw Error(`Previous public robot identity in release output: ${identityLeaks.map(f=>f.file).join(', ')}`);
  const total=rows=>rows.reduce((n,r)=>n+r.bytes,0);
  const raster=files.filter(f=>/\.(webp|png|jpg)$/.test(f.file));
  const atlases=files.filter(f=>/-animation\.webp$/.test(f.file));
  const audio=files.filter(f=>f.file.startsWith('audio/'));
  const fullFiles=walk(path.join(web,'dist')).sort().map(file=>{const bytes=fs.readFileSync(file);return {file:path.relative(path.join(web,'dist'),file).split(path.sep).join('/'),bytes:bytes.length,sha256:sha(bytes)};});
  const fullPaths=new Map(fullFiles.map(file=>[file.file,file]));
  for(const asset of old.assets.filter(row=>row.status==='unresolved')) {
    const row=fullPaths.get(asset.file.replace(/^public\//,''));
    if(!row||row.sha256!==asset.sha256)throw Error(`Full comparison no longer preserves historical artwork: ${asset.file}`);
  }
  const fullComparison={files:fullFiles,counts:{files:fullFiles.length,bytes:total(fullFiles),raster:fullFiles.filter(f=>/\.(webp|png|jpg)$/.test(f.file)).length},excludedFilesVsFull:fullFiles.filter(f=>!actual.has(f.file))};
  const record={fullComparison,build:JSON.parse(fs.readFileSync(path.join(dist,'build-info.json'))),files,counts:{files:files.length,bytes:total(files),raster:raster.length,rasterBytes:total(raster),atlases:atlases.length,atlasBytes:total(atlases),audioBytes:total(audio),excludedRasters:exclusions.length,excludedBytes:total(exclusions),excludedSchool:exclusions.filter(a=>a.status==='unresolved').length},missing,unexpected,forbidden,exclusions};
  fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'inventory.json'),JSON.stringify(record,null,2)+'\n');
  fs.writeFileSync(path.join(output,'SHA256SUMS'),files.map(f=>`${f.sha256}  ${f.file}`).join('\n')+'\n');
  console.log(JSON.stringify(record.counts));
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
