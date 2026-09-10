import sys, pathlib, traceback, json
import bpy, addon_utils
root = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(root/'addons'))
report = {'status':'started', 'views':[]}
try:
    addon_utils.enable('keentools', default_set=True)
    from keentools.facebuilder_config import FBConfig
    from keentools.addon_config import fb_settings
    from keentools.facebuilder.fbloader import FBLoader
    from keentools.utils.images import load_rgba
    from keentools.utils.coords import update_head_mesh_non_neutral
    from keentools.utils.focal_length import configure_focal_mode_and_fixes
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    opgroup, opname = FBConfig.fb_add_head_operator_idname.split('.')
    print('CREATE', getattr(getattr(bpy.ops,opgroup),opname)(), flush=True)
    settings = fb_settings()
    head = settings.get_current_head()
    fb = FBLoader.get_builder()
    fb.set_use_emotions(False)
    for filename in ['Front_Original.png','Side_Original.png']:
        camera = FBLoader.add_new_camera_with_image(0,str(root/filename))
        kid = camera.get_keyframe()
        configure_focal_mode_and_fixes(fb,head)
        rgba = load_rgba(camera)
        faces = fb.detect_faces(rgba,fb.pixel_aspect_ratio(kid))
        result = {'file':filename,'detected_faces':len(faces)}
        report['views'].append(result)
        print('DETECT',result,flush=True)
        if faces:
            result['pose_aligned']=bool(fb.detect_face_pose(kid,faces[0]))
            if result['pose_aligned']:
                fb.remove_pins(kid)
                result['solve_result']=str(fb.add_preset_pins_and_solve(kid))
                result['pins']=fb.pins_count(kid)
                update_head_mesh_non_neutral(fb,head)
        print('FIT',result,flush=True)
    FBLoader.update_all_camera_positions(0)
    FBLoader.update_all_camera_focals(0)
    FBLoader.save_fb_serial_and_image_pathes(0)
    report['status']='initial_fit_completed'
except Exception as e:
    report['status']='blocked'
    report['error']=str(e)
    report['traceback']=traceback.format_exc()
    traceback.print_exc()
finally:
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'FaceBuilder_Trial.blend'))
    (root/'fit_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print('REPORT',report,flush=True)
