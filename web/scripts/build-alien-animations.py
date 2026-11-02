"""Reproduce Expedition 1.0 atlases. Run from web/: python3 scripts/build-alien-animations.py
Pillow is offline tooling already used by the project; not a browser dependency.
"""
from pathlib import Path
import math
from PIL import Image
from animation_tools import Rig, bake, extract, knee, swing

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/"art-source/expedition-1.0"


def sprinter():
    old = ROOT/"art-source/expedition-0.9"
    names = ["near-thigh","body","near-shin","far-thigh","far-shin","near-foot","near-arm","far-arm","far-foot"]
    import json
    origins = json.loads((old/"conversion.json").read_text())
    parts = {n:(Image.open(old/f"{n}.png").convert("RGBA"),origins[n]["bounds"][:2]) for n in names}
    rig = Rig(parts,(160,120),(128,96))
    def leg(canvas,side,hip,ankle,foot_angle=0):
        joint = knee(hip,ankle,17,17)
        if side == "near":
            rig.bone(canvas,"near-thigh",(860,184),(1019,374),hip,joint)
            rig.bone(canvas,"near-shin",(1080,138),(1110,412),joint,ankle)
            rig.part(canvas,"near-foot",(327,614),ankle,.037,foot_angle)
        else:
            rig.bone(canvas,"far-thigh",(700,560),(675,772),hip,joint)
            rig.bone(canvas,"far-shin",(1015,543),(1042,809),joint,ankle)
            rig.part(canvas,"far-foot",(297,975),ankle,.034,foot_angle)
    def foot(phase):
        x,lift = swing(phase,60,48,.6,8)
        angle = .18*math.sin(2*math.pi*(phase-.6)/.4) if phase>.6 else 0
        return (x,76.2+lift),angle
    def pose(state,phase):
        canvas = Image.new("RGBA",(160,120))
        x,y,arm = 75.,58.,0.
        near,far,na,fa = (69,76.2),(82,76.2),0,0
        if state == "walk":
            y += .35*math.cos(phase*4*math.pi)
            near,na = foot(phase)
            far,fa = foot((phase+.5)%1)
            arm = .12*math.sin(phase*2*math.pi)
        elif state == "attack":
            contact = max(0,1-phase/.32)
            contact = contact*contact*(3-2*contact)
            anticipation = max(0,(phase-.72)/.28)
            anticipation = anticipation*anticipation*(3-2*anticipation)
            x += -6*contact+1.5*anticipation
            y += 1.1*contact-.6*anticipation
            near,far = (60,76.2),(87,76.2)
            arm = .7*contact-.2*anticipation
        else:
            y += .25*math.sin(phase*2*math.pi)
            arm = .025*math.sin(phase*2*math.pi)
        leg(canvas,"far",(x-2,y-1),far,fa)
        rig.part(canvas,"far-arm",(1092,935),(x-20,y-2),.034,-arm)
        rig.part(canvas,"body",(510,370),(x,y),.1)
        leg(canvas,"near",(x,y),near,na)
        rig.part(canvas,"near-arm",(743,911),(x-20,y-3),.035,arm)
        return canvas
    frames = [pose(s,i/n) for s,n in (("walk",24),("idle",8),("attack",16)) for i in range(n)]
    return bake(ROOT,"sprinter",frames,(128,96),105,{"walk":[0,24],"idle":[24,8],"attack":[32,16]},[old/f"{n}.png" for n in names]+[old/"conversion.json",Path(__file__).resolve(),ROOT/"scripts/animation_tools.py"],{"strideWorldPixels":48,"stance":.6,"swing":"Hermite x, sine-squared lift; tangent contact; foot roll only in swing","weightShiftPixels":.35})


def gargantua():
    source = OUT/"gargantua-parts-generated.png"
    found = extract(Image.open(source),5)
    body = max(found,key=lambda p:p[0].width*p[0].height)
    limbs = sorted((p for p in found if p is not body),key=lambda p:p[1][0])
    parts = {"body":(body[0],body[1][:2])}
    # Source-space pivots follow painted anatomy; the two rigs do not share a skeleton.
    pivots = {
        "near-front":((244,637),(180,988)),
        "far-front":((600,650),(527,994)),
        "near-rear":((928,663),(934,982)),
        "far-rear":((1273,663),(1301,986)),
    }
    for name,(texture,bounds) in zip(pivots,limbs):
        texture.save(OUT/f"gargantua-{name}.png")
        parts[name] = (texture,bounds[:2])
    rig = Rig(parts,(160,120),(144,108))
    roots = {"near-front":(65,51),"far-front":(49,51),"near-rear":(112,59),"far-rear":(96,58)}
    feet = {"near-front":59,"far-front":43,"near-rear":117,"far-rear":101}
    # Lateral-sequence walk: LH, LF, RH, RF; 75% stance keeps three feet
    # planted except at quantized transition cells. Heavy short 28px stride.
    offsets = {"near-rear":.75,"near-front":.5,"far-rear":.25,"far-front":0}
    def limb(canvas,name,root,ankle):
        # Continuous source-pixel deformation keeps the broad painted joint
        # intact. Root and ankle move independently; feet remain flat/planted.
        # Unlike Sprinter, no separate thigh/shin sockets are needed.
        hip,wrist = pivots[name]
        rig.limb(canvas,name,hip,wrist,root,ankle,.113 if "front" in name else .095)
    def pose(state,phase):
        canvas = Image.new("RGBA",(160,120))
        shift,weight = 0.,0.
        if state == "attack":
            c = max(0,1-phase/.4); c=c*c*(3-2*c)
            a = max(0,(phase-.75)/.25); a=a*a*(3-2*a)
            shift,weight = -4*c+1*a,1*c-.3*a
        elif state == "idle":
            weight = .22*math.sin(phase*2*math.pi)
        else:
            weight = .3*math.cos(phase*8*math.pi)
        def draw(name):
            root = roots[name]
            target = (root[0]+shift,root[1]+weight)
            x,y = feet[name],90.6 if "front" in name else 91.
            if state == "walk":
                dx,lift = swing((phase+offsets[name])%1,-10.5,28,.75,3.5)
                x,y = x+dx,y+lift
            limb(canvas,name,target,(x,y))
        draw("far-rear");draw("far-front")
        rig.part(canvas,"body",(101,8),(10+shift,10+weight),122/1276)
        draw("near-rear");draw("near-front")
        return canvas
    frames = [pose(s,i/n) for s,n in (("walk",16),("idle",8),("attack",16)) for i in range(n)]
    frames[0].resize((640,480)).save(OUT/"gargantua-assembled.png")
    return bake(ROOT,"gargantua",frames,(144,108),107,{"walk":[0,16],"idle":[16,8],"attack":[24,16]},[source,ROOT/"art-source/expedition-0.3/gargantua-original.png",Path(__file__).resolve(),ROOT/"scripts/animation_tools.py"],{"strideWorldPixels":28,"stance":.75,"gait":"lateral sequence four-beat walk","offsets":offsets,"pivots":pivots,"roots":roots,"weightShiftPixels":.3},quality=82)


if __name__ == "__main__":
    sprinter()
    gargantua()
