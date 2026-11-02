"""Small offline image/rig utilities. No runtime or gameplay responsibility."""
from collections import deque
from pathlib import Path
from io import BytesIO
import hashlib
import json
import math
import sys
from PIL import Image, ImageFilter, __version__ as pillow_version, features


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def extract(source, expected):
    """Alpha-connected parts with their original antialiased four-pixel halo."""
    source = source.convert("RGBA")
    alpha = source.getchannel("A")
    w, h = source.size
    pixels, visited, components = alpha.load(), bytearray(w*h), []
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
            if len(points) > 500:
                components.append(points)
    if len(components) != expected:
        raise ValueError(f"Expected {expected} reviewed components, found {len(components)}")
    output = []
    for points in components:
        bounds = (max(0,min(x for x,y in points)-4), max(0,min(y for x,y in points)-4), min(w,max(x for x,y in points)+5), min(h,max(y for x,y in points)+5))
        mask = Image.new("L", source.size)
        mp = mask.load()
        for x,y in points:
            mp[x,y] = 255
        mask = mask.filter(ImageFilter.MaxFilter(9))
        cutout = source.copy()
        cutout.putalpha(Image.composite(alpha, Image.new("L",source.size), mask))
        output.append((cutout.crop(bounds), bounds))
    return output


class Rig:
    def __init__(self, parts, frame, display):
        self.parts, self.frame = parts, frame
        self.scale = frame[0]/display[0]
        if abs(frame[1]/display[1] - self.scale) > 1e-8:
            raise ValueError("Frame/display aspect ratio mismatch")

    def part(self, canvas, name, pivot, target, scale, angle=0):
        texture, origin = self.parts[name]
        px, py = pivot[0]-origin[0], pivot[1]-origin[1]
        c, s, factor = math.cos(angle), math.sin(angle), scale*self.scale
        a,b,d,e = c/factor,s/factor,-s/factor,c/factor
        tx,ty = target[0]*self.scale,target[1]*self.scale
        transformed = texture.transform(self.frame, Image.Transform.AFFINE, (a,b,px-a*tx-b*ty,d,e,py-d*tx-e*ty), Image.Resampling.BICUBIC)
        canvas.alpha_composite(transformed)

    def bone(self, canvas, name, pivot, end, start_target, end_target):
        dx,dy = end[0]-pivot[0],end[1]-pivot[1]
        tx,ty = end_target[0]-start_target[0],end_target[1]-start_target[1]
        self.part(canvas,name,pivot,start_target,math.hypot(tx,ty)/math.hypot(dx,dy),math.atan2(ty,tx)-math.atan2(dy,dx))

    def limb(self, canvas, name, pivot, ankle, root_target, ankle_target, scale):
        texture,origin = self.parts[name]
        factor = self.scale
        rx,ry = root_target[0]*factor,root_target[1]*factor
        ax,ay = ankle_target[0]*factor,ankle_target[1]*factor
        unit = scale*factor
        correction = ax-rx-(ankle[0]-pivot[0])*unit
        mesh = []
        def source_point(x,y):
            if y > ay:
                sy = ankle[1]+(y-ay)/unit
            else:
                sy = pivot[1]+(y-ry)*(ankle[1]-pivot[1])/(ay-ry)
            t = max(0,min(1,(sy-pivot[1])/(ankle[1]-pivot[1])))
            # A small smooth knee flex, zero at root/ankle, preserves continuity.
            flex = .7*factor*math.sin(math.pi*t)*(ax-rx)/12
            sx = pivot[0]+(x-rx-t*correction-flex)/unit
            return sx-origin[0],sy-origin[1]
        width,height = self.frame
        for y in range(height):
            mesh.append(((0,y,width,y+1),(*source_point(0,y),*source_point(0,y+1),*source_point(width,y+1),*source_point(width,y))))
        canvas.alpha_composite(texture.transform(self.frame,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC))


