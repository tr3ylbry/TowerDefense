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
