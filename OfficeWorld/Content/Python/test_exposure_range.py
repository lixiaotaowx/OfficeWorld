import unreal as u,pathlib,json
w=u.EditorLevelLibrary.get_game_world();r={'extended':u.SystemLibrary.get_console_variable_int_value('r.DefaultFeature.AutoExposure.ExtendDefaultLuminanceRange')}
for a in u.GameplayStatics.get_all_actors_of_class(w,u.PostProcessVolume):
 s=a.settings;s.set_editor_property('auto_exposure_min_brightness',.03);s.set_editor_property('auto_exposure_max_brightness',20000);s.set_editor_property('auto_exposure_bias',-1);a.settings=s
pathlib.Path(u.Paths.project_saved_dir(),'runtime-exposure.json').write_text(json.dumps(r))
