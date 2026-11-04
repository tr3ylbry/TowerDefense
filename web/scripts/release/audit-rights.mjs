/** Engineering provenance/classification only; no inferred legal permission. */
import fs from 'node:fs';
import path from 'node:path';
const web=path.resolve(import.meta.dirname,'../..');
const output=path.resolve(web,process.env.AVA_RELEASE_EVIDENCE??'.release-verification');
const old=JSON.parse(fs.readFileSync(path.join(web,'reports/expedition-1.1/assessment/publication-assets.json')));
const inventory=JSON.parse(fs.readFileSync(path.join(output,'inventory.json')));
const prior=new Map(old.assets.map(row=>[row.file,row]));
const includedAssets=inventory.files.filter(row=>/^(art|audio)\//.test(row.file)).map(row=>{
 const origin=prior.get(`public/${row.file}`);
 const projectile=row.file.startsWith('art/expedition/projectiles/');
 const audio=row.file==='audio/orbital-drift.wav';
 const tars=row.file==='art/expedition/tars.webp';
 return {...row,releaseIncluded:true,origin:origin?.category??(projectile?'Source-authored Expedition projectile':audio?'Source-authored Orbital Drift':'Source-authored manifest'),
  sourceRecords:origin?.sourceRecords??[projectile?'art-source/release-clearance/projectiles.json':audio?'scripts/build-ambient-music.py':'scripts/release/assets.ts'],
  classification:tars?4:origin?2:1,
  licenseOrPermissionEvidence:origin?'Recorded independent generation/derivation; applicable publication terms/identity approval not supplied':'Retained source-authored geometry/audio/metadata; no external image, recording, font or sample',
  outstanding:tars?'Retained TARS identity: owner naming/design decision required':origin?'Owner generation-terms/design review':'Contributor/code publication decision remains separate',
  recommendedDisposition:tars?'Approve a distinct public identity/design or obtain appropriate rights review before publication':origin?'Retain provenance and obtain owner publication review':'Retain source/provenance/attribution'};
});
const result={sourceBuild:inventory.build,notLegalClearance:true,
 classificationKey:{1:'Documented and apparently usable',2:'Requires additional permission or rights review',3:'Excluded from release build',4:'Replacement recommended'},
 includedAssets,
 excludedHistoricalAssets:inventory.exclusions.filter(row=>row.status==='unresolved').map(row=>({...row,classification:3})),
 otherMaterial:{sourceAuthoredFX:{classification:1,source:'src/audio.ts',condition:'Source-synthesized tones; no samples'},
  dependencyNotices:{classification:1,source:'public/THIRD_PARTY_NOTICES.txt',condition:'Retain full Phaser/eventemitter3 MIT notices'},
  sourceAuthoredInterface:{classification:1,source:'src/style.css;src/icons.ts;public/favicon.svg;src/battlefield.ts',condition:'Retain contributor/continuation attribution'},
  historicalSourceAndTeamContributions:{classification:2,condition:'All four contributors remain credited. No blanket license or explicit individual redistribution grants found. Owner settles intended publication scope; custody/credit are not permission.'},
  historicalDocumentation:{classification:3,condition:'Preserved in Git; not copied into candidate'}}};
fs.writeFileSync(path.join(output,'rights-inventory.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({rightsAssets:includedAssets.length,excludedSchool:result.excludedHistoricalAssets.length,notLegalClearance:true}));
