import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');r={}
for n in B.find_nodes(g):
 if n.get_name()=='K2Node_IfThenElse_17':
  eq=n.find_input_pin('Condition').list_connected_pins()[0].get_owning_node();r['eq']=str(B._get_node_info(eq))
  r['get']=[str(B._get_node_info(x.get_owning_node())) for x in eq.find_input_pin('A').list_connected_pins()]
pathlib.Path(u.Paths.project_saved_dir(),'ui-gate.json').write_text(json.dumps(r,indent=2))
