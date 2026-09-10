import unreal as u,json,pathlib
r={n:u.SystemLibrary.get_console_variable_int_value(n) for n in ['r.EyeAdaptationQuality','r.DefaultFeature.AutoExposure','sg.PostProcessQuality','r.Nanite','r.DefaultFeature.AutoExposure.ExtendDefaultLuminanceRange']};pathlib.Path(u.Paths.project_saved_dir(),'render-cvars.json').write_text(json.dumps(r,indent=2))
u.SystemLibrary.execute_console_command(u.EditorLevelLibrary.get_game_world(),'r.EyeAdaptationQuality 2')
