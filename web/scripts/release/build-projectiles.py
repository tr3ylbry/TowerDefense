"""Source-authored vector projectiles. No source image, external font, sample or generator API.
All share a transparent 54×54 canvas rendered into the existing 27×27 world footprint.
Geometry, palette and soft panel lighting are authored here; simulation is never read/edited.
"""
from pathlib import Path
import hashlib, json
ROOT = Path(__file__).resolve().parents[2]
SHAPES = {
    'astro': ('Standard / cream-tipped mint slug', '''<path d="M6 21h26l15 6-15 6H6l4-6z" fill="#93d7bd"/><path d="M31 21l16 6-16 6z" fill="#e7eae2"/><path d="M12 23h16" stroke="#e7eae2"/><path d="M10 25v4" stroke="#f3a17a"/>'''),
    'explosive': ('Explosive / coral hexagonal capsule', '''<path d="m11 18 22-2 12 11-12 11-22-2-5-9z" fill="#f3a17a"/><path d="m32 17 13 10-13 10-5-10z" fill="#f7ce90"/><path d="M13 22h12v10H13z" fill="#bc624d"/><path d="M17 22v10M31 22l6 5-6 5" stroke="#e7eae2" fill="none"/>'''),
    'startrell': ('Rapid / staggered twin mint tracers', '''<path d="m5 18 28-1 12 5-12 5-28-1 4-4z" fill="#93d7bd"/><path d="m15 30 22-1 12 5-12 5-22-1 4-4z" fill="#b6e6c8"/><path d="M13 21h17M23 33h12" stroke="#e7eae2"/><path d="m33 18 10 4-10 4m4 4 10 4-10 4" stroke="#f3a17a" fill="none"/>'''),
    'tars': ('Armor piercing / ice-blue split-fin needle', '''<path d="m4 16 15 7 18-2 14 6-14 6-18-2-15 7 7-11z" fill="#91d7e0"/><path d="m17 25 20-2 14 4-14 4-20-2z" fill="#e7eae2"/><path d="M20 27h21" stroke="#5882a1"/>'''),
    'zeus': ('Plasma / cyan containment ring and luminous core', '''<path d="m3 27 12-5 12-8 13 3 10 10-10 10-13 3-12-8z" fill="#4d8cb8"/><ellipse cx="31" cy="27" rx="14" ry="10" fill="#91d7e0"/><ellipse cx="32" cy="27" rx="8" ry="5" fill="#e7eae2"/><path d="m8 27 10-2m5-6 5-2m-5 18 5 2" stroke="#93d7bd"/>'''),
}
assets=[]
for kind,(description,shapes) in SHAPES.items():
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54"><g stroke="#102330" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{shapes}</g></svg>\n').encode()
    file=f'public/art/expedition/projectiles/{kind}.svg'
    (ROOT/file).write_bytes(svg)
    assets.append({'kind':kind,'file':file,'description':description,'canvas':[54,54],'worldDisplay':[27,27], 'bytes':len(svg),'sha256':hashlib.sha256(svg).hexdigest()})
record={'method':'Independently source-authored SVG geometry. No external source image, font, recording, AI image or franchise reference.', 'authoringSource':'scripts/release/build-projectiles.py', 'palette':{'outline':'#102330','cream':'#e7eae2','mint':'#93d7bd','coral':'#f3a17a','ice':'#91d7e0'},'presentationOnly':True,'assets':assets}
(ROOT/'art-source/release-clearance/projectiles.json').write_text(json.dumps(record,indent=2)+'\n')
print(f'{len(assets)} projectiles / {sum(a["bytes"] for a in assets)} SVG bytes')
