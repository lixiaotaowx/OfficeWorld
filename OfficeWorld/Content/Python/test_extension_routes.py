"""Continuous possessed character movement; no teleport between checkpoints."""
import unreal as u,pathlib,json,math,traceback,time
def run_extension_routes():
 w=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(w,0);pc=u.GameplayStatics.get_player_controller(w,0);assert p
 p.set_actor_location(u.Vector(245,20,100),False,False);p.character_movement.stop_movement_immediately();pc.reset_ignore_move_input()
 route=[('office aisle',400,140),('original entry',400,400),('connector',400,550),('corridor start',700,550),('restroom corridor',700,300),('restroom entrance',900,300),('restroom vestibule',900,145),('vanity approach',1000,145),('cubicle approach',1000,250),('toilet one',1180,250),('cubicle return',1000,250),('second cubicle aisle',1000,470),('toilet two',1180,470),('second cubicle return',1000,470),('privacy screen return',900,500),('restroom exit',900,300),('corridor restroom exit',700,300),('meeting corridor',700,-200),('meeting entrance',900,-200),('meeting north aisle',900,-380),('meeting display',1300,-380),('meeting window aisle',1300,-100),('meeting backtrack',1300,-380),('meeting return aisle',900,-380),('meeting exit',900,-200),('meeting corridor exit',700,-200),('fitness corridor',700,-700),('fitness entrance',900,-700),('fitness clear floor',920,-650),('fitness equipment approach',1030,-650),('fitness return',920,-650),('fitness exit',900,-700),('fitness corridor exit',700,-700),('billiards corridor',700,-1200),('billiards entrance',900,-1200),('billiards side aisle',900,-1020),('billiards table end',1100,-1020),('billiards window corner',1300,-1020),('billiards window aisle',1300,-1200),('billiards return corner',1300,-1020),('billiards return end',1100,-1020),('billiards return aisle',900,-1020),('billiards exit',900,-1200),('billiards corridor exit',700,-1200),('return corridor',700,550),('return connector',400,550),('return original office',400,400)]
 out=pathlib.Path(u.Paths.project_saved_dir())/'extension-route-tests.json';result={'passed':False,'running':True,'method':'Possessed CharacterMovement AddMovementInput; initial setup teleport only; no UI or keyboard simulation','checks':[],'capsule_radius':p.capsule_component.get_scaled_capsule_radius()};state={'i':0,'elapsed':0,'handle':None}
 def write():out.write_text(json.dumps(result,indent=2))
 def done():
  result['running']=False;p.character_movement.stop_movement_immediately();write();u.unregister_slate_post_tick_callback(state['handle'])
 def tick(dt):
  try:
   assert u.SystemLibrary.is_valid(w),'PIE ended';state['elapsed']+=dt;name,x,y=route[state['i']];loc=p.get_actor_location();delta=u.Vector(x-loc.x,y-loc.y,0);distance=delta.length()
   if distance<18:
    assert 82<loc.z<112,'Unexpected floor height: '+str(loc)
    result['checks'].append({'name':name,'location':[loc.x,loc.y,loc.z],'seconds':state['elapsed'],'passed':True});state['i']+=1;state['elapsed']=0;write()
    if state['i']==len(route):result['passed']=True;done();return
   else:
    assert state['elapsed']<20,'Blocked at '+name+' '+str(loc)
    p.add_movement_input(delta/distance,min(1.0,max(.15,distance/100)));pc.set_control_rotation(u.Rotator(pitch=-12,yaw=math.degrees(math.atan2(delta.y,delta.x)),roll=0))
  except Exception:result['error']=traceback.format_exc();done()
 write();state['handle']=u.register_slate_post_tick_callback(tick)
run_extension_routes()
