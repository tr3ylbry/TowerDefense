"""Verify recorded delivery/source hashes, without inferring publication permission."""
from pathlib import Path
import hashlib, json, os

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/os.environ.get('AVA_RELEASE_EVIDENCE', '.release-verification')
inventory = json.loads((OUT/'inventory.json').read_text())
rights = json.loads((OUT/'rights-inventory.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
records = ['art-source/expedition-1.1/defender-delivery.json',
           'art-source/expedition-0.5/derivatives.json']
records += [f'art-source/expedition-1.0/{kind}-conversion.json'
            for kind in ['scout', 'grunt', 'sprinter', 'manhunter', 'tank', 'gargantua']]
rows = []
for asset in inventory['files']:
    if not asset['file'].endswith('.webp'):
        continue
    matches = []
    for record_path in records:
        record = json.loads((ROOT/record_path).read_text())
        candidates = record.get('assets', [record.get('production')])
        for entry in candidates:
            if entry and entry['file'] == 'public/'+asset['file'] and entry['sha256'] == asset['sha256']:
                assert sha(ROOT/entry['file']) == entry['sha256'], entry['file']
                sources = []
                if 'source' in entry:
                    assert sha(ROOT/entry['source']) == entry['sourceSha256'], entry['source']
                    sources.append(entry['source'])
                for source, expected in record.get('inputs', {}).items():
                    assert sha(ROOT/source) == expected['sha256'], source
                    sources.append(source)
                assert sources, record_path
                matches.append({'record': record_path, 'sourceHashesVerified': sources})
    assert len(matches) == 1, (asset['file'], matches)
    origin = next(row for row in rights['includedAssets'] if row['file'] == asset['file'])
    for reference in origin['sourceRecords']:
        assert (ROOT/reference).is_file(), reference
    rows.append({**asset, **matches[0], 'generationRecords': origin['sourceRecords']})
assert len(rows) == 25
identity = json.loads((ROOT/'art-source/release-finalization/augie.json').read_text())
for entry in identity['assets']:
    assert sha(ROOT/entry['file']) == entry['sha256'], entry['file']
result = {'sourceBuild': inventory['build'], 'rasterDerivatives': rows,
          'all25DeliveryAndSourceHashesVerified': True, 'augieArtUnchanged': True,
          'publicationPermissionInferred': False}
(OUT/'provenance.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps({'deliveryAndSourceChainsVerified': len(rows), 'augieArtUnchanged': True}))
