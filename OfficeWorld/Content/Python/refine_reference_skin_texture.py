import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 m=c.get_editor_property('makeup_settings');f=m.foundation;f.concealer=.10;f.color=u.LinearColor(.78,.48,.34,1);f.intensity=.20;m.foundation=f;s.commit_makeup_settings(c,m)
 settings=c.get_editor_property('skin_settings');r['before']=str(settings)
 skin=settings.skin;skin.face_texture_index=35;settings.skin=skin;freckles=settings.freckles;freckles.strength=0;freckles.density=0;settings.freckles=freckles
 s.commit_skin_settings(c,settings);r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False);r['after']=str(settings)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'reference-face-skin-round6.json').write_text(json.dumps(r,indent=2))
