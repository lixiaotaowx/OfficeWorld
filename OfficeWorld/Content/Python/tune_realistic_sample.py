import unreal as u
E=u.get_editor_subsystem(u.EditorActorSubsystem);L=u.get_editor_subsystem(u.LevelEditorSubsystem)
for a in E.get_all_level_actors():
 if isinstance(a,u.Light):a.light_component.set_mobility(u.ComponentMobility.MOVABLE)
 if isinstance(a,u.PostProcessVolume):
  s=a.settings;s.set_editor_property('auto_exposure_bias',-5.0);a.settings=s
 if isinstance(a,u.PlayerStart):
  a.set_actor_location(u.Vector(-450,330,100),False,False);a.set_actor_rotation(u.Rotator(yaw=-42),False)
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-450,330,165),u.Rotator(pitch=-4,yaw=-42,roll=0))
E.clear_actor_selection_set();L.save_current_level()
