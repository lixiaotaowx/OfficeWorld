import unreal as u,json,pathlib
c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
r={'can_build':s.can_build_meta_human(c,True)}
if r['can_build']:r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-textures-ready.json').write_text(json.dumps(r,indent=2))
