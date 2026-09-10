import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);m=c.get_editor_property('makeup_settings');r['before']=str(m)
 foundation=m.foundation;foundation.apply_foundation=True;foundation.color=u.LinearColor(.60,.38,.27,1);foundation.intensity=.22;foundation.concealer=.85;foundation.roughness=.60;m.foundation=foundation
 eyes=m.eyes;eyes.type=u.MetaHumanCharacterEyeMakeupType.THIN_LINER;eyes.primary_color=u.LinearColor(.028,.013,.009,1);eyes.secondary_color=u.LinearColor(.015,.008,.006,1);eyes.opacity=.7;eyes.roughness=.65;eyes.metalness=0;m.eyes=eyes
 lips=m.lips;lips.type=u.MetaHumanCharacterLipsMakeupType.NATURAL;lips.color=u.LinearColor(.28,.055,.035,1);lips.opacity=.45;lips.roughness=.40;lips.metalness=0;m.lips=lips
 s.commit_makeup_settings(c,m);r['after']=str(m);r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'reference-face-makeup.json').write_text(json.dumps(r,indent=2))
