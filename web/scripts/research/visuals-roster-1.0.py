"""Labeled stationary pose reviews; neither recorded missions nor performance data."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'reports/expedition-1.0/visual'
try:
    FONT = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 12)
except OSError:
    FONT = ImageFont.load_default(size=12)
BACKGROUNDS = [Image.open(ROOT / f'public/art/expedition/{name}.webp')
               .convert('RGBA').resize((900, 180))
               for name in ['canyon-0.5', 'sky-bridge', 'nest']]
# Current unchanged content.ts values, converted from tiles/s to world pixels/s.
SPEED = {'scout': 28, 'grunt': 20, 'manhunter': 30, 'tank': 26}
COOLDOWN = {'scout': 1, 'grunt': 1.1, 'manhunter': .9, 'tank': 1.5}

for kind in SPEED:
    record = json.loads((ROOT / f'art-source/expedition-1.0/{kind}-conversion.json').read_text())
    atlas = Image.open(ROOT / record['production']['file']).convert('RGBA')
    frame = record['frame']
    fw, fh = frame['width'], frame['height']
    width, height = frame['displayWidth'], frame['displayHeight']
    ground = frame['ground'] / fh * height
    for state in ['walk', 'attack']:
        start, count = record['sequences'][state]
        frames = []
        for index in range(start, start + count):
            tile = atlas.crop((index % 8 * fw, index // 8 * fh,
                               (index % 8 + 1) * fw, (index // 8 + 1) * fh))
            tile = tile.resize((width, height), Image.Resampling.LANCZOS)
            image = Image.new('RGBA', (900, 590), '#132630')
            ImageDraw.Draw(image).text((12, 8), f'{kind.upper()} {state.upper()} / stationary pose preview, not gameplay', font=FONT, fill='white')
            for row, background in enumerate(BACKGROUNDS):
                y = 35 + row * 185
                image.alpha_composite(background, (0, y))
                image.alpha_composite(Image.new('RGBA', background.size, (10, 25, 35, 100)), (0, y))
                image.alpha_composite(tile, (200, y + 140 - round(ground)))
                image.alpha_composite(tile.resize((width * 2, height * 2), Image.Resampling.LANCZOS), (520, y + 180 - round(ground * 2)))
                draw = ImageDraw.Draw(image)
                for label, position in [(('CANYON', 'BRIDGE', 'NEST')[row], (10, y + 6)), ('World size', (200, y + 24)), ('2x detail', (740, y + 6))]:
                    draw.text(position, label, font=FONT, fill='white')
            frames.append(image.convert('RGB').convert('P', palette=Image.Palette.ADAPTIVE, colors=192))
        seconds = record['settings']['strideWorldPixels'] / SPEED[kind] if state == 'walk' else COOLDOWN[kind]
        frames[0].save(OUT / f'{kind}-{state}.gif', save_all=True, append_images=frames[1:],
                       duration=round(seconds * 1000 / count), loop=0, optimize=True)
print('Eight labeled roster pose reviews written.')
