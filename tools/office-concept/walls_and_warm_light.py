import bpy,sys,math
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import material,box,area
s=bpy.context.scene
assert not s.get('walls_warm_light_v1')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Walls_Lighting.blend'),copy=True)
wall=material('Perimeter warm plaster',(.72,.67,.57),.85)
frame=material('Perimeter pale oak trim',(.39,.28,.16),.6)
col=bpy.data.collections.new('14 Perimeter - roofless');s.collection.children.link(col)
def part(name,loc,dims,mat=wall):
 o=box(name,loc,dims,mat,.025)
 for c in list(o.users_collection):c.objects.unlink(o)
 col.objects.link(o)
 return o
# Existing rear windows and meeting-room rear walls already close the back edge.
part('Left window sill wall',(-10,.85,.25),(.18,14.7,.5))
part('Left window head',(-10,.85,3.3),(.20,14.7,.25))
for y in [-6.4,-3.1,.2,2.1,6.4,8.1]:
 part('Left window upright',(-10,y,1.8),(.16,.12,3.0),frame)
part('Coffee backing wall',(-10,4.25,1.72),(.2,4.3,2.95))
part('Right cutaway perimeter',(10.95,-1.4,.35),(.18,10.2,.7))
part('Front low wall left',(-9.65,-6.48,.35),(.7,.18,.7))
part('Front low wall main',(1.3,-6.48,.35),(19.1,.18,.7))
# Shelf shape must be low and wide, rather than a scaled tall rack.
storage=bpy.data.objects['Window low storage']
storage.rotation_euler.z=math.pi/2;storage.dimensions=(2.2,.42,.82)
books=bpy.data.objects['Window storage books'];books.location.z=.85
for o in bpy.data.collections['13 Space accents'].objects:
 if o.name.startswith('Collaboration stool'):
  for slot in o.material_slots:
   slot.link='OBJECT'
   old=slot.material
   m=old.copy();slot.material=m
   shader=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
   if shader and shader.inputs['Base Color'].default_value[0]>.3:
    shader.inputs['Base Color'].default_value=(.29,.38,.27,1)
# Warm sunlight through open window bays; soft fill retains shadow depth.
sun=bpy.data.objects['Afternoon sun - adjustable']
sun.rotation_euler=(math.radians(27),math.radians(-32),math.radians(-32))
sun.data.energy=2.1;sun.data.color=(1,.82,.61);sun.data.angle=math.radians(5)
day=bpy.data.objects['Daylight - adjustable'];day.data.energy=1250;day.data.color=(1,.91,.77)
fill=bpy.data.objects['Soft front fill'];fill.data.energy=420;fill.data.color=(.83,.90,1)
s.world.use_nodes=True
bg=next(n for n in s.world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.64,.72,.85,1);bg.inputs['Strength'].default_value=.25
for o in s.objects:
 if o.type=='LIGHT' and 'pendant' in o.name:
  o.data.color=(1,.71,.42);o.data.energy=90
area('Coffee warm wash',(-8.9,4.2,2.5),(-9.8,4.2,1.2),80,2,(1,.70,.42))
s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=True
s.render.resolution_x=1200;s.render.resolution_y=800;s.render.resolution_percentage=100
s.view_settings.view_transform='AgX';s.view_settings.exposure=0
for a in bpy.context.screen.areas:
 if a.type=='VIEW_3D':
  a.spaces.active.shading.type='RENDERED'
s['walls_warm_light_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Roofless perimeter and editable warm lighting saved; rendered viewport enabled.')
