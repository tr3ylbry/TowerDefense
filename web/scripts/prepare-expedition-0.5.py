"""Reproduce the reviewed 0.5 WebP derivatives without changing source images.

Requires the already installed Pillow; no runtime or npm dependency is added.
Only proportional resampling and encoding are applied, never semantic image edits.
"""
from pathlib import Path
from PIL import Image, ImageChops, __version__ as pillow_version, features
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "public/art/expedition"
SOURCES = ROOT / "art-source/expedition-0.5"
EXISTING = ["ranger", "tars", "money-bush", "asteroid", "moon-zeus",
            "scout", "grunt", "plated-crawler", "sprinter", "manhunter", "gargantua"]
NEW = {"explosive-astro-joe": "demo", "startrell-cluggins": "startrell",
       "money-tree": "tree", "frontier-flagship-compact": "flagship-compact"}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def encode(source, destination, maximum, quality, transparent):
    image = Image.open(source).convert("RGBA" if transparent else "RGB")
    original_size = image.size
    image.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
    image.save(destination, format="WEBP", quality=quality, method=6,
               exact=True, alpha_quality=100)
    decoded = Image.open(destination).convert(image.mode)
    alpha = image.getchannel("A") if transparent else None
    alpha_exact = (not ImageChops.difference(alpha, decoded.getchannel("A")).getbbox()
                   if transparent else None)
    if transparent and not alpha_exact:
        raise RuntimeError(f"Alpha changed: {destination}")
    bounds = alpha.point(lambda value: 255 if value >= 32 else 0).getbbox() if alpha else None
    return {"source": str(source.relative_to(ROOT)), "file": str(destination.relative_to(ROOT)),
            "sourceSize": original_size, "size": image.size, "bytes": destination.stat().st_size,
            "sourceSha256": sha(source), "sha256": sha(destination), "maximum": maximum,
            "quality": quality, "alphaExactAfterResampling": alpha_exact,
            "alphaBounds32": bounds, "foot": bounds[3] / image.height if bounds else None}

records = []
for name in EXISTING:
    records.append(encode(ART / f"{name}.png", ART / f"{name}.webp", 384, 90, True))
for name, source in NEW.items():
    records.append(encode(SOURCES / f"{source}-original.png", ART / f"{name}.webp", 384, 90, True))
records.append(encode(SOURCES / "acid-original.png", ART / "acid-pool.webp", 384, 90, True))
for name, source in {"canyon-0.5": ART / "canyon.webp",
                     "sky-bridge": SOURCES / "bridge-original.png",
                     "nest": SOURCES / "nest-original.png"}.items():
    records.append(encode(source, ART / f"{name}.webp", 1080, 85, False))
record = {"pillow": pillow_version, "libwebp": features.version("webp"),
          "operation": "Proportional LANCZOS thumbnail; WebP method6/exact/alpha_quality100; sources untouched",
          "assets": records}
(SOURCES / "derivatives.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps({"assets": len(records), "cutoutBytes": sum(x["bytes"] for x in records[:15]),
                  "terrainBytes": records[15]["bytes"],
                  "environmentBytes": sum(x["bytes"] for x in records[16:])}))
