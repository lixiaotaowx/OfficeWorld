import bpy,json,pathlib
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.utils.images import load_rgba
from keentools.utils.coords import update_head_mesh_non_neutral
from keentools.utils.focal_length import configure_focal_mode_and_fixes
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial')
settings=fb_settings();settings.current_headnum=0
head=settings.get_head(0)
FBLoader.load_model(0)
fb=FBLoader.get_builder();fb.set_use_emotions(False)
report=[]
for camera in head.cameras:
    kid=camera.get_keyframe()
    if not fb.is_key_at(kid):fb.set_centered_geo_keyframe(kid)
for index,camera in enumerate(head.cameras):
    settings.current_camnum=index
    kid=camera.get_keyframe()
    if not fb.is_key_at(kid):fb.set_centered_geo_keyframe(kid)
    configure_focal_mode_and_fixes(fb,head)
    faces=fb.detect_faces(load_rgba(camera),fb.pixel_aspect_ratio(kid))
    row={'view':index,'detected':len(faces)}
    if faces:
        row['aligned']=bool(fb.detect_face_pose(kid,faces[0]))
        if row['aligned']:
            fb.remove_pins(kid)
            fb.add_preset_pins_and_solve(kid)
            row['pins']=fb.pins_count(kid)
            update_head_mesh_non_neutral(fb,head)
            FBLoader.update_camera_pins_count(0,index)
    report.append(row)
FBLoader.update_all_camera_positions(0)
FBLoader.update_all_camera_focals(0)
FBLoader.save_fb_serial_and_image_pathes(0)
for p in head.headobj.data.polygons:p.use_smooth=True
bpy.ops.wm.save_as_mainfile(filepath=str(root/'FaceBuilder_Multiview.blend'))
(root/'live_fit_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('MULTIVIEW_RESULT',report)
