import bpy,json,pathlib
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder();k=h.cameras[1].get_keyframe()
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
changes=[]
for label,source,target in [
    ('profile nose bridge',(551,160),(550,160)),
    ('profile lower jaw',(582,224),(582,222)),


]:
    n=fb.pins_count(k)
    p=fb.add_pin(k,(source[0],1254-source[1]))
    if p is None:changes.append({'label':label,'status':'surface miss'});continue
    fb.move_pin(k,n,(target[0],1254-target[1]))
    solved=FBLoader.solve(0,1)
    changes.append({'label':label,'source':source,'target':target,'solve':solved})
update_head_mesh_non_neutral(fb,h)
FBLoader.update_camera_pins_count(0,1)
FBLoader.place_camera(0,1)
FBLoader.load_pins_into_viewport(0,1)
FBLoader.update_fb_viewport_shaders(area=area,headnum=0,camnum=1,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(0)
area.tag_redraw()
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/manual_profile.json').write_text(json.dumps(changes,indent=2))
print(changes)

