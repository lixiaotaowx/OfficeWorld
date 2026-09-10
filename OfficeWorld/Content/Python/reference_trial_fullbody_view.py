import unreal as u,pathlib,json
L=u.get_editor_subsystem(u.LevelEditorSubsystem);w=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
assert 'RefWoman_Studio_A01' in w.get_path_name()
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(0,220,107),u.MathLibrary.find_look_at_rotation(u.Vector(0,220,107),u.Vector(0,0,90)))
u.EditorLevelLibrary.editor_invalidate_viewports()
c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');assert u.EditorAssetLibrary.save_loaded_asset(c,False)
assert L.save_current_level()
r={'map':w.get_path_name(),'asset':c.get_path_name(),'actor_count':len(u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors()),'camera':str(u.EditorLevelLibrary.get_level_viewport_camera_info()),'viewport_methods':{n:str(getattr(L,n).__doc__) for n in dir(L) if any(k in n for k in ['pilot','lock','camera','viewport'])}}
pathlib.Path(u.Paths.project_saved_dir(),'reference-trial-final.json').write_text(json.dumps(r,indent=2))
