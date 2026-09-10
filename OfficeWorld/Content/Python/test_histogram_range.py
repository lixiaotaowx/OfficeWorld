import unreal as u
w=u.EditorLevelLibrary.get_game_world()
for a in u.GameplayStatics.get_all_actors_of_class(w,u.PostProcessVolume):
 s=a.settings
 for key,value in [('override_histogram_log_max',True),('histogram_log_max',16.0),('override_histogram_log_min',True),('histogram_log_min',-8.0),('auto_exposure_bias',-1.2)]:s.set_editor_property(key,value)
 a.settings=s
