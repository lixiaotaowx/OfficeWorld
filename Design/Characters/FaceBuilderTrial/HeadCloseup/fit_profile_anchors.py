import bpy,pathlib,json,numpy as np
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import update_head_mesh_non_neutral
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
s=fb_settings();n=s.current_headnum;h=s.heads[n];fb=FBLoader.get_builder();k=h.cameras[1].get_keyframe()
FBLoader.save_fb_serial_and_image_pathes(n)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Before_Profile_Anchors.blend'))
print('EXISTING_SIDE_PINS',fb.pins_count(k))
if fb.pins_count(k)==0:
    fb.add_preset_pins_and_solve(k)
update_head_mesh_non_neutral(fb,h)
FBLoader.update_camera_pins_count(n,1);FBLoader.update_all_camera_positions(n);FBLoader.update_all_camera_focals(n)
FBLoader.load_pins_into_viewport(n,1)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
FBLoader.update_fb_viewport_shaders(area=area,headnum=n,camnum=1,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(n)
print('SIDE_PINS',[(i,[float(p.img_pos[0]),float(1254-p.img_pos[1])]) for i,p in enumerate(fb.projected_pins(k))])
print('FIXED_DOFS',fb.fixed_dofs(),'DOC',fb.set_fixed_dofs.__doc__)
print('SYMMETRY_API',[x for x in dir(fb) if any(t in x.lower() for t in ['sym','args','param','dof'])])
