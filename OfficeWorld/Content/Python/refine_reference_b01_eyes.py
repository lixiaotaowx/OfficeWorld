import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_B01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);assert s.is_object_added_for_editing(c)
 settings=c.get_editor_property('eyes_settings');r['before']=str(settings)
 for side in ['eye_left','eye_right']:
  eye=getattr(settings,side)
  iris=eye.iris;iris.primary_color_v=.38;iris.secondary_color_v=.26;iris.global_tint=u.LinearColor(1,.85,.70,1);iris.global_saturation=1.4;iris.shadow_details=.5;iris.limbal_ring_size=.72;eye.iris=iris
  pupil=eye.pupil;pupil.dilation=.85;pupil.feather=.45;eye.pupil=pupil
  cornea=eye.cornea;cornea.size=.165;eye.cornea=cornea
  setattr(settings,side,eye)
 s.commit_eyes_settings(c,settings);r['after']=str(settings);r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
 u.get_editor_subsystem(u.LevelEditorSubsystem).editor_invalidate_viewports()
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'reference-b01-eyes-adjusted.json').write_text(json.dumps(r,indent=2))
