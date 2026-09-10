import unreal as u,json,os
w=u.EditorLevelLibrary.get_game_world()
p=u.GameplayStatics.get_player_pawn(w,0) if w else None
report={'world':str(w),'pawn':str(p),'level_methods':[x for x in dir(u.LevelEditorSubsystem) if any(k in x for k in ['game','viewport'])]}
if p:
 report['position']=str(p.get_actor_location());report['class']=p.get_class().get_path_name();report['controller']=str(p.get_controller())
 report['movement']=str(p.get_movement_component().get_editor_property('movement_mode'))
 report['cameras']=[{'name':c.get_name(),'position':str(c.get_world_location()),'fov':c.field_of_view} for c in p.get_components_by_class(u.CameraComponent)]
 u.SystemLibrary.execute_console_command(w,'HighResShot 1600x900 filename="G:/C/wendang/ChatGPT/youxi/OfficeWorld/Saved/realistic-game.png"')
with open(os.path.join(u.Paths.project_saved_dir(),'sample-play.json'),'w') as f:json.dump(report,f,indent=2)
