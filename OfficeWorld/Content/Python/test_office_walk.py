"""Exercise the real possessed CharacterMovement component through the clear aisle."""
import unreal as u,json,os,time
w=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(w,0)
assert p and isinstance(p,u.Character)
start=p.get_actor_location();result={'pawn_class':p.get_class().get_path_name(),'start':[start.x,start.y,start.z],'samples':[]}
ctx={'elapsed':0,'step':0,'handle':None}
def tick(dt):
 ctx['elapsed']+=dt
 # Walk across the front aisle toward the meeting door, without teleporting.
 if ctx['elapsed']<2.0:p.add_movement_input(u.Vector(1,0,0),1.0)
 else:
  end=p.get_actor_location();result['end']=[end.x,end.y,end.z];result['distance_cm']=(end-start).length();result['movement_mode']=str(p.character_movement.movement_mode)
  result['passed']=result['distance_cm']>100 and abs(end.z-start.z)<5
  p.character_movement.stop_movement_immediately()
  with open(os.path.join(u.Paths.project_saved_dir(),'office-walk-test.json'),'w') as f:json.dump(result,f,indent=2)
  u.unregister_slate_post_tick_callback(ctx['handle'])
ctx['handle']=u.register_slate_post_tick_callback(tick)
