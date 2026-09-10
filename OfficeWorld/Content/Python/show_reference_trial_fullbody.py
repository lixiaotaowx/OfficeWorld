import unreal as u,pathlib,json
L=u.get_editor_subsystem(u.LevelEditorSubsystem);E=u.get_editor_subsystem(u.EditorActorSubsystem)
assert 'RefWoman_Studio_A01' in u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()
cam=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='Camera_FullBody')
cam.set_actor_location(u.Vector(0,520,110),False,False);cam.set_actor_rotation(u.MathLibrary.find_look_at_rotation(u.Vector(0,520,110),u.Vector(0,0,90)),False)
for actor in E.get_all_level_actors():
 if isinstance(actor,u.CameraActor):
  for component in actor.get_components_by_class(u.StaticMeshComponent):component.set_visibility(False)
L.eject_pilot_level_actor();L.editor_set_viewport_realtime(True);L.pilot_level_actor(cam);L.set_exact_camera_view(True);L.editor_invalidate_viewports()
E.clear_actor_selection_set();assert L.save_current_level()
pathlib.Path(u.Paths.project_saved_dir(),'reference-trial-visible-view.json').write_text(json.dumps({'pilot':str(L.get_pilot_level_actor()),'map':u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()}))
