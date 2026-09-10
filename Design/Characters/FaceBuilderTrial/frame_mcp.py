import bpy
from mathutils import Vector,Quaternion
obj=bpy.data.objects['FBHead']
bpy.context.view_layer.objects.active=obj
obj.select_set(True)
center=sum((obj.matrix_world@Vector(v) for v in obj.bound_box),Vector())/8
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active
        space.region_3d.view_location=center
        space.region_3d.view_distance=max(obj.dimensions)*1.5
        space.region_3d.view_rotation=Quaternion((1,0,0),1.57079632679)
        space.region_3d.view_perspective='ORTHO'
        space.overlay.show_extras=False
        space.overlay.show_floor=False
print('VISIBLE_HEAD',len(obj.data.vertices),'vertices',bpy.data.filepath)
