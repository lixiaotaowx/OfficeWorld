import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();r={};E=u.get_editor_subsystem(u.EditorActorSubsystem)
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 actor=next((a for a in E.get_all_level_actors() if a.get_actor_label()=='OfficePerson01_EditorPreview'),None)
 if not actor:actor=s.spawn_meta_human_actor(c,False)
 if actor:
  actor.set_actor_label('OfficePerson01_EditorPreview');actor.set_folder_path('NaturalOffice/CharacterPreview');actor.set_actor_location(u.Vector(95,60,0),False,False);actor.set_actor_rotation(u.Rotator(pitch=0,yaw=180,roll=0),False)
  r['actor']=actor.get_actor_label();r['class']=actor.get_class().get_name();r['bounds']=str(actor.get_actor_bounds(False));r['saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 else:r['error']='MetaHuman editor actor could not be spawned'
 r['runtime_ready']=s.can_build_meta_human(c,False)
 u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-200,250,155),u.Rotator(pitch=-4,yaw=-34,roll=0));u.EditorLevelLibrary.editor_invalidate_viewports()
except Exception:r['error']=traceback.format_exc()
(root/'Saved/metahuman-preview-placement.json').write_text(json.dumps(r,indent=2));print(r)
