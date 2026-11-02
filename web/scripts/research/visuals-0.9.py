"""Convert the shipped pose atlas to review evidence; no repainting.

python3 scripts/research/visuals-0.9.py [Playwright output directory]
The optional directory supplies public-control browser captures/unedited video.
"""
from pathlib import Path
import sys
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
out = ROOT / "reports/expedition-0.9/visual"
atlas = Image.open(ROOT / "public/art/expedition/sprinter-animation.webp").convert("RGBA")
static = Image.open(ROOT / "public/art/expedition/sprinter.webp").convert("RGBA").resize((102, 68), Image.Resampling.LANCZOS)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 13)
except OSError:
    font = ImageFont.load_default(size=13)
backgrounds = [Image.open(ROOT / f"public/art/expedition/{name}.webp").convert("RGBA").resize((1080, 200), Image.Resampling.LANCZOS) for name in ["canyon-0.5", "sky-bridge", "nest"]]
frames = []
for index in range(24):
    image = Image.new("RGBA", (1080, 660), "#132630")
    ImageDraw.Draw(image).text((18, 7), "SPRINTER · retained illustration / articulated walk loop / 2.5× detail · pose review", font=font, fill="#eef0db")
    tile = atlas.crop(((index % 8)*160, (index//8)*120, (index % 8+1)*160, (index//8+1)*120)).resize((128, 96), Image.Resampling.LANCZOS)
    for i, (name, background) in enumerate(zip(["CANYON", "BRIDGE", "NEST"], backgrounds)):
        y = 35+i*205
        image.alpha_composite(background, (0, y))
        image.alpha_composite(Image.new("RGBA", (1080, 200), (10, 25, 35, 90)), (0, y))
        image.alpha_composite(static, (110, y+150-round(233/256*68)))
        image.alpha_composite(tile, (405, y+150-84))
        image.alpha_composite(tile.resize((320, 240), Image.Resampling.LANCZOS), (700, y+190-210))
        draw = ImageDraw.Draw(image)
        for position, text in [((18, y+10), name), ((100, y+37), "Static"), ((400, y+37), "Walk · world size"), ((785, y+10), "Detail")]:
            draw.text(position, text, font=font, fill="#f8f4e0")
    frames.append(image.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=192))
frames[0].save(out / "sprinter-walk.gif", save_all=True, append_images=frames[1:], duration=[47 if i % 2 else 46 for i in range(24)], loop=0, optimize=True, disposal=1)

poses = Image.new("RGBA", (1280, 720), "#18303b")
for j, i in enumerate([0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44]):
    frame = atlas.crop(((i % 8)*160, (i//8)*120, (i % 8+1)*160, (i//8+1)*120)).resize((320, 240))
    poses.alpha_composite(frame, ((j % 4)*320, (j//4)*240))
    ImageDraw.Draw(poses).text(((j % 4)*320+5, (j//4)*240+5), str(i), font=font, fill="white")
poses.convert("RGB").save(out / "poses.png")
if len(sys.argv) > 1:
    captures = Path(sys.argv[1])
    combat = next(captures.rglob("real-sprinter-combat.png"))
    shutil.copy2(combat, out / "real-combat.png")
    shutil.copy2(combat.parent / "video.webm", out / "real-combat.webm")
print("Saved pose loop and frame review to", out)
