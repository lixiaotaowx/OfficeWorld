import bpy,pathlib,json
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.facebuilder_config import FBConfig
from keentools.utils.images import load_rgba
from keentools.utils.coords import update_head_mesh_non_neutral
from keentools.utils.focal_length import configure_focal_mode_and_fixes
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
s=fb_settings()
if s.pinmode:
    FBLoader.save_fb_serial_and_image_pathes(s.current_headnum)
    FBLoader.out_pinmode_without_save()
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Before_Closeup.blend'))
handler=bpy.app.driver_namespace.pop('anchor_label_handler',None)
if handler:bpy.types.SpaceView3D.draw_handler_remove(handler,'WINDOW')
group,name=FBConfig.fb_add_head_operator_idname.split('.')
print('NEW',getattr(getattr(bpy.ops,group),name)())
n=s.current_headnum;h=s.heads[n];h.headobj.name='Head_Closeup_Fit'
cam=FBLoader.add_new_camera_with_image(n,str(root/'Front_Detailed.png'))
s.current_camnum=0
fb=FBLoader.get_builder();fb.set_use_emotions(False)
configure_focal_mode_and_fixes(fb,h)
k=cam.get_keyframe()
faces=fb.detect_faces(load_rgba(cam),fb.pixel_aspect_ratio(k))
print('FACES',len(faces))
if len(faces)!=1:raise RuntimeError('Expected single face')
print('POSE',fb.detect_face_pose(k,faces[0]))
fb.add_preset_pins_and_solve(k)
update_head_mesh_non_neutral(fb,h)
FBLoader.update_camera_pins_count(n,0);FBLoader.update_all_camera_positions(n);FBLoader.update_all_camera_focals(n)
FBLoader.save_fb_serial_and_image_pathes(n)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D');region=next(r for r in area.regions if r.type=='WINDOW')
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=n,camnum=0)
area.spaces.active.region_3d.view_camera_zoom=0
area.spaces.active.region_3d.view_camera_offset=(0,0)
s.wireframe_opacity=0.2
print('PINS',[(i,list(map(float,fb.pin(k,i).img_pos))) for i in range(fb.pins_count(k))])
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Closeup_Fit.blend'))
