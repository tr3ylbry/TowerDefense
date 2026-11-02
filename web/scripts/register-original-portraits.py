"""Register school portraits in CSS without editing the retained sprite pixels.

Reads the first frame's visible bounds; writes only TypeScript background metadata.
Run: python3 scripts/register-original-portraits.py (requires existing Pillow).
"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "public/art/manifest.json").read_text())
kinds = dict(
    astro="astro-joe", bush="money-bush", wall="asteroid", zeus="moon-zeus",
    explosive="explosive-astro-joe", startrell="startrell-cluggins", tars="tars",
    tree="money-tree", falcon="millennium-falcon",
)
lines = [
    "// Alpha bounds of the first retained 128px school frame (threshold32).",
    "// CSS registration only: original pixels and sprite sheets remain unchanged.",
    "export const ORIGINAL_PORTRAITS = {",
]
for kind, name in kinds.items():
    entry = next(s for s in manifest["sprites"] if s["key"] == name + "-idle")
    with Image.open(root / "public/art" / entry["file"]) as image:
        frame = image.convert("RGBA").crop((0, 0, entry["frameWidth"], entry["frameHeight"]))
        bounds = frame.getchannel("A").point(lambda a: 255 if a >= 32 else 0).getbbox()
        if not bounds:
            raise ValueError(f"Empty first frame: {name}")
        x, y, right, bottom = bounds
        scale = min(34 / (right - x), 35 / (bottom - y))
        left = (34 - (right - x) * scale) / 2 - x * scale
        top = (35 - (bottom - y) * scale) / 2 - y * scale
        size = f"{image.width * scale:.3f}px {image.height * scale:.3f}px"
        position = f"{left:.3f}px {top:.3f}px"
        lines.append(f'  {kind}: {{ size: "{size}", position: "{position}" }},')
lines += ["} as const;", ""]
(root / "src/game/original-portraits.ts").write_text("\n".join(lines))

# Battlefield registration uses the union of ALL animation frames, so a firing,
# walking or death frame cannot resize/jump or escape its lane. Pixels are untouched.
import hashlib
alien_kinds = dict(scout='little-green-man', grunt='grunt', sprinter='sprinter', manhunter='manhunter', tank='tank', gargantua='gargantua')
registration = {}
records = {}
for group, entries, actions in [('towers', kinds, ('idle', 'fire')), ('enemies', alien_kinds, ('walk', 'attack', 'die'))]:
    registration[group] = {}
    records[group] = {}
    for kind, name in entries.items():
        boxes, files = [], []
        width = height = None
        for action in actions:
            entry = next((s for s in manifest['sprites'] if s['key'] == f'{name}-{action}'), None)
            if not entry:
                continue
            fw, fh = entry['frameWidth'], entry['frameHeight']
            if width is not None and (fw, fh) != (width, height):
                raise ValueError(f'Inconsistent frame size: {name}')
            width, height = fw, fh
            source = root/'public/art'/entry['file']
            with Image.open(source).convert('RGBA') as sheet:
                columns = sheet.width // fw
                for index in range(entry['frames']):
                    x, y = index % columns * fw, index // columns * fh
                    frame = sheet.crop((x, y, x+fw, y+fh))
                    bounds = frame.getchannel('A').point(lambda a: 255 if a >= 32 else 0).getbbox()
                    if not bounds:
                        raise ValueError(f'Empty original frame: {name}-{action}/{index}')
                    boxes.append(bounds)
            files.append({'file':entry['file'], 'frames':entry['frames'], 'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
        x, y = min(b[0] for b in boxes), min(b[1] for b in boxes)
        right, bottom = max(b[2] for b in boxes), max(b[3] for b in boxes)
        scale = min(86/(right-x), 62/(bottom-y))
        registration[group][kind] = dict(width=round(width*scale,6), height=round(height*scale,6), originX=(x+right)/(2*width), originY=(y+bottom)/(2*height))
        records[group][kind] = dict(bounds=[x,y,right,bottom], frameWidth=width, frameHeight=height, maxVisibleWidth=(right-x)*scale, maxVisibleHeight=(bottom-y)*scale, inputs=files)
(root/'src/game/original-registration.ts').write_text('// Generated visible-bound registration across all retained animation frames.\nexport const ORIGINAL_REGISTRATION = '+json.dumps(registration,indent=2)+' as const;\n')
record_dir = root/'art-source/expedition-1.0/roster'
record_dir.mkdir(parents=True,exist_ok=True)
(record_dir/'original-registration.json').write_text(json.dumps(records,indent=2)+'\n')
