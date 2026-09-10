import unreal as u,json,pathlib
def record_seat_input():
 world=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(world,0);pc=u.GameplayStatics.get_player_controller(world,0);r={'rotation':str(pc.get_control_rotation()),'camera':str(pc.player_camera_manager.get_camera_location()),'location':str(p.get_actor_location()),'mode':str(p.character_movement.movement_mode),'input_ignored':pc.is_look_input_ignored(),'viewtarget':str(pc.get_view_target())};pathlib.Path(u.Paths.project_saved_dir(),'seat-audit-after-mouse.json').write_text(json.dumps(r,indent=2))
record_seat_input()
