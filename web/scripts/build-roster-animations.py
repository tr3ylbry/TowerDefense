"""Bake four explicitly requested roster walk/idle/contact cycles from reviewed parts.
Run from web/: python3 scripts/build-roster-animations.py. No game-rule changes.
"""
from pathlib import Path
import math
from PIL import Image
from animation_tools import Rig, bake, extract, swing

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'art-source/expedition-1.0/roster'
# Reviewed source-space shoulder/hip and ankle pivots, in left-to-right part order.
CONFIG = {
 'scout': dict(display=(96,72), ground=67, body=((770,476),(53,38),.07),
  pivots=[(235,840),(515,836),(824,769),(1130,773)], ankles=[None,None,(794,1006),(1170,1031)],
  roots=[(45,37),(50,38),(57,46),(64,47)], feet=[0,0,56,68], scales=[.06,.06,.06,.06], stride=20, stance=.62, lift=4),
 'grunt': dict(display=(112,84), ground=74, body=((745,360),(62,38),.09),
  pivots=[(220,690),(517,680),(843,680),(1180,660)], ankles=[None,None,(830,1010),(1200,1040)],
  roots=[(48,35),(61,35),(58,51),(73,52)], feet=[0,0,57,76], scales=[.065,.067,.055,.055], stride=20, stance=.68, lift=3),
 'manhunter': dict(display=(112,84), ground=79, body=((760,392),(66,43),.085),
  pivots=[(275,700),(510,660),(844,705),(1185,665)], ankles=[None,None,(838,1075),(1215,1075)],
  roots=[(51,36),(72,35),(64,55),(79,56)], feet=[0,0,60,79], scales=[.063,.063,.052,.052], stride=28, stance=.58, lift=5),
 'tank': dict(display=(128,96), ground=78, body=((750,360),(66,40),.08),
  pivots=[(270,630),(606,620),(995,666),(1300,622)], ankles=[(250,895),(590,931),(994,893),(1322,916)],
  roots=[(38,48),(52,47),(87,52),(99,51)], feet=[36,49,88,101], scales=[.075,.075,.075,.075], stride=18, stance=.75, lift=2.5),
}


def build(name, config):
    source = SOURCE/f'{name}-parts-generated.png'
    components = extract(Image.open(source),5)
    body = max(components,key=lambda p:p[0].width*p[0].height)
    limbs = sorted((p for p in components if p is not body),key=lambda p:p[1][0])
    parts = {'body':(body[0],body[1][:2]), **{str(i):(im,box[:2]) for i,(im,box) in enumerate(limbs)}}
    rig = Rig(parts,(128,96),config['display'])
    pivot,center,body_scale = config['body']
    quad = name == 'tank'
    offsets = [0,.5,.5,0] if quad else [0,0,.5,0]
    def pose(state,phase):
        canvas = Image.new('RGBA',(128,96))
        contact = max(0,1-phase/.35) if state == 'attack' else 0
        contact = contact*contact*(3-2*contact)
        anticipation = max(0,(phase-.78)/.22) if state == 'attack' else 0
        shift = -3*contact+anticipation
        weight = (.3*math.cos(4*math.pi*phase) if state == 'walk' else .18*math.sin(2*math.pi*phase) if state == 'idle' else .7*contact)
        def limb(i):
            rx,ry=config['roots'][i]; root=(rx+shift,ry+weight)
            if config['ankles'][i] is None:
                angle = .12*math.sin(2*math.pi*phase + i*math.pi) if state == 'walk' else -.35*contact
                rig.part(canvas,str(i),config['pivots'][i],root,config['scales'][i],angle)
                return
            ankle_src=config['ankles'][i]
            # A common alpha-bound foot plane across complete painted limbs.
            texture,box=limbs[i]
            bottom=box[1]+texture.getchannel('A').point(lambda a:255 if a>=32 else 0).getbbox()[3]
            ay=config['ground']-(bottom-ankle_src[1])*config['scales'][i]
            ax=config['feet'][i]
            if state == 'walk':
                dx,lift=swing((phase+offsets[i])%1,-config['stride']*config['stance']/2,config['stride'],config['stance'],config['lift'])
                ax+=dx; ay+=lift
            rig.limb(canvas,str(i),config['pivots'][i],ankle_src,root,(ax,ay),config['scales'][i])
        # Far limbs behind the torso; near limbs cover their rounded attachment.
        for i in ([0,2] if quad else [0,2]): limb(i)
        rig.part(canvas,'body',pivot,(center[0]+shift,center[1]+weight),body_scale)
        for i in [3,1]: limb(i)
        return canvas
    frames=[pose(state,i/count) for state,count in [('walk',16),('idle',8),('attack',16)] for i in range(count)]
    record=bake(ROOT,name,frames,config['display'],round(config['ground']*rig.scale),{'walk':[0,16],'idle':[16,8],'attack':[24,16]},[source,Path(__file__).resolve(),ROOT/'scripts/animation_tools.py'],{'strideWorldPixels':config['stride'],'stance':config['stance'],'gait':'diagonal planted-foot crawl' if quad else 'alternating planted-foot walk','authoring':'continuous painted limbs, offline mesh deformation; stable body material'},quality=82)
    contact=Image.new('RGBA',(512,96))
    for i,frame in enumerate([frames[0],frames[4],frames[8],frames[12]]):contact.alpha_composite(frame,(128*i,0))
    contact.resize((1024,192)).save(SOURCE/f'{name}-walk-review.png')
    return record

if __name__=='__main__':
    for name,config in CONFIG.items(): build(name,config)
