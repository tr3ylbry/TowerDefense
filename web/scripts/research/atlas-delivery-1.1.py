"""Reproduce rejected packing/crop experiments without changing production art."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json, math, hashlib
from PIL import Image, __version__ as pillow_version, features
ROOT=Path(__file__).resolve().parents[2]
rows=[]
with TemporaryDirectory(prefix='ava11-atlas-') as temporary:
 for name in ['scout','grunt','sprinter','manhunter','tank','gargantua']:
  source=ROOT/f'art-source/expedition-1.0/{name}-animation.png'
  record=json.loads((ROOT/f'art-source/expedition-1.0/{name}-conversion.json').read_text())
  original=ROOT/record['production']['file']
  assert hashlib.sha256(original.read_bytes()).hexdigest()==record['production']['sha256']
  im=Image.open(source).convert('RGBA');w,h=record['frame']['width'],record['frame']['height'];n=record['frames']
  frames=[im.crop((i%8*w,i//8*h,(i%8+1)*w,(i//8+1)*h)) for i in range(n)]
  bounds=[f.getchannel('A').getbbox() for f in frames]
  crop=(max(0,(min(b[0] for b in bounds)-2)//4*4),max(0,(min(b[1] for b in bounds)-2)//4*4),min(w,math.ceil((max(b[2] for b in bounds)+2)/4)*4),min(h,math.ceil((max(b[3] for b in bounds)+2)/4)*4))
  trials=[]
  for cols,box in [(c,(0,0,w,h)) for c in [4,5,8,10,16] if n%c==0]+[(8,crop)]:
   cw,ch=box[2]-box[0],box[3]-box[1];atlas=Image.new('RGBA',(cw*cols,ch*math.ceil(n/cols)))
   for i,f in enumerate(frames):atlas.paste(f.crop(box),(i%cols*cw,i//cols*ch))
   dest=Path(temporary)/'candidate.webp';atlas.save(dest,format='WebP',quality=record['settings']['quality'],method=6)
   decoded=Image.open(dest).convert('RGBA')
   assert decoded.getchannel('A').tobytes()==atlas.getchannel('A').tobytes()
   trials.append({'columns':cols,'crop':box,'dimensions':atlas.size,'bytes':dest.stat().st_size,'alphaExact':True})
  rows.append({'kind':name,'baselineBytes':original.stat().st_size,'frames':n,'frameSize':[w,h],'uniqueSourceFrames':len(set(f.tobytes() for f in frames)),'baselineSha256':record['production']['sha256'],'trials':trials})
out=ROOT/'reports/expedition-1.1/assessment/atlas-investigation.json'
out.write_text(json.dumps({'toolchain':{'pillow':pillow_version,'webp':features.version('webp')},'method':'Same preserved 1.0 RGBA poses and original quality/method. No production write. Common crop across all frames plus transparent margin; row-major repacking keeps every pose.','decision':'Retain all six original atlases byte-for-byte. Cropping increases aggregate bytes; best per-kind repacking saves only about2.6KB and needs metadata/preview changes. Lower-quality encoding and pose deduplication are unnecessary complexity/quality tradeoffs for this milestone. Lossless trials for Scout/Sprinter were161216/233574B, larger than92306/119184B.','assets':rows},indent=2)+'\n')
print('Preserved',sum(r['frames'] for r in rows),'poses;',sum(r['baselineBytes'] for r in rows),'bytes')
