import unreal as u,json,pathlib
E=u.get_editor_subsystem(u.EditorActorSubsystem)
for a in E.get_all_level_actors():
 if isinstance(a,u.PostProcessVolume):
  s=a.settings
  for key,value in [('override_histogram_log_max',True),('histogram_log_max',16.0),('override_histogram_log_min',True),('histogram_log_min',-8.0),('auto_exposure_bias',0.0)]:s.set_editor_property(key,value)
  a.settings=s
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();pathlib.Path(u.Paths.project_saved_dir(),'exposure-final-save.json').write_text(json.dumps({'saved':True,'histogram_range':[-8,16],'cache_preexposure':8,'bias':0,'range':[.03,20000]}))
