"""Inventory deployable raster files, source chains and documented permission gaps.
No legal-clearance determination or changes to preserved school assets.
"""
from pathlib import Path
import json
import hashlib
ROOT=Path(__file__).resolve().parents[2]
manifest=json.loads((ROOT/'public/art/manifest.json').read_text())
legacy={item['file']:item for group in ['backgrounds','sprites','images'] for item in manifest[group]}
def provenance(name):
    if name.endswith('-animation.webp') and name.split('-animation')[0] in ['scout','grunt','manhunter','tank']:return [f'art-source/expedition-1.0/{name[:-15]}-conversion.json','art-source/expedition-1.0/roster/prompts.json','art-source/expedition-1.0/roster/generation.json']
    if name.endswith('-animation.webp'):return [f'art-source/expedition-1.0/{name[:-15]}-conversion.json','art-source/expedition-0.9/prompts.md' if name.startswith('sprinter') else 'art-source/expedition-1.0/prompts.md']
    groups={'README.md':['ranger','plated-crawler','canyon'],'README-0.2.md':['tars','scout','grunt'],'README-0.3.md':['sprinter','manhunter','gargantua'],'README-0.4.md':['asteroid','money-bush','moon-zeus']}
    stem=Path(name).stem
    for file,names in groups.items():
        if stem in names:return ['public/art/expedition/'+file]
    return ['public/art/expedition/README-0.5.md']
rows=[]
for path in sorted((ROOT/'public/art').rglob('*')):
    if path.suffix.lower() not in ['.png','.webp']:continue
    relative=str(path.relative_to(ROOT/'public/art'))
    record={'file':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    if relative in legacy:
        old=legacy[relative];sources=old.get('sources',[old.get('source')]);sources=[f'../assets/{s}' for s in sources if s]
        record.update(category='retained school-project derivative',sourceRecords=sources,knownOwnership='Original team project custody; individual image creators/rights holders not established by repository',documentedPermission='No separate license or image/music permission record found',status='unresolved',usage='Expedition and Original projectile' if relative.startswith('projectile-') else 'Original comparison, previews or retained unused public file; not all are requested during play',recommendedDisposition='Obtain asset-specific provenance and permission or replace/exclude from future public delivery; preserve original repository history')
    else:
        records=provenance(path.name)
        for item in records:
            if not (ROOT/item).is_file():raise ValueError(f'Missing provenance record {item}')
        record.update(category='Expedition generated illustration/derivative',sourceRecords=records,knownOwnership='Built-in OpenAI generation recorded for this independent continuation',documentedPermission='Generation prompts/source hashes recorded; not blanket third-party clearance',status='provenance recorded; publication review pending',usage='Expedition renderer/portraits or retained earlier derivative',recommendedDisposition='Retain prompts and hashes; review identity and applicable publication terms; do not infer permissions for school assets')
    rows.append(record)
output={'date':'2026-11-02','scope':'Every PNG/WebP physically copied from web/public/art into the current production build, including unused converted legacy files. Source art outside public is excluded from delivery. This inventory records evidence and gaps, not legal clearance.','counts':{'rasterFiles':len(rows),'retainedSchoolDerivatives':sum(r['status']=='unresolved' for r in rows),'generatedDerivatives':sum(r['category'].startswith('Expedition') for r in rows)},'assets':rows,'otherMaterial':{'credits':'Adrian Bao, Mauricio Herrera, Trey Bryant, Tim Lukau retained in app and original README','audio':'web/src/audio.ts synthesizes browser tones; public/audio/orbital-drift.wav is an original source-authored15-second128BPM composition, built without samples by scripts/build-ambient-music.py (hashes in assessment/phone-assets.json). Original assets/sounds remains preserved outside browser delivery.','names':'Historical Millennium Falcon comparison assets remain. Public Frontier Flagship has a new independent design. TARS and other retained identities still need publication review; this inventory makes no registration or clearance claim.','codeAndDependencies':'Independent browser implementation plus pinned dependencies. Phaser LICENSE.md retained in node_modules and license obligations must accompany publication handoff; no blanket license is inferred for original team material.'}}
(ROOT/'reports/expedition-1.0/assessment/asset-rights.json').write_text(json.dumps(output,indent=2)+'\n')
print(output['counts'])
