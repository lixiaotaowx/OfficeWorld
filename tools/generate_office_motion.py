"""Bake original seated office motions for the existing Epic mannequin skeleton.
Uses the installed idle pose, analytical two-bone IK, and authored motion curves.
No network or runtime Python dependency.
"""
import json,math,pathlib,copy
ROOT=pathlib.Path(__file__).resolve().parents[1]
rig=json.loads((ROOT/'OfficeWorld/Saved/office-rig.json').read_text())
names=list(rig)
def add(a,b):return [x+y for x,y in zip(a,b)]
def sub(a,b):return [x-y for x,y in zip(a,b)]
def mul(a,s):return [x*s for x in a]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def norm(a):return math.sqrt(dot(a,a))
def unit(a):return mul(a,1/max(norm(a),1e-9))
def qm(a,b):return add(add(mul(b[:3],a[3]),mul(a[:3],b[3])),cross(a[:3],b[:3]))+[a[3]*b[3]-dot(a[:3],b[:3])]
def qi(q):return [-q[0],-q[1],-q[2],q[3]]
def qr(q,v):return qm(qm(q,v+[0]),qi(q))[:3]
def arc(a,b):
 a,b=unit(a),unit(b);q=cross(a,b)+[1+dot(a,b)]
 if norm(q)<1e-6:q=unit(cross(a,[0,1,0]))+[0]
 return unit(q)
def axis(a,deg):s=math.sin(math.radians(deg)/2);return mul(unit(a),s)+[math.cos(math.radians(deg)/2)]
def lerp(a,b,t):return add(mul(a,1-t),mul(b,t))
def qlerp(a,b,t):return unit(lerp(a,mul(b,-1) if dot(a,b)<0 else b,t))
def fk(p):
 w={}
 for b in names:
  par=rig[b]['parent'];l=p[b]
  if par in w:w[b]={'p':add(w[par]['p'],qr(w[par]['q'],l['p'])),'q':qm(w[par]['q'],l['q'])}
  else:w[b]={'p':l['p'][:],'q':l['q'][:]}
 return w
base={b:copy.deepcopy(v['local']) for b,v in rig.items()}
def set_world_q(p,b,q,w=None):
 w=w or fk(p);par=rig[b]['parent'];p[b]['q']=qm(qi(w[par]['q']),q) if par in w else q
def ik(p,a,b,c,target,pole):
 w=fk(p);start=w[a]['p'];l1=norm(sub(w[b]['p'],start));l2=norm(sub(w[c]['p'],w[b]['p']));d=sub(target,start);length=min(norm(d),l1+l2-.01);direction=unit(d)
 along=(l1*l1-l2*l2+length*length)/(2*length);height=math.sqrt(max(l1*l1-along*along,0));side=unit(sub(sub(pole,start),mul(direction,dot(sub(pole,start),direction))))
 knee=add(add(start,mul(direction,along)),mul(side,height));set_world_q(p,a,qm(arc(sub(w[b]['p'],start),sub(knee,start)),w[a]['q']),w)
 w=fk(p);set_world_q(p,b,qm(arc(sub(w[c]['p'],w[b]['p']),sub(target,w[b]['p'])),w[b]['q']),w)
def seated(t=0,ack=False):
 p=copy.deepcopy(base);p['pelvis']['p']=[0,-2,56+.25*math.sin(t*math.pi)]
 for side,sgn in [('l',1),('r',-1)]:
  ik(p,'thigh_'+side,'calf_'+side,'foot_'+side,[sgn*13,44,8],[sgn*14,85,55])
  set_world_q(p,'foot_'+side,rig['foot_'+side]['world']['q'])
  hand=[sgn*16,44,76+(.6*math.sin(t*math.pi*6+sgn))]
  ik(p,'upperarm_'+side,'lowerarm_'+side,'hand_'+side,hand,[sgn*45,10,77])
  # Palm and fingers face the keyboard; use the hand's own longitudinal axis.
  w=fk(p);finger='middle_01_'+side
  set_world_q(p,'hand_'+side,qm(arc(sub(w[finger]['p'],w['hand_'+side]['p']),[0,1,-.07]),w['hand_'+side]['q']),w)
  for f in ['index','middle','ring','pinky']:
   b=f+'_01_'+side
   p[b]['q']=qm(p[b]['q'],axis([0,0,1],3*math.sin(t*math.pi*6+(len(f)+sgn))))
 p['head']['q']=qm(p['head']['q'],axis([1,0,0],(15*math.sin(t*math.pi/2) if ack else 2*math.sin(t*math.pi/2))))
 return p
def transition(t,reverse=False):
 s=t*t*(3-2*t);s=1-s if reverse else s;target=seated(0)
 return {b:{'p':lerp(base[b]['p'],target[b]['p'],s),'q':qlerp(base[b]['q'],target[b]['q'],s),'s':base[b]['s']} for b in names}
animations={}
for name,duration,fn in [('Office_Work',4,seated),('Office_Acknowledge',4,lambda t:seated(t,True)),('Office_SitDown',1.2,lambda t:transition(t/1.2)),('Office_StandUp',1.2,lambda t:transition(t/1.2,True))]:
 frames=[fn(i/30) for i in range(round(duration*30)+1)]
 animations[name]={'frames':len(frames)-1,'tracks':{b:{'p':[p[b]['p'] for p in frames],'q':[p[b]['q'] for p in frames],'s':[base[b]['s']]} for b in names if not b.startswith('VB ')}}
dest=ROOT/'OfficeWorld/Saved/office-authored-motion.json';dest.write_text(json.dumps(animations,separators=(',',':')))
w=fk(seated());print(json.dumps({b:w[b]['p'] for b in ['pelvis','calf_l','foot_l','hand_l','head']},indent=2));print(dest)
