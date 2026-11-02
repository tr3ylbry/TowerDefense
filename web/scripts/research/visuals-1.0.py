"""Atlas comparisons, explicitly isolated pose loops rather than gameplay."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'reports/expedition-1.0/visual'
try:font=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',12)
except OSError:font=ImageFont.load_default(size=12)
backgrounds=[Image.open(ROOT/f'public/art/expedition/{n}.webp').convert('RGBA').resize((900,180)) for n in ['canyon-0.5','sky-bridge','nest']]
for kind in ['sprinter','gargantua']:
 record=json.loads((ROOT/f'art-source/expedition-1.0/{kind}-conversion.json').read_text());atlas=Image.open(ROOT/record['production']['file']).convert('RGBA');w,h=record['frame']['displayWidth'],record['frame']['displayHeight'];ground=record['frame']['ground']/120*h
 old=Image.open(ROOT/'art-source/expedition-1.0/sprinter-0.9.webp').convert('RGBA') if kind=='sprinter' else None
 for state in ['walk','attack']:
  start,count=record['sequences'][state];frames=[]
  for j in range(count):
   i=start+j;tile=atlas.crop((i%8*160,i//8*120,(i%8+1)*160,(i//8+1)*120)).resize((w,h),Image.Resampling.LANCZOS)
   image=Image.new('RGBA',(900,590),'#132630');ImageDraw.Draw(image).text((12,8),f'{kind.upper()} {state.upper()} · isolated pose review / world size + 2× detail',font=font,fill='white')
   for k,bg in enumerate(backgrounds):
    y=35+k*185;image.alpha_composite(bg,(0,y));image.alpha_composite(Image.new('RGBA',bg.size,(10,25,35,100)),(0,y));draw=ImageDraw.Draw(image);draw.text((10,y+6),['CANYON','BRIDGE','NEST'][k],font=font,fill='white')
    if old:
     prev=old.crop((i%8*160,i//8*120,(i%8+1)*160,(i//8+1)*120)).resize((w,h),Image.Resampling.LANCZOS);image.alpha_composite(prev,(100,y+140-round(ground)));draw.text((100,y+28),'0.9',font=font,fill='white')
    else:
     static=Image.open(ROOT/'public/art/expedition/gargantua.webp').convert('RGBA').resize((122,89));image.alpha_composite(static,(100,y+140-round(273/280*89)));draw.text((100,y+28),'Static reference',font=font,fill='white')
    image.alpha_composite(tile,(360,y+140-round(ground)));draw.text((360,y+28),'1.0 world size',font=font,fill='white');image.alpha_composite(tile.resize((w*2,h*2),Image.Resampling.LANCZOS),(560,y+180-round(ground*2)));draw.text((750,y+6),'2× detail',font=font,fill='white')
   frames.append(image.convert('RGB').convert('P',palette=Image.Palette.ADAPTIVE,colors=192))
  duration=round((record['settings']['strideWorldPixels']/(43 if kind=='sprinter' else 18) if state=='walk' else (.75 if kind=='sprinter' else 1.2))*1000/count)
  frames[0].save(OUT/f'{kind}-{state}.gif',save_all=True,append_images=frames[1:],duration=duration,loop=0,optimize=True)
print('Four labeled animation comparisons written')
