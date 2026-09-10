import bpy,math,sys
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import area
s=bpy.context.scene
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
