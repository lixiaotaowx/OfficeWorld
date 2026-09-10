"""Continuous possessed-pawn route through new facilities; teleport only initial setup."""
import unreal as u,json,pathlib,traceback,math
def test_routes():
 w=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(w,0);pc=u.GameplayStatics.get_player_controller(w,0)
 p.set_actor_location(u.Vector(-355,20,100),False,False);p.character_movement.stop_movement_immediately();pc.reset_ignore_move_input();pc.set_view_target_with_blend(p,0)
 route=[('office aisle',245,20),('meeting entrance',245,-110),('meeting exit',245,20),('pantry approach',400,140),('WC approach',370,341.5),('WC doorway',478,341.5),('WC exit',370,341.5),('office entry',400,620),('crosswalk',400,1510),('park path',400,2200)]
 r={'capsule_radius':p.capsule_component.get_scaled_capsule_radius(),'method':'CharacterMovement AddMovementInput, continuous route; initial setup teleport only','checks':[]};s={'i':0,'elapsed':0,'handle':None}
 def done():
  p.character_movement.stop_movement_immediately();pathlib.Path(u.Paths.project_saved_dir(),'delivery-route-tests.json').write_text(json.dumps(r,indent=2));u.unregister_slate_post_tick_callback(s['handle'])
 def tick(dt):
  try:
   assert u.SystemLibrary.is_valid(w),'PIE ended';s['elapsed']+=dt;name,x,y=route[s['i']];loc=p.get_actor_location();delta=u.Vector(x-loc.x,y-loc.y,0);distance=delta.length()
   if distance<22:
    assert 85<loc.z<110, 'unexpected floor height';r['checks'].append({'name':name,'passed':True,'location':str(loc),'seconds':s['elapsed']});s['i']+=1;s['elapsed']=0
    if s['i']==len(route):r['passed']=True;done();return
   else:
    assert s['elapsed']<12, 'route blocked at '+name+' '+str(loc)
    direction=delta/distance;p.add_movement_input(direction,min(1.0,max(.12,distance/100)));pc.set_control_rotation(u.Rotator(pitch=-12,yaw=math.degrees(math.atan2(delta.y,delta.x)),roll=0))
  except:r['passed']=False;r['error']=traceback.format_exc();done()
 s['handle']=u.register_slate_post_tick_callback(tick)
test_routes()
