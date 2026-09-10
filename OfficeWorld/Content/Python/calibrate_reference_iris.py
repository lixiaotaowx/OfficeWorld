import unreal as u,json,pathlib
root=pathlib.Path(u.Paths.project_saved_dir());job=json.loads((root/'reference-iris-job.json').read_text());s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_B02')
settings=c.get_editor_property('eyes_settings')
for side in ['eye_left','eye_right']:
 eye=getattr(settings,side);cornea=eye.cornea;cornea.size=job['size'];eye.cornea=cornea;setattr(settings,side,eye)
s.commit_eyes_settings(c,settings)
E=u.get_editor_subsystem(u.EditorActorSubsystem);L=u.get_editor_subsystem(u.LevelEditorSubsystem);cam=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='Camera_Face')
cam.set_actor_location(u.Vector(0,80,163.4),False,False);cam.set_actor_rotation(u.MathLibrary.find_look_at_rotation(u.Vector(0,80,163.4),u.Vector(0,8,163.4)),False);cam.camera_component.set_field_of_view(22);L.editor_invalidate_viewports()
(root/'reference-iris-calibration.json').write_text(json.dumps({'size':job['size'],'settings':str(settings)}))
