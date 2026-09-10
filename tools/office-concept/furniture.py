from primitives import *


def chair(name,x,y,angle,m):
    # A local parent makes orientation and later animation placement explicit.
    parent=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(parent)
    parts=[]
    parts.append(box(name+' cushion',(0,0,.47),(.49,.48,.12),m['sage'],.055))
    parts.append(box(name+' back',(0,.20,.78),(.5,.10,.49),m['sage'],.045))
    parts.append(cylinder(name+' stem',(0,0,.25),.035,.4,m['frame']))
    for sign in [-1,1]:
        parts.append(bar(name+' arm support',(sign*.28,0,.48),(sign*.28,0,.68),.018,m['frame']))
        parts.append(box(name+' arm',(sign*.28,0,.68),(.07,.35,.05),m['cream'],.02))
    for i in range(5):
        a=i*math.tau/5
        end=(math.sin(a)*.30,math.cos(a)*.30,.09)
        parts.append(bar(name+' base',(0,0,.15),end,.022,m['frame']))
        parts.append(sphere(name+' caster',(end[0],end[1],.055),(.055,.035,.055),m['dark']))
    for obj in parts:obj.parent=parent
    parent.location=(x,y,0)
    parent.rotation_euler.z=angle
    return parent


def monitor(name,x,y,sign,m):
    box(name+' housing',(x,y,1.095),(.72,.05,.46),m['cream'],.035)
    face=box(name+' DISPLAY',(x,y+sign*.031,1.095),(.66,.009,.39),m['screen'],.012)
    face['role']='shared_screen'
    face['seat_id']=name
    box(name+' stand',(x,y,.85),(.045,.05,.20),m['frame'],.01)
    box(name+' base',(x,y,.775),(.27,.18,.015),m['cream'],.01)
    # Flat coloured app panels stay separate so the live texture can replace them later.
    for col in range(3):
        box(name+' placeholder card '+str(col),(x-.20+col*.2,y+sign*.038,1.10),(.15,.006,.22),m['ui'+str(col)],.008)
    box(name+' keyboard',(x,y+sign*.46,.80),(.43,.15,.02),m['cream'],.015)
    box(name+' mouse',(x+.30,y+sign*.46,.805),(.055,.09,.035),m['cream'],.025)
    return face


def plant(name,x,y,size,m):
    cylinder(name+' pot',(x,y,size*.16),size*.17,size*.32,m['cream'])
    bar(name+' trunk',(x,y,size*.25),(x,y,size*.86),size*.025,m['wood'])
    for i in range(7):
        a=i*2.4
        px=x+math.cos(a)*size*.22
        py=y+math.sin(a)*size*.22
        z=size*(.58+i*.055)
        bar(name+' branch',(x,y,z-.1),(px,py,z),size*.009,m['wood'])
        sphere(name+' leaf crown',(px,py,z),(size*.19,size*.16,size*.16),m['green'])


def desk_island(name,x,y,m):
    box(name+' top',(x,y,.755),(3.6,1.7,.085),m['wood'],.035)
    for dx in [-1.68,1.68]:
        box(name+' oak end',(x+dx,y,.37),(.12,1.61,.72),m['wood'],.02)
    box(name+' privacy divider',(x,y,.99),(3.45,.055,.4),m['sage'],.025)
    for col,dx in enumerate([-.86,.86]):
        for row,sign in enumerate([-1,1]):
            seat=f'{name}_Seat_{col*2+row+1}'
            monitor(seat,x+dx,y+sign*.2,sign,m)
            chair(seat+' chair',x+dx,y+sign*1.18,0 if sign==1 else math.pi,m)
            cylinder(seat+' mug',(x+dx-.35,y+sign*.61,.835),.04,.085,m['terra'])
    plant(name+' desk plant',x,y,.32,m)


def room_front(name,x1,x2,y,height,m):
    door_x=x1+.60
    # Clear glass is omitted from the doorway, with an open door leaf.
    for px in [x1,x1+1.20,x2]:box(name+' mullion',(px,y,height/2),(.045,.055,height),m['frame'],.006)
    box(name+' top rail',((x1+x2)/2,y,height),(x2-x1,.055,.055),m['frame'],.006)
    box(name+' bottom rail',((x1+x2)/2,y,.035),(x2-x1,.055,.04),m['frame'],.006)
    box(name+' glazing',((x1+1.2+x2)/2,y,height/2),(x2-x1-1.2,.018,height-.05),m['glass'],0)
    door=box(name+' open glass door',(door_x,y-.34,height/2),(1.08,.018,height-.05),m['glass'],0)
    door.rotation_euler.z=math.radians(35)
    bar(name+' door handle',(x1+.95,y-.56,.97),(x1+.95,y-.56,1.30),.018,m['frame'])
