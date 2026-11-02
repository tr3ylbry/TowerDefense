"""Extract generated separated parts and bake one simulation-driven pose atlas.

Pillow performs only component extraction, affine joint articulation, packing and
encoding. No repainting, generated in-betweens or source replacement occurs.
Run from web/: python3 scripts/build-sprinter-animation.py
"""
from pathlib import Path
from collections import deque
import math
import json
import hashlib
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "art-source/expedition-0.9"
SOURCE = OUT / "sprinter-parts-generated.png"
source = Image.open(SOURCE).convert("RGBA")
alpha = source.getchannel("A")
w, h = source.size
pixels = alpha.load()
visited = bytearray(w*h)
components = []
for y in range(h):
    for x in range(w):
        if visited[y*w+x] or pixels[x,y] < 32:
            continue
        queue, points = deque([(x,y)]), []
        visited[y*w+x] = 1
        while queue:
            px, py = queue.popleft()
            points.append((px,py))
            for nx,ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1)):
                if 0 <= nx < w and 0 <= ny < h and not visited[ny*w+nx] and pixels[nx,ny] >= 32:
                    visited[ny*w+nx] = 1
                    queue.append((nx,ny))
        if len(points)>500:
            components.append(points)
assert len(components)==9, "Changed source requires a new component review"
names = ["near-thigh","body","near-shin","far-thigh","far-shin","near-foot","near-arm","far-arm","far-foot"]
parts, records = {}, {}
for name, points in zip(names,components):
    bounds = (max(0,min(x for x,y in points)-4),max(0,min(y for x,y in points)-4),min(w,max(x for x,y in points)+5),min(h,max(y for x,y in points)+5))
    mask = Image.new("L",source.size)
    mp = mask.load()
    for x,y in points:
        mp[x,y]=255
    # Four-pixel halo retains the original antialiased alpha around each core.
    # Neighboring parts and disconnected generated noise are excluded.
    mask = mask.filter(ImageFilter.MaxFilter(9))
    cutout = source.copy()
    cutout.putalpha(Image.composite(alpha,Image.new("L",source.size),mask))
    cutout = cutout.crop(bounds)
    parts[name]=(cutout,bounds[:2])
    cutout.save(OUT/f"{name}.png")
    records[name]={"bounds":bounds,"corePixels":len(points)}

FRAME = (160,120)  # Display at 128x96; 1.25x source scale, stable ground y=84.
SCALE = FRAME[0]/128

def part(canvas,name,pivot,target,scale,angle=0):
    texture,origin=parts[name]
    px,py=pivot[0]-origin[0],pivot[1]-origin[1]
    c,s=math.cos(angle),math.sin(angle)
    factor=scale*SCALE
    a,b,d,e=c/factor,s/factor,-s/factor,c/factor
    tx,ty=target[0]*SCALE,target[1]*SCALE
    transformed=texture.transform(FRAME,Image.Transform.AFFINE,(a,b,px-a*tx-b*ty,d,e,py-d*tx-e*ty),Image.Resampling.BICUBIC)
    canvas.alpha_composite(transformed)

def bone(canvas,name,pivot,end,start_target,end_target):
    dx,dy=end[0]-pivot[0],end[1]-pivot[1]
    tx,ty=end_target[0]-start_target[0],end_target[1]-start_target[1]
    part(canvas,name,pivot,start_target,math.hypot(tx,ty)/math.hypot(dx,dy),math.atan2(ty,tx)-math.atan2(dy,dx))

def leg(canvas,side,hip,ankle):
    dx,dy=ankle[0]-hip[0],ankle[1]-hip[1]
    distance=min(33.99,math.hypot(dx,dy))
    bend=math.sqrt(max(0,17**2-(distance/2)**2))
    knee=(hip[0]+dx/2-dy/distance*bend,hip[1]+dy/2+dx/distance*bend)
    if side=="near":
        bone(canvas,"near-thigh",(860,184),(1019,374),hip,knee)
        bone(canvas,"near-shin",(1080,138),(1110,412),knee,ankle)
        part(canvas,"near-foot",(327,614),ankle,.037)
    else:
        bone(canvas,"far-thigh",(700,560),(675,772),hip,knee)
        bone(canvas,"far-shin",(1015,543),(1042,809),knee,ankle)
        part(canvas,"far-foot",(297,975),ankle,.034)

def foot(phase):
    if phase<.6:
        return (60+48*phase,76.2)
    swing=(phase-.6)/.4
    return (88.8-28.8*swing,76.2-8*math.sin(math.pi*swing))

def pose(state,phase):
    canvas=Image.new("RGBA",FRAME)
    x,y,arm=75.,58.,0.
    if state=="walk":
        y+=.5*math.cos(phase*4*math.pi)
        near,far=foot(phase),foot((phase+.5)%1)
        arm=.12*math.sin(phase*2*math.pi)
    elif state=="attack":
        contact=max(0,1-phase/.32)
        anticipation=max(0,(phase-.72)/.28)
        x-=6*contact
        y+=1.5*contact-anticipation
        near,far=(60,76.2),(87,76.2)
        arm=.7*contact-.2*anticipation
    else:
        y+=.35*math.sin(phase*2*math.pi)
        near,far=(69,76.2),(82,76.2)
        arm=.025*math.sin(phase*2*math.pi)
    leg(canvas,"far",(x-2,y-1),far)
    part(canvas,"far-arm",(1092,935),(x-20,y-2),.034,-arm)
    part(canvas,"body",(510,370),(x,y),.1)
    leg(canvas,"near",(x,y),near)
    part(canvas,"near-arm",(743,911),(x-20,y-3),.035,arm)
    return canvas

frames=[pose("walk",i/24) for i in range(24)]+[pose("idle",i/8) for i in range(8)]+[pose("attack",i/16) for i in range(16)]
atlas=Image.new("RGBA",(FRAME[0]*8,FRAME[1]*6))
for i,frame in enumerate(frames):
    atlas.alpha_composite(frame,((i%8)*FRAME[0],(i//8)*FRAME[1]))
atlas.save(OUT/"sprinter-animation.png")
production=ROOT/"public/art/expedition/sprinter-animation.webp"
atlas.save(production,quality=85,method=6)
frames[0].save(OUT/"assembled.png")
records.update({"sourceSha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),"frame":{"width":160,"height":120,"ground":105,"displayWidth":128,"displayHeight":96},"sequences":{"walk":[0,24],"idle":[24,8],"attack":[32,16]},"productionBytes":production.stat().st_size,"productionSha256":hashlib.sha256(production.read_bytes()).hexdigest()})
encoded=Image.open(production).convert("RGBA")
records["alphaExactAfterEncoding"] = encoded.getchannel("A").tobytes() == atlas.getchannel("A").tobytes()
records["frameAlphaBounds"] = [encoded.crop(((i%8)*160,(i//8)*120,(i%8+1)*160,(i//8+1)*120)).getchannel("A").point(lambda x:255 if x>=32 else 0).getbbox() for i in range(48)]
(OUT/"conversion.json").write_text(json.dumps(records,indent=2)+"\n")
print(f"48 frames, {production.stat().st_size} bytes")
