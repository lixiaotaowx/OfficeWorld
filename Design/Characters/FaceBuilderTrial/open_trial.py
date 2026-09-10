import bpy,sys,pathlib,addon_utils
from mathutils import Vector,Quaternion
root=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(root/'addons'))
bpy.ops.wm.open_mainfile(filepath=str(root/'FaceBuilder_Trial.blend'))
addon_utils.enable('keentools',default_set=True)
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=obj
obj.select_set(True)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            space=area.spaces.active
            center=sum((obj.matrix_world@Vector(v) for v in obj.bound_box),Vector())/8
            space.region_3d.view_location=center
            space.region_3d.view_distance=max(obj.dimensions)*1.8
            space.region_3d.view_rotation=Quaternion((1,0,0),1.57079632679)
            space.region_3d.view_perspective='ORTHO'
            space.show_region_ui=True
            space.overlay.show_floor=False
            space.overlay.show_extras=False
            space.shading.light='STUDIO'
            space.shading.show_cavity=True
