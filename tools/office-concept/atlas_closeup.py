import bpy
from mathutils import Vector
for a in bpy.context.screen.areas:
 if a.type=='VIEW_3D':
  a.spaces.active.region_3d.view_location=Vector((1.1,-3.8,.9))
  a.spaces.active.region_3d.view_distance=5.2
