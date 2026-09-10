import unreal as u
w=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(w,0);pc=u.GameplayStatics.get_player_controller(w,0);p.set_actor_location(u.Vector(-280,-20,95),False,False);pc.set_control_rotation(u.Rotator(pitch=-12,yaw=-45,roll=0))
