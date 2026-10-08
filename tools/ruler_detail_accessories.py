"""Replace block accessories with groomed fibres and tailored hat surfaces."""
import math
from ruler_detail_geometry import Surface, rng, shade, bezier

DARK=(.045,.025,.014)

def moustache(s, curled=False, color=DARK):
    for side in [-1,1]:
        for i in range(190):
            u=rng.random()
            z=1.386-rng.random()*.027
            x=side*(.007+u*.035)
            end=side*(.075+u*.06 if curled else .05+u*.047)
            points=bezier((x,-.113,z),(side*.055,-.14,z+.005),
                (end,-.135,1.325 if curled else 1.351),(end,-.109,1.395 if curled else 1.344-rng.random()*.01),9)
            s.tube(points,.0015+rng.random()*.001,shade(color,.65))

def beard(name,kind):
    s=Surface()
    white=(.66,.61,.51)
    col=white if kind=='white' else DARK
    moustache(s,kind=='curl',col)
    if kind not in ['moustache','curl']:
        # A curved, tapered undercoat keeps individual fibres from looking like wire.
        width={'full':.265,'square':.15,'white':.092,'goatee':.065}[kind]
        def undercoat(u,v):
            x=(u*2-1)*width
            edge=abs(u*2-1)
            top=1.337+(.125*edge**2 if kind=='full' else .04*edge**3)
            length={'full':.125,'square':.105,'white':.25,'goatee':.082}[kind]
            return (x*(1-v*(.15 if kind in ['full','square'] else .7)),
                -.103-.021*math.sin(v*math.pi)*(1-edge*.4),
                top-v*length*(1-edge*.65))
        s.patch(undercoat,60,20,tuple(c*.65 for c in col))
        count=650 if kind in ['full','square','white'] else 350
        for i in range(count):
            u=rng.uniform(-1,1)
            side=1 if u>=0 else -1
            if kind=='full':
                x=u*.275
                root=1.34+.125*abs(u)**2
                length=.068+.09*(1-abs(u))
                endx=x*.8
            elif kind=='square':
                x=u*.16
                root=1.345+.06*abs(u)**3
                length=.115+rng.random()*.025
                endx=x*.9
            else:
                x=u*(.1 if kind=='white' else .07)
                root=1.337+rng.random()*.015
                length=(.29 if kind=='white' else .11)*(1-.65*abs(u))
                endx=x*.32
            root+=rng.uniform(-.009,.01)
            length*=rng.uniform(.65,1.1)
            y=-.104-rng.random()*.02
            pts=bezier((x,y,root),(x+side*.01,y-.025,root-length*.3),
                (endx+side*.008,y-.026,root-length*.75),
                (endx+rng.uniform(-.007,.007),y+.008,root-length),9)
            # Fine separate fibres, soft ends; no rectangular backing plate.
            s.tube(pts,rng.uniform(.0011,.0025),shade(col,.65))
    s.vertices=[(x,y+.055,z) for x,y,z in s.vertices]
    s.finish(name,.74)