def knee(hip, ankle, upper, lower, bend=1):
    dx,dy = ankle[0]-hip[0],ankle[1]-hip[1]
    actual = math.hypot(dx,dy)
    if actual > upper+lower or actual < abs(upper-lower):
        raise ValueError("Unreachable limb target")
    distance = min(upper+lower-.001,max(abs(upper-lower)+.001,actual))
    along = (upper*upper-lower*lower+distance*distance)/(2*distance)
    across = math.sqrt(max(0,upper*upper-along*along))*bend
    return (hip[0]+dx/distance*along-dy/distance*across,hip[1]+dy/distance*along+dx/distance*across)


def swing(phase, start, stride, stance, lift):
    """Distance-locked stance; C1 horizontal and vertical contact transitions."""
    if phase < stance:
        return start+stride*phase,0
    t = (phase-stance)/(1-stance)
    # Hermite endpoints continue stance velocity at toe-off and touchdown.
    h00,h10,h01,h11 = 2*t**3-3*t*t+1,t**3-2*t*t+t,-2*t**3+3*t*t,t**3-t*t
    x = h00*(start+stride*stance)+h10*stride*(1-stance)+h01*start+h11*stride*(1-stance)
    return x,-lift*math.sin(math.pi*t)**2


def bake(root, name, frames, display, ground, sequences, inputs, settings, quality=85):
    """Validate before writing a deployable derivative. Never accept clipped cells."""
    expected = sum(count for first,count in sequences.values())
    if not frames or not sequences or len(frames) != expected:
        raise ValueError("Incomplete pose output")
    cursor = 0
    for first,count in sequences.values():
        if first != cursor or count <= 0:
            raise ValueError("Non-contiguous pose registration")
        cursor += count
    width,height = frames[0].size
    bounds = []
    for frame in frames:
        if frame.mode != "RGBA" or frame.size != (width,height):
            raise ValueError("Inconsistent RGBA frame geometry")
        box = frame.getchannel("A").point(lambda x:255 if x>=32 else 0).getbbox()
        if not box or box[0] < 1 or box[1] < 1 or box[2] >= width or box[3] >= height:
            raise ValueError(f"Empty or clipped pose: {box}")
        if abs(box[3]-ground) > 2:
            raise ValueError(f"Unstable grounding: {box[3]} versus {ground}")
        bounds.append(box)
    atlas = Image.new("RGBA",(width*8,height*math.ceil(len(frames)/8)))
    for i,frame in enumerate(frames):
        atlas.alpha_composite(frame,((i%8)*width,(i//8)*height))
    out = root/"art-source/expedition-1.0"
    out.mkdir(parents=True,exist_ok=True)
    atlas.save(out/f"{name}-animation.png")
    production = root/f"public/art/expedition/{name}-animation.webp"
    encoded = BytesIO()
    atlas.save(encoded,format="WebP",quality=quality,method=6)
    decoded = Image.open(BytesIO(encoded.getvalue())).convert("RGBA")
    if decoded.size != atlas.size or decoded.getchannel("A").tobytes() != atlas.getchannel("A").tobytes():
        raise ValueError("Encoded geometry/alpha differs")
    production.write_bytes(encoded.getvalue())
    record = {"character":name,"toolchain":{"python":sys.version.split()[0],"pillow":pillow_version,"webp":features.version("webp")},"inputs":{str(p.relative_to(root)):{"bytes":p.stat().st_size,"sha256":sha(p)} for p in inputs},"frame":{"width":width,"height":height,"displayWidth":display[0],"displayHeight":display[1],"ground":ground},"sequences":sequences,"frames":len(frames),"columns":8,"atlasSize":atlas.size,"settings":{"format":"WebP","quality":quality,"method":6,**settings},"alphaExactAfterEncoding":True,"frameAlphaBounds":bounds,"production":{"file":str(production.relative_to(root)),"bytes":production.stat().st_size,"sha256":sha(production)}}
    (out/f"{name}-conversion.json").write_text(json.dumps(record,indent=2)+"\n")
    print(name,len(frames),production.stat().st_size,"bytes")
    return record
