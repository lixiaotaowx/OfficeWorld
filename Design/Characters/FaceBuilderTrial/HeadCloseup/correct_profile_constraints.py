import bpy,json,pathlib,numpy as np
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();n=s.current_headnum;h=s.heads[n];fb=FBLoader.get_builder();k=h.cameras[1].get_keyframe()
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
FBLoader.save_fb_serial_and_image_pathes(n)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Before_Profile_Correction.blend'))
disabled=[6,8,9,10,24,25,26,27,28,29,36,38]
for i in disabled:
    if i<fb.pins_count(k):fb.pin_enable(k,i,False)
changes={15:(542.5,176),35:(551.5,184)}
for i,(x,y) in changes.items():
    if i<fb.pins_count(k):fb.move_pin(k,i,(x,1254-y))
print('SOLVE',FBLoader.solve(n,1))
update_head_mesh_non_neutral(fb,h)
FBLoader.update_all_camera_positions(n);FBLoader.update_all_camera_focals(n)
FBLoader.load_pins_into_viewport(n,1)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
FBLoader.update_fb_viewport_shaders(area=area,headnum=n,camnum=1,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(n)
(root/'profile_constraints.json').write_text(json.dumps({'disabled_retained_hair_or_clothing_pins':disabled,'changed_nose_targets':changes},indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Profile_Constrained.blend'))
print('ACTIVE_SIDE',sum(fb.pin(k,i).enabled for i in range(fb.pins_count(k))))