def hair(name,kind):
    s=Surface()
    col=(.034,.02,.014)
    if kind=='afro':
        s.patch(lambda u,v:(.33*math.sin(v*math.pi/2)*math.cos(u*math.tau),
            -.035+.19*math.sin(v*math.pi/2)*math.sin(u*math.tau),
            1.73+.19*math.cos(v*math.pi/2)),48,24,tuple(c*.7 for c in col))
        for i in range(950):
            a=rng.uniform(0,2*math.pi); v=rng.uniform(0,1.52)
            x=.33*math.sin(v)*math.cos(a); y=-.035+.19*math.sin(v)*math.sin(a)
            z=1.73+.19*math.cos(v)
            pts=[(x+.011*math.cos(t*math.pi*4),y+.011*math.sin(t*math.pi*4),z+.024*t)
                for t in [j/12 for j in range(13)]]
            s.tube(pts,.004,shade(col,.55),5,False)
    else:
        s.ellipsoid((0,-.028,1.752),(.305,.105,.07),col)
        # Follow the scalp over the crown, connecting the fringe/side locks.
        for i in range(240):
            a=rng.uniform(0,math.tau)
            pts=[]
            for j in range(15):
                v=.05+j*1.49/14
                sweep=a+.1*math.sin(v)
                pts.append((.307*math.sin(v)*math.cos(sweep),
                    -.028+.107*math.sin(v)*math.sin(sweep),1.752+.073*math.cos(v)))
            s.tube(pts,.0015,shade(col,.5))
        for i in range(650):
            u=rng.uniform(-1,1)
            x=u*.3; z=1.75+.046*(1-u*u)+rng.random()*.015
            y=-.125+rng.uniform(-.012,.012)
            if kind=='short':
                end=(x-.045,-.114,1.665+.06*(1-abs(u)))
                control=(x+.045,y-.028,z+.04)
            elif kind=='bangs':
                end=(x+.028,-.139,1.635+.028*math.sin(u*5))
                control=(x+.045,y-.026,z)
            elif kind=='bob':
                end=(u*.332,-.105,1.57+.08*(1-abs(u)))
                control=(u*.36,y-.025,z+.02)
            elif kind=='long':
                x=(1 if u>0 else -1)*(.25+abs(u)*.07)
                end=(x+rng.uniform(-.014,.014),-.08,1.23+rng.random()*.08)
                control=(x*1.06,y-.02,1.64)
            else:
                side=1 if u>0 else -1
                x=side*(.25+abs(u)*.06)
                end=(side*(.31+.06*abs(u)),-.04,1.36+rng.random()*.14)
                control=(side*.43,y,1.69)
            s.tube(bezier((x,y,z),control,(end[0]+.01,end[1]-.03,end[2]+.08),end),
                rng.uniform(.0014,.003),shade(col,.65))
        if kind=='tails':
            for side in [-1,1]:
                s.ellipsoid((side*.33,-.06,1.68),(.029,.067,.022),(.25,.105,.044))
    s.finish(name,.57)

def ring(s,rx,ry,z,r,color,cy=-.035):
    s.tube([(rx*math.cos(a),cy+ry*math.sin(a),z) for a in [j*math.tau/96 for j in range(97)]],r,color,6,False)

