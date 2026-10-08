"""Sculpted cartoon hair and beards: broad locks, no individual fibres."""
import math
from ruler_detail_geometry import Surface, bezier

BROWN = (.065, .032, .018)

def lock(s, points, width, depth, color):
    # Broad, flattened sculpted tuft, with a rounded root and deliberate pointed tip.
    start = len(s.vertices)
    for i, (x, y, z) in enumerate(points):
        t = i / (len(points) - 1)
        profile = max(.025, math.sin(math.pi * (.15 + .85 * t)) ** .65)
        for j in range(12):
            a = j * math.tau / 12
            s.vertex((x + width * profile * math.cos(a),
                      y + depth * profile * math.sin(a), z), color)
        if i:
            for j in range(12):
                a = start + (i - 1) * 12 + j
                b = start + (i - 1) * 12 + (j + 1) % 12
                s.faces.append((a, b, b + 12, a + 12))
    s.faces.append(tuple(start + j for j in reversed(range(12))))
    s.faces.append(tuple(start + (len(points)-1)*12+j for j in range(12)))

def tuft(s, a, b, c, d, width, depth, color=BROWN):
    lock(s, bezier(a, b, c, d, 18), width, depth, color)

def moustache(s, curl, col):
    for side in [-1, 1]:
        # Two generous sweeping lobes form one readable silhouette.
        pts = bezier((side*.009, -.084, 1.38), (side*.08, -.099, 1.39),
                     (side*.105, -.096, 1.31), (side*(.145 if curl else .105), -.078,
                     1.405 if curl else 1.35), 24)
        # Tuft cross sections follow the curve instead of becoming whisker tubes.
        from mathutils import Vector
        start = len(s.vertices)
        for i,p in enumerate(pts):
            t=i/(len(pts)-1)
            tangent=(Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(0,i-1)])).normalized()
            normal=tangent.cross(Vector((0,1,0))).normalized()
            r=.025*(1-t)**.55+.001
            for j in range(12):
                a=j*math.tau/12
                q=Vector(p)+normal*r*math.cos(a)+Vector((0,1,0))*.017*(1-t+.05)*math.sin(a)
                s.vertex(q,col)
            if i:
                for j in range(12):
                    a=start+(i-1)*12+j;b=start+(i-1)*12+(j+1)%12
                    s.faces.append((a,b,b+12,a+12))
        s.faces.append(tuple(start+j for j in reversed(range(12))))
        s.faces.append(tuple(start+(len(pts)-1)*12+j for j in range(12)))

def beard(name, kind):
    s=Surface();col=(.72,.68,.57) if kind=='white' else BROWN
    moustache(s,kind=='curl',col)
    if kind not in ['moustache','curl']:
        count={'full':7,'square':5,'white':5,'goatee':3}[kind]
        width={'full':.245,'square':.14,'white':.085,'goatee':.05}[kind]
        for i in range(count):
            u=(i/(count-1)*2-1)
            x=u*width
            root=1.335+(.055*abs(u)**2 if kind=='full' else .005)
            length={'full':.145*(1-.5*abs(u)), 'square':.12,
                    'white':.27*(1-.35*abs(u)), 'goatee':.105*(1-.3*abs(u))}[kind]
            endx=x*(.87 if kind in ['full','square'] else .45)
            tuft(s,(x,-.06,root),(x,-.085,root-.025),
                 (endx,-.09,root-length*.7),(endx,-.064,root-length),
                 width/(count-1)*1.5,.025,tuple(c*(1-.055*(i%2)) for c in col))
    # Ruler face is y=-.043: embed the rear surface slightly into the face.
    s.vertices=[(x,y+.028,z) for x,y,z in s.vertices]
    s.finish(name,.64)

def hair(name,kind):
    s=Surface();col=BROWN
    s.ellipsoid((0,-.025,1.755),(.302,.097,.074),col)
    if kind=='afro':
        # A handful of large cloud lobes, not hundreds of curls.
        for i in range(9):
            a=i*math.pi/8
            s.ellipsoid((.245*math.cos(a),-.04,1.75+.115*math.sin(a)),
                        (.095,.103,.093),col,24,16)
    elif kind in ['short','bangs','bob']:
        count=4 if kind=='short' else 7
        for i in range(count):
            u=i/(count-1)*2-1;x=u*.255
            z=1.8+(.065*(1-u)/2 if kind=='short' else .02*(1-u*u))
            bottom=1.68+.045*u if kind=='short' else 1.66+.012*math.cos(u*6)
            tuft(s,(x-.035,-.08,z),(x+.055,-.14,z),
                 (x+.025,-.14,bottom+.035),(x-.018,-.10,bottom),.098 if kind=='short' else .074,.04,col)
        if kind=='bob':
            for side in [-1,1]:
                tuft(s,(side*.265,-.01,1.77),(side*.33,-.07,1.72),
                     (side*.34,-.065,1.55),(side*.30,-.035,1.53),.066,.068,col)
    else:
        for side in [-1,1]:
            # Side part, leaving the eyes and face open.
            tuft(s,(side*.06,-.07,1.815),(side*.2,-.12,1.83),
                 (side*.27,-.125,1.72),(side*.28,-.095,1.66),.075,.038,col)
            for i in range(3):
                x=side*(.265+i*.025)
                if kind=='long':
                    end=(side*(.27+i*.027),-.02,1.24+i*.024)
                    control=(side*.34,-.025,1.43)
                else:
                    end=(side*(.34+i*.03),-.015,1.39+i*.035)
                    control=(side*.43,-.035,1.60)
                tuft(s,(x,0,1.74),(side*.36,-.045,1.72),control,end,.049,.047,col)
            if kind=='tails':
                s.ellipsoid((side*.32,-.035,1.7),(.048,.067,.025),(.34,.13,.055))
    # Flatten the fringe toward the thin ruler face, keeping the cap wrapped around it.
    s.vertices=[(x,-.039+(y+.043)*.38 if y<-.043 else y,z) for x,y,z in s.vertices]
    s.finish(name,.60)

def build_all():
    for name,kind in [('小胡子','moustache'),('山羊胡','goatee'),('络腮胡','full'),('长白胡','white'),('八字胡','curl'),('方框胡','square')]:
        beard('胡子_'+name,kind)
    for name,kind in [('短发','short'),('刘海','bangs'),('爆炸头','afro'),('长直发','long'),('蘑菇头','bob'),('双马尾','tails')]:
        hair('头发_'+name,kind)
