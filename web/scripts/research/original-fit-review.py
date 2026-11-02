"""Validate runtime registration against every actual retained frame; render a review sheet."""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
text=(ROOT/'src/game/original-registration.ts').read_text()
registered=json.loads(text.split(' = ',1)[1].split(' as const;',1)[0])
records=json.loads((ROOT/'art-source/expedition-1.0/roster/original-registration.json').read_text())
canvas=Image.new('RGBA',(500,3*98),'#122832');draw=ImageDraw.Draw(canvas)
observed=[];index=0;total=0
for group,entries in records.items():
 for kind,record in entries.items():
  r=registered[group][kind];sx=r['width']/record['frameWidth'];sy=r['height']/record['frameHeight']
  assert abs(sx-sy)<1e-6
  samples=[];first=None
  for entry in record['inputs']:
   sheet=Image.open(ROOT/'public/art'/entry['file']).convert('RGBA');fw,fh=record['frameWidth'],record['frameHeight'];columns=sheet.width//fw
   for i in range(entry['frames']):
    x,y=i%columns*fw,i//columns*fh;frame=sheet.crop((x,y,x+fw,y+fh));box=frame.getchannel('A').point(lambda a:255 if a>=32 else 0).getbbox()
    left=(box[0]-r['originX']*fw)*sx;right=(box[2]-r['originX']*fw)*sx
    top=(box[1]-r['originY']*fh)*sy;bottom=(box[3]-r['originY']*fh)*sy
    assert left>=-43.00001 and right<=43.00001 and top>=-31.00001 and bottom<=31.00001,(group,kind,entry['file'],i,box)
    total+=1;samples.append([left,top,right,bottom])
    if first is None:first=frame
  cell_x,cell_y=index%5*100,index//5*98
  draw.rectangle((cell_x+3,cell_y+3,cell_x+97,cell_y+71),outline='#82ab9d')
  resized=first.resize((round(r['width']),round(r['height'])),Image.Resampling.NEAREST)
  canvas.alpha_composite(resized,(round(cell_x+50-r['width']*r['originX']),round(cell_y+37-r['height']*r['originY'])))
  draw.text((cell_x+5,cell_y+78),kind,fill='#dfede6')
  observed.append({'group':group,'kind':kind,'frames':len(samples),'worldRelativeVisibleBounds':samples});index+=1
out=ROOT/'reports/expedition-1.0/visual'
canvas.resize((1000,588),Image.Resampling.NEAREST).save(out/'original-lane-fit-review.png')
(ROOT/'reports/expedition-1.0/assessment/original-lane-fit.json').write_text(json.dumps({'method':'Every retained animation frame read directly with Pillow; runtime TS registration, no edited source pixels. Visible alpha>=32 must stay within86x62 inside100x74 tiles. Review PNG is a source/render calculation, not a gameplay capture.','framesValidated':total,'observations':observed},indent=2)+'\n')
print(f'{total} actual original frames fit;15 characters centered with preserved proportions.')