def hat(name,kind):
    s=Surface()
    colors={'cap':(.055,.095,.10),'beanie':(.25,.105,.045),'straw':(.52,.32,.12),
        'tophat':(.035,.04,.036),'party':(.19,.095,.055),'beret':(.11,.145,.082)}
    col=colors[kind]
    if kind=='party':
        s.patch(lambda u,v:((.25*(1-v)+.003)*math.cos(u*math.tau),
            -.035+(.14*(1-v)+.003)*math.sin(u*math.tau),1.745+.39*v),64,24,col)
        for i in range(28):
            a=rng.random()*math.tau; t=rng.uniform(.1,.9)
            s.ellipsoid((.253*(1-t)*math.cos(a),-.035+.143*(1-t)*math.sin(a),1.745+.39*t),(.009,.007,.009),(.7,.49,.18),12,8)
        s.ellipsoid((0,-.035,2.165),(.024,.024,.024),(.68,.44,.14))
    elif kind=='tophat':
        s.patch(lambda u,v:((.278+.012*math.sin(v*math.pi))*math.cos(u*math.tau),
            -.035+(.14+.012*math.sin(v*math.pi))*math.sin(u*math.tau),1.75+.24*v),64,18,col)
        s.ellipsoid((0,-.035,1.99),(.28,.143,.014),col)
    else:
        rx=.34 if kind=='beret' else .31
        rz=.115 if kind=='straw' else .17
        s.patch(lambda u,v:(rx*math.sin(v*math.pi/2)*math.cos(u*math.tau)+(.045*(1-v) if kind=='beret' else 0),
            -.035+.155*math.sin(v*math.pi/2)*math.sin(u*math.tau),1.747+rz*math.cos(v*math.pi/2)),80,24,col)
        for j in range(64 if kind=='beanie' else 8):
            a=j*math.tau/(64 if kind=='beanie' else 8)
            pts=[(rx*math.sin(v)*math.cos(a)+(.045*(1-v/(math.pi/2)) if kind=='beret' else 0),
                -.035+.157*math.sin(v)*math.sin(a),1.748+(rz+.002)*math.cos(v))
                for v in [.12+k*1.45/24 for k in range(25)]]
            s.tube(pts,.0028 if kind=='beanie' else .0014,shade(col,.2),5,False)
    if kind in ['straw','tophat']:
        rx=.435 if kind=='straw' else .35
        ry=.245 if kind=='straw' else .21
        s.patch(lambda u,v:((.26+(rx-.26)*v)*math.cos(u*math.tau),
            -.035+(.135+(ry-.135)*v)*math.sin(u*math.tau),1.745-.015*math.sin(v*math.pi)),96,12,col)
        ring(s,rx,ry,1.745,.005,col)
        if kind=='straw':
            for j in range(32):
                t=j/31
                ring(s,.262+.173*t,.136+.109*t,1.746-.015*math.sin(t*math.pi),.0017,shade(col,.22))
            for j in range(30):
                v=.06+j*1.49/29
                ring(s,.312*math.sin(v),.157*math.sin(v),1.747+.117*math.cos(v),.0016,shade(col,.22))
        else:
            for j in range(6):
                ring(s,.282,.145,1.765+j*.006,.004,(.13,.082,.038))
            s.ellipsoid((.1,-.173,1.78),(.02,.003,.015),(.35,.24,.10),16,10)
    if kind=='beanie':
        # Interlocking V stitches over the knitted crown and folded cuff.
        for row in range(24):
            v=.2+row*1.35/24
            for col_index in range(80):
                a=(col_index+(row%2)*.5)*math.tau/80
                points=[]
                for da,dv in [(-.025,-.023),(0,.023),(.025,-.023)]:
                    points.append((.313*math.sin(v+dv)*math.cos(a+da),
                        -.035+.159*math.sin(v+dv)*math.sin(a+da),1.749+.173*math.cos(v+dv)))
                s.tube(points,.0019,shade(col,.2),4,False)
    if kind=='cap':
        s.patch(lambda u,v:((u*2-1)*(.27+.025*v),-.09-.27*v*math.sqrt(max(0,1-(u*2-1)**2)),
            1.749-.026*v+.025*(u*2-1)**2),48,16,col)
        s.tube([((u*2-1)*.29,-.09-.27*math.sqrt(max(0,1-(u*2-1)**2)),1.727+.025*(u*2-1)**2)
            for u in [j/48 for j in range(49)]],.003,(.23,.27,.22),6,False)
        s.ellipsoid((0,-.035,1.919),(.017,.013,.009),col)
    for j in range(4 if kind=='beanie' else 2):
        ring(s,.31 if kind not in ['party','tophat'] else .278,.157 if kind!='party' else .144,
            1.744+j*.009,.007 if kind=='beanie' else .004,shade(col,.15))
    s.finish(name,.85 if kind in ['beanie','straw','beret'] else .58)

def glasses():
    s=Surface(); black=(.012,.014,.012); brass=(.35,.23,.095)
    for side in [-1,1]:
        cx=side*.162
        pts=[]
        for j in range(81):
            a=j*math.tau/80
            pts.append((cx+.128*math.copysign(abs(math.cos(a))**.72,math.cos(a)),
                -.12,1.486+.091*math.copysign(abs(math.sin(a))**.72,math.sin(a))))
        s.tube(pts,.008,black,8,False)
        s.tube(bezier((side*.29,-.12,1.514),(side*.32,-.1,1.515),
            (side*.32,.005,1.505),(side*.3,.04,1.47)),.006,black,7,False)
        s.ellipsoid((side*.284,-.127,1.514),(.007,.004,.004),brass,12,8)
    s.tube(bezier((-.033,-.12,1.506),(-.02,-.136,1.532),(.02,-.136,1.532),(.033,-.12,1.506)),.005,brass,8,False)
    s.finish('眼镜',.25,.12)

def build_all():
    for name,kind in [('小胡子','moustache'),('山羊胡','goatee'),('络腮胡','full'),('长白胡','white'),('八字胡','curl'),('方框胡','square')]: beard('胡子_'+name,kind)
    for name,kind in [('短发','short'),('刘海','bangs'),('爆炸头','afro'),('长直发','long'),('蘑菇头','bob'),('双马尾','tails')]: hair('头发_'+name,kind)
    for name,kind in [('棒球帽','cap'),('礼帽','tophat'),('毛线帽','beanie'),('草帽','straw'),('派对帽','party'),('贝雷帽','beret')]: hat('帽子_'+name,kind)
    glasses()

