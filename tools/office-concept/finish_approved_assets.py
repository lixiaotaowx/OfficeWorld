import bpy,math,json
from mathutils import Vector
col=bpy.data.collections['12 Approved free props']
for o in col.objects:
 o.rotation_mode='XYZ'
keyboard=bpy.data.objects['LIB keyboard_slim']
keyboard.data=keyboard.data.copy()
keyboard.modifiers.clear()
keyboard.hide_set(False);bpy.context.view_layer.objects.active=keyboard
mod=keyboard.modifiers.new('Web keyboard reduction','DECIMATE');mod.ratio=.035
bpy.ops.object.modifier_apply(modifier=mod.name)
keyboard.hide_set(True)
keyboard.data.calc_loop_triangles()
for o in col.objects:
 if 'approved keyboard' in o.name:o.data=keyboard.data
# Add desktop reference view without altering lights or user camera.
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  rv=area.spaces.active.region_3d
  rv.view_perspective='PERSP'
  rv.view_location=Vector((1.1,-3.8,.85));rv.view_distance=5.5
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'keyboard_triangles':len(keyboard.data.loop_triangles),'props':len(col.objects)}))
