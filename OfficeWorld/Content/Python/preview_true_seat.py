import unreal as u,json,pathlib,traceback
def preview_true_seat():
 world=u.EditorLevelLibrary.get_game_world();pawn=u.GameplayStatics.get_player_pawn(world,0);pc=u.GameplayStatics.get_player_controller(world,0)
 lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));h=lib.call_method('GetAllWidgetsOfClass',(world,u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C'),False))[0]
 pawn.set_actor_location(u.Vector(-355,-20,100),False,False);pawn.character_movement.stop_movement_immediately()
 timer={'time':0,'clicked':False,'handle':None}
 def tick_seat(dt):
  timer['time']+=dt
  try:
   if not u.SystemLibrary.is_valid(world):u.unregister_slate_post_tick_callback(timer['handle']);return
   if timer['time']>.6 and not timer['clicked']:h.get_editor_property('SeatButton').on_clicked.broadcast();timer['clicked']=True
   if timer['time']>3:
    pc.set_control_rotation(u.Rotator(pitch=-15,yaw=-25,roll=0))
    data={'seated':h.get_editor_property('Seated'),'transition':h.get_editor_property('SeatTransition'),'location':str(pawn.get_actor_location()),'viewtarget':str(pc.get_view_target()),'mesh_location':str(pawn.mesh.get_world_location()),'bones':{b:str(pawn.mesh.get_socket_location(b)) for b in ['pelvis','calf_l','foot_l','hand_l']},'animation':str(pawn.mesh.get_animation_mode())}
    pathlib.Path(u.Paths.project_saved_dir(),'true-seat-preview.json').write_text(json.dumps(data,indent=2));u.unregister_slate_post_tick_callback(timer['handle'])
  except:
   pathlib.Path(u.Paths.project_saved_dir(),'true-seat-preview.json').write_text(json.dumps({'error':traceback.format_exc()}));u.unregister_slate_post_tick_callback(timer['handle'])
 timer['handle']=u.register_slate_post_tick_callback(tick_seat)
preview_true_seat()
