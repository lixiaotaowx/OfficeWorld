"""Exercise actual PIE widget button delegates and Character state over engine ticks."""
import unreal as u,json,pathlib,traceback
def run_office_regression():
 root=pathlib.Path(u.Paths.project_saved_dir());w=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(w,0);pc=u.GameplayStatics.get_player_controller(w,0)
 lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));cls=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C');h=lib.call_method('GetAllWidgetsOfClass',(w,cls,False))[0]
 def prop(n):return h.get_editor_property(n)
 def click(n):prop(n).on_clicked.broadcast()
 def expect(name,ok):
  result['checks'].append({'name':name,'passed':bool(ok)})
  assert ok,name
 def move(x,y):p.set_actor_location(u.Vector(x,y,100),False,False);p.character_movement.stop_movement_immediately()
 result={'checks':[],'mode':'Actual PIE native UMG delegate/state tests; no network or capture'};steps=[]
 steps.append(lambda:click('SeatButton') if prop('Seated') else None)
 steps.append(lambda:move(-355,-20))
 steps.append(lambda:expect('own workstation proximity',prop('NearbyIndex')==1))
 steps.append(lambda:click('InteractButton'))
 steps.append(lambda:expect('seated position and gravity disabled',prop('Seated') and abs(p.get_actor_location().z-92)<2 and p.character_movement.movement_mode==u.MovementMode.MOVE_NONE))
 steps.append(lambda:click('SeatButton'))
 steps.append(lambda:expect('stand restores movement and position',not prop('Seated') and abs(p.get_actor_location().y+20)<3 and p.character_movement.movement_mode==u.MovementMode.MOVE_WALKING))
 steps.append(lambda:click('SeatButton'))
 steps.append(lambda:expect('second sit actually enters animated seat',prop('Seated') and not prop('SeatTransition') and abs(p.get_actor_location().y+170)<2 and p.mesh.get_animation_mode()==u.AnimationMode.ANIMATION_SINGLE_NODE))
 steps.append(lambda:click('SeatButton'))
 steps.append(lambda:expect('repeat sit stand',not prop('Seated') and p.get_actor_enable_collision()))
 steps.append(lambda:move(-25,-20))
 steps.append(lambda:expect('colleague proximity',prop('NearbyIndex')==2))
 steps.append(lambda:click('SeatButton'))
 steps.append(lambda:expect('cannot occupy colleague chair',not prop('Seated')))
 steps.append(lambda:click('InteractButton'))
 steps.append(lambda:expect('outgoing request pending',prop('RequestState')==1))
 steps.append(lambda:click('CancelRequest'));steps.append(lambda:click('DemoAllow'))
 steps.append(lambda:expect('late approval after cancel rejected',prop('RequestState')==4 and prop('ViewingPanel').visibility==u.SlateVisibility.COLLAPSED))
 steps.append(lambda:click('InteractButton'));steps.append(lambda:click('DemoDeny'))
 steps.append(lambda:expect('decline',prop('RequestState')==3))
 steps.append(lambda:click('InteractButton'));steps.append(lambda:click('DemoAllow'))
 steps.append(lambda:expect('allow opens view only placeholder',prop('RequestState')==2 and prop('ViewingPanel').visibility==u.SlateVisibility.VISIBLE))
 steps.append(lambda:click('EndViewing'))
 steps.append(lambda:expect('end viewing clears grant',prop('RequestState')==0))
 steps.append(lambda:click('InteractButton'))
 steps.append(lambda:ctx.update(wait_until=u.GameplayStatics.get_time_seconds(w)+31.0))
 steps.append(lambda:expect('expired request',prop('RequestState')==5))
 steps.append(lambda:click('DemoIncoming'));steps.append(lambda:click('DenyIncoming'))
 steps.append(lambda:expect('incoming denial no sharing',not prop('Sharing')))
 steps.append(lambda:click('AllowIncoming'))
 steps.append(lambda:expect('late incoming allow after rejection ignored',not prop('Sharing')))
 steps.append(lambda:click('DemoIncoming'));steps.append(lambda:click('AllowIncoming'))
 steps.append(lambda:expect('incoming allow local state',prop('Sharing')))
 steps.append(lambda:click('StopSharing'))
 steps.append(lambda:expect('stop revokes sharing',not prop('Sharing')))
 steps.append(lambda:move(-355,365))
 steps.append(lambda:expect('busy colleague proximity',prop('NearbyIndex')==3))
 steps.append(lambda:click('InteractButton'))
 steps.append(lambda:expect('busy request blocked',prop('RequestState')!=1))
 steps.append(lambda:move(-25,365));steps.append(lambda:click('InteractButton'))
 steps.append(lambda:expect('offline request blocked',prop('NearbyIndex')==4 and prop('RequestState')!=1))
 steps.append(lambda:move(130,70))
 steps.append(lambda:expect('leave workstation hides card',prop('NearbyIndex')==0 and prop('NearbyCard').visibility==u.SlateVisibility.COLLAPSED))
 steps.append(lambda:move(-355,-20));steps.append(lambda:click('HelpButton'))
 ctx={'elapsed':0,'index':0,'handle':None}
 def tick(dt):
  try:
   if not u.SystemLibrary.is_valid(w):
    result['passed']=False;result['error']='PIE ended during test';(root/'office-interaction-tests.json').write_text(json.dumps(result,indent=2));u.unregister_slate_post_tick_callback(ctx['handle']);return
   if u.GameplayStatics.get_time_seconds(w)<ctx.get('wait_until',0):return
   if h.get_editor_property('SeatTransition'):return
   ctx['elapsed']+=dt
   if ctx['elapsed']<.35:return
   ctx['elapsed']=0
   if ctx['index']<len(steps):steps[ctx['index']]();ctx['index']+=1;(root/'office-regression-progress.json').write_text(json.dumps({'step':ctx['index'],'checks':result['checks']}));return
   result['passed']=True
  except Exception:result['passed']=False;result['error']=traceback.format_exc()
  result['step']=ctx['index'];(root/'office-interaction-tests.json').write_text(json.dumps(result,indent=2));u.unregister_slate_post_tick_callback(ctx['handle'])
 ctx['handle']=u.register_slate_post_tick_callback(tick)
run_office_regression()
