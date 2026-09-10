import unreal as u,pathlib,json
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();E=u.get_editor_subsystem(u.EditorActorSubsystem)
for a in E.get_all_level_actors():
 if isinstance(a,u.RectLight):
  window=a.get_actor_label()=='WindowLight';c=a.light_component;c.set_editor_property('intensity',16000.0 if window else 350.0);c.set_editor_property('temperature',5600.0 if window else 3400.0)
 if isinstance(a,u.PostProcessVolume):
  s=a.settings;s.set_editor_property('auto_exposure_bias',-6.0);a.settings=s
 if isinstance(a,u.SkyLight):a.light_component.set_editor_property('intensity',1.4);a.light_component.recapture_sky()
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-490,335,168),u.Rotator(pitch=-4,yaw=-35,roll=0));u.EditorLevelLibrary.editor_invalidate_viewports();u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
(root/'Saved/daylight-balance.json').write_text(json.dumps({'window_lm':16000,'ceiling_lm':350,'window_kelvin':5600,'ceiling_kelvin':3400,'exposure':-6,'saved':True}))
