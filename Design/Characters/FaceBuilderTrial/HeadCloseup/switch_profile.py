import bpy,pathlib
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.facebuilder_config import FBConfig
from keentools.utils.images import load_rgba
s=fb_settings();n=s.current_headnum;h=s.heads[n]
FBLoader.save_fb_serial_and_image_pathes(n)
bpy.ops.wm.save_as_mainfile(filepath='G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup/Before_Profile.blend')
if s.pinmode:FBLoader.out_pinmode_without_save()
FBLoader.load_model(n)
path='G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/Side_Original.png'
matches=[i for i,c in enumerate(h.cameras) if c.cam_image and pathlib.Path(c.cam_image.filepath).name=='Side_Original.png']
if matches:
    camnum=matches[0];cam=h.cameras[camnum]
else:
    camnum=len(h.cameras);cam=FBLoader.add_new_camera_with_image(n,path)
    cam.use_in_tex_baking=False
    fb=FBLoader.get_builder();k=cam.get_keyframe()
    faces=fb.detect_faces(load_rgba(cam),fb.pixel_aspect_ratio(k))
    if faces:
        print('PROFILE_CAMERA_ALIGNED',fb.detect_face_pose(k,faces[0]))
        FBLoader.place_camera(n,camnum)
    print('PROFILE_PINS',fb.pins_count(k))
FBLoader.save_fb_serial_and_image_pathes(n)
s.force_out_pinmode=False;s.current_headnum=n;s.current_camnum=camnum
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D');region=next(r for r in area.regions if r.type=='WINDOW')
area.spaces.active.overlay.show_overlays=True
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):print(getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=n,camnum=camnum))
area.spaces.active.region_3d.view_camera_zoom=80
area.spaces.active.region_3d.view_camera_offset=(-0.025,0.33)
print('SHOWING_PROFILE',camnum)
