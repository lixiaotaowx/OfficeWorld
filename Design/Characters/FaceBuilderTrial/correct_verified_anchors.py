import bpy,json,pathlib,numpy as np
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder();k=h.cameras[0].get_keyframe()
changes=[]
for idx,target,label in [(2,(608,168),'inner eye image-left'),(3,(638,168),'inner eye image-right')]:
    old=fb.pin(k,idx).img_pos
    changes.append({'id':idx,'label':label,'before':[float(old[0]),float(1254-old[1])],'target':target})
    fb.move_pin(k,idx,(target[0],1254-target[1]))
FBLoader.solve(0,0)
for source,target,label in [((584,218),(590,218),'jaw image-left'),((663,218),(657,218),'jaw image-right')]:
    idx=fb.pins_count(k);p=fb.add_pin(k,(source[0],1254-source[1]))
    if p is not None:
        changes.append({'id':idx,'label':label,'source':source,'target':target,'mesh_triangle':list(p.surface_point.geo_point_idxs)})
        fb.move_pin(k,idx,(target[0],1254-target[1]))
        FBLoader.solve(0,0)
update_head_mesh_non_neutral(fb,h)
FBLoader.update_camera_pins_count(0,0);FBLoader.place_camera(0,0)
FBLoader.load_pins_into_viewport(0,0)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
FBLoader.update_fb_viewport_shaders(area=area,headnum=0,camnum=0,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(0)
s.wireframe_opacity=0.20
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/anchor_corrections.json').write_text(json.dumps(changes,indent=2))
print(changes)
