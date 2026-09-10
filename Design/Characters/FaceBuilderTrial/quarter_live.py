import bpy,math
from mathutils import Quaternion
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active
        space.region_3d.view_rotation=Quaternion((0,0,1),math.radians(35))@Quaternion((1,0,0),math.pi/2)
        space.overlay.show_axis_x=False
        space.overlay.show_axis_y=False
        space.overlay.show_cursor=False
        space.shading.show_cavity=True
        space.shading.cavity_type='BOTH'
        try:space.active_panel_category='FaceBuilder'
        except Exception:pass
print('Quarter view displayed')
