import unreal as u,json,pathlib
E=u.get_editor_subsystem(u.EditorActorSubsystem)
for a in E.get_all_level_actors():
 if isinstance(a,u.PlayerStart):
  a.set_actor_location(u.Vector(-355,-20,100),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=-90,roll=0),False)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
pathlib.Path(u.Paths.project_saved_dir(),'office-interaction-entry.json').write_text(json.dumps({'saved':True,'spawn':[-355,-20,100],'yaw':-90}))
