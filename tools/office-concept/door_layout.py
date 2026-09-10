import bpy,math,json
from pathlib import Path
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=r'G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/Before_Door_Layout_Adjustment.blend',copy=True)
for prefix in ['Meeting room','Manager office']:
 door=bpy.data.objects.get(prefix+' open glass door')
 posts=[o for o in s.objects if o.name.startswith(prefix+' mullion')]
 hinge=min(posts,key=lambda o:o.location.x).location.copy()
 angle=math.radians(75)
 door.rotation_euler.z=angle
 door.location.x=hinge.x+math.cos(angle)*.54
 door.location.y=hinge.y+math.sin(angle)*.54
 handle=bpy.data.objects.get(prefix+' door handle')
 if handle:
  handle.location.x=hinge.x+math.cos(angle)*.92
  handle.location.y=hinge.y+math.sin(angle)*.92-.02
s['door_layout']='hinged inward 75 degrees; doors clear front aisle'
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Both doors hinged to their posts and opened inward; main lighting untouched.')
