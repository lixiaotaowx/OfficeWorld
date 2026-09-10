import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={};root=pathlib.Path(u.Paths.project_saved_dir())
try:
 E=u.get_editor_subsystem(u.EditorActorSubsystem);changed=[]
 for a in E.get_all_level_actors():
  if a.get_actor_label() in ['Furniture','Plants'] or (isinstance(a,u.StaticMeshActor) and not a.static_mesh_component.is_visible()):
   a.set_actor_enable_collision(False);changed.append(a.get_actor_label())
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g)
 event=next(n for n in B.find_nodes(g) if isinstance(n,u.K2Node_Event) and 'Tick' in n.get_node_title())
 start=event.find_output_pin('then');dest=list(start.list_connected_pins())
 owner=ed.add_call_function_node('/Script/UMG.UserWidget:GetOwningPlayerPawn')
 valid=ed.add_call_function_node('/Script/Engine.KismetSystemLibrary:IsValid')
 branch=ed.add_branch_node();assert owner and valid and branch
 assert owner.find_output_pin('ReturnValue').try_create_connection(valid.find_input_pin('Object'))
 assert valid.find_output_pin('ReturnValue').try_create_connection(branch.find_input_pin('Condition'))
 start.break_pin_links();assert start.try_create_connection(branch.find_input_pin('execute'))
 for pin in dest:assert branch.find_output_pin('then').try_create_connection(pin)
 # Disable gravity and velocity while seated; restore Walking on standing.
 for n in list(B.find_nodes(g)):
  if not isinstance(n,u.K2Node_CallFunction):continue
  if 'SetActorEnableCollision' not in n.get_node_title().replace(' ',''):continue
  enabled=n.find_input_pin('bNewActorEnableCollision').get_pin_value().lower()=='true'
  out=n.find_output_pin('then');links=list(out.list_connected_pins())
  char=ed.add_call_function_node('/Script/Engine.GameplayStatics:GetPlayerCharacter');char.find_input_pin('PlayerIndex').set_pin_value('0')
  movement=ed.add_get_member_variable_node('CharacterMovement','/Script/Engine.Character')
  assert char.find_output_pin('ReturnValue').try_create_connection(movement.find_input_pin('self'))
  mode=ed.add_call_function_node('/Script/Engine.CharacterMovementComponent:SetMovementMode')
  assert movement.find_output_pin('CharacterMovement').try_create_connection(mode.find_input_pin('self'))
  mode.find_input_pin('NewMovementMode').set_pin_value('MOVE_Walking' if enabled else 'MOVE_None')
  out.break_pin_links();assert out.try_create_connection(mode.find_input_pin('execute'))
  for pin in links:assert mode.find_output_pin('then').try_create_connection(pin)
 B.compile_blueprint(bp);assert not ed.list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp)
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r={'saved':True,'disabled_hidden_collision':changed,'pawn_validity_guard':True}
except Exception:r['error']=traceback.format_exc()
(root/'office-interaction-hardening.json').write_text(json.dumps(r,indent=2))
