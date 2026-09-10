import bpy,sys,math
sys.path.insert(0,r'G:/C/wendang/ChatGPT/youxi/tools/office-concept')
from primitives import *
from furniture import *
names={'cream':'Ivory porcelain','wood':'Pale natural oak','sage':'Muted sage upholstery','frame':'Warm graphite','dark':'Graphite rubber','green':'Foliage olive','terra':'Muted terracotta','screen':'Display background','ui0':'UI mint','ui1':'UI blue','ui2':'UI white','glass':'Clear glass','rug':'Sage woven rug'}
m={k:bpy.data.materials[v] for k,v in names.items()}
# Transparent stylized glazing: low-cost preview, no expensive transmission required.
glass=next(n for n in m['glass'].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
glass.inputs['Transmission Weight'].default_value=0
glass.inputs['Alpha'].default_value=.09
glass.inputs['Roughness'].default_value=.2
m['glass'].diffuse_color=(.65,.82,.76,.09)
m['glass'].surface_render_method='DITHERED'
# Lounge, using a curved segmented sofa, separate editable cushions and shell.
box('Lounge / rug',(-6.7,1.65,.015),(4.85,3.5,.026),m['rug'],.32)
for i in range(5):
 a=math.radians(35+i*24)
 x=-7.15+math.cos(a)*1.6
 y=1.2+math.sin(a)*1.2
 cushion=box('Lounge / curved sofa cushion',(x,y,.44),(.86,.9,.26),m['cream'],.12)
 cushion.rotation_euler.z=a-math.pi/2
 back=box('Lounge / curved sofa back',(x+math.cos(a)*.32,y+math.sin(a)*.32,.78),(.88,.24,.62),m['cream'],.10)
 back.rotation_euler.z=a-math.pi/2
for x,y,ang in [(-5.0,1.1,-.35),(-5.9,.1,-.8)]:
 root=bpy.data.objects.new('Lounge / terracotta armchair',None);bpy.context.collection.objects.link(root)
 for name,loc,dim in [('seat',(0,0,.43),(.74,.73,.25)),('back',(0,.28,.77),(.76,.19,.67)),('left arm',(-.35,0,.63),(.17,.77,.35)),('right arm',(.35,0,.63),(.17,.77,.35))]:
  obj=box('Lounge / '+name,loc,dim,m['terra'],.08);obj.parent=root
 root.location=(x,y,0);root.rotation_euler.z=ang
cylinder('Lounge / coffee tabletop',(-6.6,1.35,.43),.62,.07,m['wood'])
cylinder('Lounge / coffee table base',(-6.6,1.35,.20),.36,.39,m['cream'])
plant('Lounge / indoor tree',-8.85,3.9,2.5,m)
plant('Lounge / tabletop plant',-6.6,1.35,.25,m)
for obj in bpy.context.scene.objects:
 if obj.name.startswith('Lounge / tabletop plant'):obj.location.z+=.48
# Wall art, shelving and understated decorative details.
for name,x,y in [('Coffee art',-2.35,6.35),('Manager art',8.15,6.35)]:
 box(name+' frame',(x,y,2.1),(.88,.065,1.15),m['wood'],.01)
 box(name+' ivory mat',(x,y-.041,2.1),(.79,.015,1.06),m['cream'],.005)
 box(name+' sage graphic',(x-.10,y-.055,2.17),(.37,.012,.70),m['sage'],.12)
 box(name+' sand graphic',(x+.17,y-.060,1.95),(.30,.012,.42),m['terra'],.10)
plant('Meeting / corner tree',1.5,5.9,1.8,m)
# Pendant fixture in meeting room; thin cables only, no ceiling slab.
box('Meeting / pendant diffuser',(3.8,4.2,2.85),(1.75,.24,.075),m['cream'],.07)
for x in [3.25,4.35]:bar('Meeting / pendant cable',(x,4.2,2.89),(x,4.2,3.6),.007,m['frame'])
area('Meeting pendant light',(3.8,4.2,2.78),(3.8,4.2,0),65,1.7,(1,.88,.70))
# Minimal stylized park backdrop, geometry suitable for later simplification.
park=material('Park meadow',(.40,.50,.24),1)
box('Exterior / park strip',(.5,9.8,-.24),(26,6,.12),park)
for i in range(11):plant('Exterior / tree '+str(i),-11+i*2.35,10+(i%2)*1.3,2.8+(i%3)*.45,m)
# Entry steps at left, maintained open passage along front edge.
for i in range(3):box('Entry step '+str(i),(-8,-6.8-i*.34,-.08-i*.10),(2.5,.36,.18),m['wood'])
# Presentation framing, all lighting remains individually editable.
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.region_3d.view_perspective='CAMERA'
   a.spaces.active.region_3d.view_camera_zoom=15
   a.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('PHASE 3: lounge, art, planting, entry and transparent glass saved.')
