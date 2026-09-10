import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');fixes=[]
for n in B.find_nodes(g):
 if n.get_name()=='K2Node_IfThenElse_17':
  eq=n.find_input_pin('Condition').list_connected_pins()[0].get_owning_node();assert eq.find_input_pin('B').set_pin_value('1');fixes.append('own station compare=1 after type promotion')
 if isinstance(n,u.K2Node_VariableSet) and 'IncomingDeadline' in n.get_node_title():
  linked=n.find_input_pin('IncomingDeadline').list_connected_pins()
  for pin in linked:
   plus=pin.get_owning_node();assert plus.find_input_pin('B').set_pin_value('30.0');fixes.append('incoming request timeout 30s after type promotion')
 if isinstance(n,u.K2Node_CallFunction):
  pin=n.find_input_pin('InText')
  if pin.is_valid():
   value=pin.get_pin_value()
   if '已向林可申请' in value:pin.set_pin_value('已向林可申请仅观看屏幕。等待回应，30 秒后自动结束。')
   if '演示授权已允许' in value:pin.set_pin_value('演示授权已允许：林可 · 仅观看。尚未捕获或传输真实屏幕。')
   if '我的工位' in value:pin.set_pin_value('坐下 / 站起')
B.compile_blueprint(bp);assert not u.BlueprintGraphEditor.get_graph_editor(g).list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp)
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-pin-fixes.json').write_text(json.dumps({'saved':True,'fixes':fixes},indent=2))
