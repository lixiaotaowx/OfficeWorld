import bpy,json,math
from pathlib import Path
from mathutils import Vector
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=r'G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/Before_Layout_Correction.blend',copy=True)
assert not s.get('layout_correction_v1'), 'Already adjusted; do not apply twice'
moved=[];hidden=[]
for obj in list(s.objects):
 name=obj.name
 if obj.parent:continue
 delta=None
 if name.startswith('Island_A'):delta=(.6,-.9,0)
 elif name.startswith('Island_B'):delta=(-.8,2.0,0)
 elif name.startswith(('Meeting','Manager','Coffee','Window','Open top','Rear open')):delta=(0,.9,0)
 elif name.startswith(('Architecture / rear room wall','Architecture / manager side wall','Architecture / room divider')):delta=(0,.9,0)
 elif name.startswith('Lounge'):delta=(-.2,1.1,0)
 if delta:
  obj.location+=Vector(delta);moved.append(name)
# Extend the rear boundary to maintain the existing room depths and aisle clearance.
floor=bpy.data.objects.get('Architecture / ivory floor')
floor.location.y=.45;floor.dimensions.y=13.9
# Hide only the placeholder foliage and graphic wall art authored in this pass.
plant_prefixes=('Exterior / tree','Lounge / indoor tree','Lounge / tabletop plant',
 'Meeting / corner tree','Manager tall plant','Coffee shelf plant',
 'Island_A desk plant','Island_B desk plant','Meeting tabletop plant')
for obj in list(s.objects):
 if obj.name.startswith(plant_prefixes+('Coffee art','Manager art','Exterior / park strip')):
  obj.hide_set(True);obj.hide_render=True;hidden.append(obj.name)
cam=s.camera
cam.location=(16,-29,23)
cam.rotation_euler=(Vector((.5,1,.3))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.ortho_scale=26.5
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.region_3d.view_perspective='CAMERA'
   a.spaces.active.region_3d.view_camera_zoom=12
s['layout_correction_v1']=True
r={'island_A_center':[-2.4,-2.9],'island_B_center':[2.2,0], 'room_front_y':3.0,'hidden_placeholder_objects':len(hidden),'moved_root_objects':len(moved),'note':'User prioritizes layout. Procedural plants and placeholder wall art hidden; no user-created plants edited.'}
Path(r'G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/layout-correction.json').write_text(json.dumps(r,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps(r))
