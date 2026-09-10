import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.project_saved_dir());job=json.loads((root/'reference-face-job.json').read_text(encoding='utf-8'));r={'round':job['round']}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 assert 'RefWoman_Studio_A01' in u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 assert s.is_object_added_for_editing(c) or s.try_add_object_to_edit(c)
 r['coefficients_before']=list(s.get_face_model_coefficients(c));r['before']=[[p.x,p.y,p.z] for p in s.get_face_landmarks(c)]
 delta=job.get('deltas',{});s.translate_face_landmarks(c,[int(i) for i in delta],[u.Vector(*v) for v in delta.values()]);s.commit_face_state(c)
 r['after']=[[p.x,p.y,p.z] for p in s.get_face_landmarks(c)];r['coefficients_after']=list(s.get_face_model_coefficients(c));r['requested']=delta
 r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
 L=u.get_editor_subsystem(u.LevelEditorSubsystem);E=u.get_editor_subsystem(u.EditorActorSubsystem)
 cam=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='Camera_Face')
 cam.set_actor_location(u.Vector(0,100,163),False,False);cam.set_actor_rotation(u.MathLibrary.find_look_at_rotation(u.Vector(0,100,163),u.Vector(0,8,163)),False);cam.camera_component.set_field_of_view(40)
 L.eject_pilot_level_actor();L.pilot_level_actor(cam);L.set_exact_camera_view(True);L.editor_set_viewport_realtime(True);E.clear_actor_selection_set();L.editor_invalidate_viewports()
 r['map_saved']=L.save_current_level()
except Exception:r['error']=traceback.format_exc()
(root/('reference-face-round-'+str(job['round'])+'.json')).write_text(json.dumps(r,indent=2))
