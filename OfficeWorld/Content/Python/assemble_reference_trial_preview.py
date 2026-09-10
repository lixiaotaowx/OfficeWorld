import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 s.assemble_for_preview(c);r['preview_requested']=True
 E=u.get_editor_subsystem(u.EditorActorSubsystem)
 p=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='Studio_Exposure');settings=p.settings;settings.set_editor_property('auto_exposure_bias',-9.0);p.settings=settings
 E.clear_actor_selection_set();r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False);r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'reference-preview-build.json').write_text(json.dumps(r,indent=2))
