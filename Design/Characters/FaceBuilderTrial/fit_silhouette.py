import bpy,json,pathlib
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder();k=h.cameras[0].get_keyframe();changes=[]
for source,target in [((581,218),(586,218)),((672,218),(666,218))]:
    i=fb.pins_count(k);p=fb.add_pin(k,(source[0],1254-source[1]))
    if p is None:print('MISS',source);continue
    changes.append({'id':i,'mesh_source':source,'image_target':target,'triangle':[int(v) for v in p.surface_point.geo_point_idxs]})
    fb.move_pin(k,i,(target[0],1254-target[1]))
FBLoader.solve(0,0)
update_head_mesh_non_neutral(fb,h);FBLoader.place_camera(0,0)
FBLoader.update_camera_pins_count(0,0);FBLoader.load_pins_into_viewport(0,0)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
FBLoader.update_fb_viewport_shaders(area=area,headnum=0,camnum=0,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(0)
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/anchor_corrections.json').write_text(json.dumps({'eye_changes':{'2':[608,168],'3':[638,168]},'contours':changes},indent=2))
print(changes)

