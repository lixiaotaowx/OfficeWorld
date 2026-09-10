import unreal as u,pathlib,json
s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_B01')
# Undo the misinterpreted smaller-pupil pass using the preserved A01 eye settings.
settings=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01').get_editor_property('eyes_settings');r={'restored_from':'RefWoman_A01','before':str(settings)}
for side in ['eye_left','eye_right']:
 eye=getattr(settings,side);cornea=eye.cornea;cornea.size=.185;eye.cornea=cornea;setattr(settings,side,eye)
s.commit_eyes_settings(c,settings);r['after']=str(settings);r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
u.get_editor_subsystem(u.LevelEditorSubsystem).editor_invalidate_viewports()
pathlib.Path(u.Paths.project_saved_dir(),'reference-b01-iris-enlarged.json').write_text(json.dumps(r,indent=2))
