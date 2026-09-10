import bpy,json,pathlib
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder();k=h.cameras[0].get_keyframe()
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
changes=[]
for label,source,target in [
    ('left nose wing',(613,194),(615,194)),
    ('right nose wing',(634,194),(632,194)),
    ('left jaw contour',(584,219),(587,219)),
    ('right jaw contour',(663,219),(660,219)),
]:
    n=fb.pins_count(k)
    p=fb.add_pin(k,(source[0],1254-source[1]))
    if p is None:changes.append({'label':label,'status':'surface miss'});continue
    fb.move_pin(k,n,(target[0],1254-target[1]))
    solved=FBLoader.solve(0,0)
    changes.append({'label':label,'source':source,'target':target,'solve':solved})
update_head_mesh_non_neutral(fb,h)
FBLoader.update_camera_pins_count(0,0)
FBLoader.place_camera(0,0)
FBLoader.load_pins_into_viewport(0,0)
FBLoader.update_fb_viewport_shaders(area=area,headnum=0,camnum=0,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(0)
area.tag_redraw()
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/manual_contours.json').write_text(json.dumps(changes,indent=2))
print(changes)

