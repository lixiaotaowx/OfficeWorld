import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
def clamp_seated_camera():
 r={}
 try:
  bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g)
  assert 'SeatCameraLimitsInstalled' not in list(B.list_variables(bp)),'Already installed'
  B.add_variable(bp,'SeatCameraLimitsInstalled','bool')
  def con(a,b):assert a.try_create_connection(b)
  pc=ed.add_call_function_node('/Script/UMG.Widget:GetOwningPlayer');cam=ed.add_get_member_variable_node('PlayerCameraManager','/Script/Engine.PlayerController');con(pc.find_output_pin('ReturnValue'),cam.find_input_pin('self'))
  for name,seated in [('K2Node_VariableSet_28',True),('K2Node_VariableSet_25',False)]:
   target=next(n for n in B.find_nodes(g) if n.get_name()==name);tail=list(target.find_output_pin('then').list_connected_pins());target.find_output_pin('then').break_pin_links();previous=target.find_output_pin('then')
   for var,val in [('ViewPitchMin',-35 if seated else -80),('ViewPitchMax',20 if seated else 80)]:
    n=ed.add_set_member_variable_node(var,'/Script/Engine.PlayerCameraManager');n.find_input_pin(var).set_pin_value(str(val));con(cam.find_output_pin('PlayerCameraManager'),n.find_input_pin('self'));con(previous,n.find_input_pin('execute'));previous=n.find_output_pin('then')
   for pin in tail:con(previous,pin)
  B.compile_blueprint(bp);assert not ed.list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp);r['saved']=True
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'seat-camera-limits.json').write_text(json.dumps(r,indent=2))
clamp_seated_camera()
