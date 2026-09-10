"""PIE integration test through Enhanced Input actions, native UMG and body bones."""
import unreal as u,json,pathlib,traceback
def test_office_body_and_input():
 world=u.EditorLevelLibrary.get_game_world();p=u.GameplayStatics.get_player_pawn(world,0);pc=u.GameplayStatics.get_player_controller(world,0);root=pathlib.Path(u.Paths.project_saved_dir())
 widgets=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));h=widgets.call_method('GetAllWidgetsOfClass',(world,u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C'),False))[0]
 subs=u.get_default_object(u.load_class(None,'/Script/Engine.SubsystemBlueprintLibrary')).call_method('GetLocalPlayerSubSystemFromPlayerController',(pc,u.EnhancedInputLocalPlayerSubsystem.static_class()))
 move=u.load_asset('/Game/Input/Actions/IA_Move');look=u.load_asset('/Game/Input/Actions/IA_MouseLook');r={'checks':[],'input_method':'UE Enhanced Input InjectInputVectorForAction; runs native input bindings, not direct movement calls','physical_mouse_evidence':'seat-audit-after-mouse.json'}
 for name in ['HelpPanel','RequestPanel','IncomingPanel','ViewingPanel']:
  try:h.get_editor_property(name).set_visibility(u.SlateVisibility.COLLAPSED)
  except:pass
 h.set_visibility(u.SlateVisibility.VISIBLE);p.set_actor_location(u.Vector(-355,-20,100),False,False);p.character_movement.stop_movement_immediately();pc.set_control_rotation(u.Rotator(pitch=-15,yaw=-90,roll=0))
 state={'elapsed':0,'phase':0,'handle':None,'start':None,'seat':None}
 def expect(name,ok,detail=None):
  r['checks'].append({'name':name,'passed':bool(ok),'detail':detail});assert ok,name
 def inject(a,x,y):subs.call_method('InjectInputVectorForAction',(a,u.Vector(x,y,0),[],[]))
 def done():
  (root/'office-body-input-tests.json').write_text(json.dumps(r,indent=2));u.unregister_slate_post_tick_callback(state['handle'])
 def tick_body(dt):
  state['elapsed']+=dt;t=state['elapsed'];phase=state['phase']
  try:
   if not u.SystemLibrary.is_valid(world):raise RuntimeError('PIE ended during integration test')
   if phase==0 and t>.6:
    h.get_editor_property('SeatButton').on_clicked.broadcast();state.update(phase=1,elapsed=0)
   elif phase==1 and t>1.7:
    expect('first seat body and transition',h.get_editor_property('Seated') and not h.get_editor_property('SeatTransition') and 50<p.mesh.get_socket_location('pelvis').z<70);state.update(phase=2,elapsed=0,seat=p.get_actor_location());pc.set_control_rotation(u.Rotator(pitch=-15,yaw=-90,roll=0))
   elif phase==2:
    inject(move,1,0);inject(look,.5,20)
    if t>.7:
     pos=p.get_actor_location();expect('movement input cannot move seated pawn',(pos-state['seat']).length()<.1);rotation=pc.get_control_rotation();pitch=rotation.pitch if rotation.pitch<180 else rotation.pitch-360
     expect('seated look input changes yaw and respects pitch range',abs(rotation.yaw-270)>2 and -35.1<=pitch<=20.1,str(rotation));h.get_editor_property('SeatButton').on_clicked.broadcast();state.update(phase=3,elapsed=0)
   elif phase==3 and t>1.7:
    expect('stand restores locomotion animation and collision',not h.get_editor_property('Seated') and p.get_actor_enable_collision() and p.character_movement.movement_mode==u.MovementMode.MOVE_WALKING and p.mesh.get_animation_mode()==u.AnimationMode.ANIMATION_BLUEPRINT)
    pc.set_control_rotation(u.Rotator(pitch=-15,yaw=-90,roll=0));state.update(phase=4,elapsed=0,start=p.get_actor_location())
   elif phase==4:
    inject(move,1,0)
    if t>.7:
     distance=(p.get_actor_location()-state['start']).length();expect('post-stand movement input causes actual displacement',distance>50,{'cm':distance,'from':str(state['start']),'to':str(p.get_actor_location())});state.update(phase=5,elapsed=0)
   elif phase==5:
    inject(move,-1,0)
    if t>.7:state.update(phase=6,elapsed=0);state['look_start']=pc.get_control_rotation().yaw
   elif phase==6:
    inject(look,.4,-.2)
    if t>.5:
     expect('post-stand observation input rotates camera',abs(pc.get_control_rotation().yaw-state['look_start'])>2);state.update(phase=7,elapsed=0)
   elif phase==7 and t>.5:
    expect('walk back reaches own station',h.get_editor_property('NearbyIndex')==1);h.get_editor_property('SeatButton').on_clicked.broadcast();state.update(phase=8,elapsed=0)
   elif phase==8 and t>1.7:
    expect('second seating really enters animated seat',h.get_editor_property('Seated') and not h.get_editor_property('SeatTransition') and abs(p.get_actor_location().y+170)<1 and p.mesh.get_animation_mode()==u.AnimationMode.ANIMATION_SINGLE_NODE)
    r['second_seat_bones']={b:str(p.mesh.get_socket_location(b)) for b in ['pelvis','calf_l','calf_r','foot_l','foot_r','hand_l','hand_r']};h.set_visibility(u.SlateVisibility.HIDDEN)
    cam=next(a for a in u.GameplayStatics.get_all_actors_of_class(world,u.CameraActor) if a.get_actor_label()=='OfficeSeatCamera_A01')
    cam.set_actor_location(u.Vector(-160,-170,95),False,False);cam.set_actor_rotation(u.Rotator(pitch=-8,yaw=180,roll=0),False);cam.camera_component.set_field_of_view(65);pc.set_view_target_with_blend(cam,.1)
    r['passed']=True;done()
  except:r['passed']=False;r['error']=traceback.format_exc();r['phase']=phase;done()
 state['handle']=u.register_slate_post_tick_callback(tick_body)
test_office_body_and_input()
