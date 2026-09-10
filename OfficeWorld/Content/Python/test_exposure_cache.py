import unreal as u
w=u.EditorLevelLibrary.get_game_world();u.SystemLibrary.execute_console_command(w,'r.EyeAdaptation.CachedLightingPreExposure 8')
for a in u.GameplayStatics.get_all_actors_of_class(w,u.PostProcessVolume):
 s=a.settings;s.set_editor_property('auto_exposure_bias',0);a.settings=s
