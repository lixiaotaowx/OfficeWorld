import unreal as u,json,pathlib,traceback
def seat_visual_audit():
 world=u.EditorLevelLibrary.get_game_world();pawn=u.GameplayStatics.get_player_pawn(world,0);pc=u.GameplayStatics.get_player_controller(world,0);lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));h=lib.call_method('GetAllWidgetsOfClass',(world,u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C'),False))[0]
 for name in ['HelpPanel','RequestPanel','IncomingPanel','ViewingPanel']:
  try:h.get_editor_property(name).set_visibility(u.SlateVisibility.COLLAPSED)
  except:pass
 if not h.get_editor_property('Seated'):h.get_editor_property('SeatButton').on_clicked.broadcast()
 timing={'t':0,'handle':None}
 def audit_tick(dt):
  timing['t']+=dt
  if timing['t']<2:return
  try:
   h.set_visibility(u.SlateVisibility.HIDDEN);pc.set_control_rotation(u.Rotator(pitch=-12,yaw=0,roll=0));lib.call_method('SetInputMode_GameOnly',(pc,False));pc.set_editor_property('show_mouse_cursor',False);lib.call_method('SetFocusToGameViewport',())
   data={'seated':h.get_editor_property('Seated'),'location':str(pawn.get_actor_location()),'camera':str(pc.player_camera_manager.get_camera_location()),'rotation':str(pc.get_control_rotation()),'bones':{b:str(pawn.mesh.get_socket_location(b)) for b in ['pelvis','calf_l','calf_r','foot_l','foot_r','hand_l','hand_r']}}
   pathlib.Path(u.Paths.project_saved_dir(),'seat-audit-before-input.json').write_text(json.dumps(data,indent=2))
  except:pathlib.Path(u.Paths.project_saved_dir(),'seat-audit-before-input.json').write_text(json.dumps({'error':traceback.format_exc()}))
  u.unregister_slate_post_tick_callback(timing['handle'])
 timing['handle']=u.register_slate_post_tick_callback(audit_tick)
seat_visual_audit()
