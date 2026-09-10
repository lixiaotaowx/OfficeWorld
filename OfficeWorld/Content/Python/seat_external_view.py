import unreal as u
def seat_external_view():
 w=u.EditorLevelLibrary.get_game_world();pc=u.GameplayStatics.get_player_controller(w,0);cam=next(a for a in u.GameplayStatics.get_all_actors_of_class(w,u.CameraActor) if a.get_actor_label()=='OfficeSeatCamera_A01')
 cam.set_actor_location(u.Vector(-550,-70,90),False,False);cam.set_actor_rotation(u.Rotator(pitch=-6,yaw=-27,roll=0),False);cam.camera_component.set_field_of_view(80);pc.set_view_target_with_blend(cam,0)
seat_external_view()
