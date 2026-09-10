import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
def wire_true_seating():
 result={}
 try:
  assert u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'Stop PIE first'
  bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g)
  first='SeatTransition' not in list(B.list_variables(bp))
  if first:B.add_variable(bp,'SeatTransition','bool')
  nodes={n.get_name():n for n in B.find_nodes(g)}
  def con(a,b):assert a.try_create_connection(b),(str(a),str(b))
  def call(path,**pins):
   n=ed.add_call_function_node(path)
   for k,v in pins.items():assert n.find_input_pin(k).set_pin_value(v),(path,k)
   return n
  def get(name,cls=None):return ed.add_get_member_variable_node(name,cls) if cls else ed.add_get_member_variable_node(name)
  def setv(name,value):
   n=ed.add_set_member_variable_node(name);n.find_input_pin(name).set_pin_value(value);return n
  def chain(start,*ns):
   for n in ns:con(start,n.find_input_pin('execute'));start=n.find_output_pin('then')
   return start
  def insert_before(target,ns):
   ip=target.find_input_pin('execute');sources=list(ip.list_connected_pins());ip.break_pin_links()
   for s in sources:chain(s,*ns,target)
  pc=call('/Script/UMG.Widget:GetOwningPlayer');pawn=call('/Script/Engine.GameplayStatics:GetPlayerCharacter');mesh=get('Mesh','/Script/Engine.Character');con(pawn.find_output_pin('ReturnValue'),mesh.find_input_pin('self'))
  def anim(name,loop=False):
   n=call('/Script/Engine.SkeletalMeshComponent:PlayAnimation',NewAnimToPlay='/Game/OfficeInteraction/Animations/'+name+'.'+name,bLooping=str(loop).lower());con(mesh.find_output_pin('Mesh'),n.find_input_pin('self'));return n
  def delay():return call('/Script/Engine.KismetSystemLibrary:Delay',Duration='1.2')
  # Gate every entry into the seat toggle, including the own-station interaction button.
  if first:
   gate=ed.add_branch_node();transition=get('SeatTransition');con(transition.find_output_pin('SeatTransition'),gate.find_input_pin('Condition'))
   entry=nodes['K2Node_IfThenElse_5'];sources=list(entry.find_input_pin('execute').list_connected_pins());entry.find_input_pin('execute').break_pin_links()
   for s in sources:con(s,gate.find_input_pin('execute'))
   con(gate.find_output_pin('else'),entry.find_input_pin('execute'))
  # Stay on the pawn camera: mouse yaw/pitch remain active while movement is disabled.
  sitcam=nodes['K2Node_CallFunction_185'];sitcam.find_input_pin('NewViewTarget').break_pin_links();con(pawn.find_output_pin('ReturnValue'),sitcam.find_input_pin('NewViewTarget'))
  seatpos=nodes['K2Node_CallFunction_183'];seatpos.find_input_pin('NewLocation').break_pin_links();seatpos.find_input_pin('NewLocation').set_pin_value('-355,-125,92')
  rot=call('/Script/Engine.Actor:K2_SetActorRotation',bTeleportPhysics='true');con(pawn.find_output_pin('ReturnValue'),rot.find_input_pin('self'))
  rotval=call('/Script/Engine.KismetMathLibrary:MakeRotator',Pitch='0',Yaw='-90',Roll='0');con(rotval.find_output_pin('ReturnValue'),rot.find_input_pin('NewRotation'))
  look=call('/Script/Engine.Controller:SetControlRotation');con(pc.find_output_pin('ReturnValue'),look.find_input_pin('self'))
  lookval=call('/Script/Engine.KismetMathLibrary:MakeRotator',Pitch='-15',Yaw='-90',Roll='0');con(lookval.find_output_pin('ReturnValue'),look.find_input_pin('NewRotation'))
  insert_before(seatpos,[setv('SeatTransition','true'),rot,look])
  # Mark seated, then finish the down transition before starting the looping work pose.
  seated=nodes['K2Node_VariableSet_28'];tails=list(seated.find_output_pin('then').list_connected_pins());seated.find_output_pin('then').break_pin_links()
  inp=call('/Script/UMG.WidgetBlueprintLibrary:SetInputMode_GameOnly');con(pc.find_output_pin('ReturnValue'),inp.find_input_pin('PlayerController'))
  cursor=ed.add_set_member_variable_node('bShowMouseCursor','/Script/Engine.PlayerController');cursor.find_input_pin('bShowMouseCursor').set_pin_value('false');con(pc.find_output_pin('ReturnValue'),cursor.find_input_pin('self'))
  end=chain(seated.find_output_pin('then'),anim('Office_SitDown'),inp,cursor,setv('MenuOpen','false'),call('/Script/UMG.WidgetBlueprintLibrary:SetFocusToGameViewport'),delay(),anim('Office_Work',True),setv('SeatTransition','false'))
  for t in tails:con(end,t)
  # Animate rising before restoring locomotion. The transition gate prevents re-entry races.
  restore=call('/Script/Engine.SkeletalMeshComponent:SetAnimInstanceClass',NewClass='/Game/Characters/Mannequins/Anims/Unarmed/ABP_Unarmed.ABP_Unarmed_C');con(mesh.find_output_pin('Mesh'),restore.find_input_pin('self'))
  insert_before(nodes['K2Node_CallFunction_161'],[setv('SeatTransition','true'),anim('Office_StandUp'),delay(),restore])
  stand=nodes['K2Node_VariableSet_25'];tails=list(stand.find_output_pin('then').list_connected_pins());stand.find_output_pin('then').break_pin_links();end=chain(stand.find_output_pin('then'),setv('SeatTransition','false'))
  for t in tails:con(end,t)
  B.compile_blueprint(bp);errors=list(ed.list_nodes_with_errors());assert not errors,str(errors);u.EditorAssetLibrary.save_loaded_asset(bp);result['saved']=True
 except:result['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'true-seating-install.json').write_text(json.dumps(result,indent=2))
wire_true_seating()
