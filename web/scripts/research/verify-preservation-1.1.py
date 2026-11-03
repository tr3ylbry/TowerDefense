"""Audit current preserved rules, all six atlas pixels and419 Original frames."""
from pathlib import Path
import hashlib,json,subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
BASE='b0ece92e4284ccb9919e5368cd18049a4d76a251'
sha=lambda b:hashlib.sha256(b).hexdigest()
unchanged={}
for directory in ['src/game','src/campaign']:
 for p in sorted((ROOT/directory).glob('*.ts')):
  if p.name in {'art.ts','defender-delivery.ts'}:continue
  relative=str(p.relative_to(ROOT))
  old=subprocess.check_output(['git','show',f'{BASE}:web/{relative}'],cwd=ROOT)
  assert old==p.read_bytes(),relative
  unchanged[relative]=sha(old)
atlases=[]
for kind in ['scout','grunt','sprinter','manhunter','tank','gargantua']:
 record=json.loads((ROOT/f'art-source/expedition-1.0/{kind}-conversion.json').read_text())
 p=ROOT/record['production']['file'];encoded=p.read_bytes()
 assert sha(encoded)==record['production']['sha256']
 decoded=Image.open(p).convert('RGBA');source=Image.open(ROOT/f'art-source/expedition-1.0/{kind}-animation.png').convert('RGBA')
 assert source.size==decoded.size and source.getchannel('A').tobytes()==decoded.getchannel('A').tobytes()
 atlases.append({'kind':kind,'frames':record['frames'],'bytes':len(encoded),'sha256':sha(encoded),'alphaExact':True,'geometryUnchanged':True})
text=(ROOT/'src/game/original-registration.ts').read_text()
registered=json.loads(text.split(' = ',1)[1].split(' as const;',1)[0])
original=json.loads((ROOT/'art-source/expedition-1.0/roster/original-registration.json').read_text())
frames=0;original_files={}
for group,entries in original.items():
 for kind,record in entries.items():
  reg=registered[group][kind];fw,fh=record['frameWidth'],record['frameHeight'];sx,sy=reg['width']/fw,reg['height']/fh
  assert abs(sx-sy)<1e-6
  for entry in record['inputs']:
   p=ROOT/'public/art'/entry['file'];data=p.read_bytes();relative=str(p.relative_to(ROOT))
   assert data==subprocess.check_output(['git','show',f'{BASE}:web/{relative}'],cwd=ROOT)
   original_files[relative]=sha(data)
   sheet=Image.open(p).convert('RGBA');cols=sheet.width//fw
   for i in range(entry['frames']):
    x,y=i%cols*fw,i//cols*fh
    b=sheet.crop((x,y,x+fw,y+fh)).getchannel('A').point(lambda a:255 if a>=32 else 0).getbbox()
    left,right=(b[0]-reg['originX']*fw)*sx,(b[2]-reg['originX']*fw)*sx
    top,bottom=(b[1]-reg['originY']*fh)*sy,(b[3]-reg['originY']*fh)*sy
    assert left>=-43.00001 and right<=43.00001 and top>=-31.00001 and bottom<=31.00001
    frames+=1
assert frames==419
subprocess.run(['git','diff','--exit-code','school-project-2019','--','src','assets','doc','.classpath','.project','AstronautsvsAliens.xml','astronauts-vs-aliens-presentation.pptx'],cwd=ROOT.parent,check=True)
result={'baseline':BASE,'unchangedRuleCampaignAndPoseSources':unchanged,'atlases':atlases,'originalFramesValidated':frames,'originalFilesUnchanged':original_files,'originalFit':'Every alpha>=32 frame remains proportional within86x62 world pixels inside100x74 cells; same runtime registration.','schoolTreeUnchanged':True}
(ROOT/'reports/expedition-1.1/verification/preservation.json').write_text(json.dumps(result,indent=2)+'\n')
print('Rules/campaign/save/pose sources unchanged;',sum(r['frames'] for r in atlases),'illustrated poses and',frames,'original frames verified')
