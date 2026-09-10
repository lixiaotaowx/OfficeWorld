import bpy
from bpy_extras.object_utils import world_to_camera_view
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder();k=h.cameras[0].get_keyframe()
for i in reversed(range(15,fb.pins_count(k))):fb.remove_pin(k,i)
FBLoader.solve(0,0)
from keentools.utils.coords import update_head_mesh_non_neutral
update_head_mesh_non_neutral(fb,h);FBLoader.place_camera(0,0)
bpy.context.view_layer.update()
cam=h.cameras[0].camobj
rows=[]
for v in h.headobj.data.vertices:
    p=world_to_camera_view(bpy.context.scene,cam,h.headobj.matrix_world@v.co)
    if abs((1-p.y)*1254-218)<0.5:rows.append((v.index,p.x*1254,(1-p.y)*1254))
print('CONTOUR',sorted(rows,key=lambda v:v[1])[:3],sorted(rows,key=lambda v:v[1])[-3:])
FBLoader.save_fb_serial_and_image_pathes(0)
