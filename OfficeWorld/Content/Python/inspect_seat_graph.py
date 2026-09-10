import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');r={}
def trace(n,depth=0):
 info=B._get_node_info(n);data={'title':n.get_node_title(),'path':n.get_path_name(),'inputs':{},'out':{}}
 for p in info.input_pins:
  pin=B._resolve_pin(p.pin_id) if hasattr(B,'_resolve_pin') else n.find_input_pin(p.name)
  data['inputs'][p.name]={'value':p.value,'links':[x.get_owning_node().get_node_title() for x in pin.list_connected_pins()]}
 if depth<3:
  for p in info.output_pins:
   if p.name in ['then','else']:
    data['out'][p.name]=[trace(x.get_owning_node(),depth+1) for x in n.find_output_pin(p.name).list_connected_pins()]
 return data
for n in B.find_nodes(g):
 if isinstance(n,u.K2Node_ComponentBoundEvent) and any(v in n.get_node_title() for v in ['SeatButton','InteractButton']):r[n.get_node_title()]=trace(n)
pathlib.Path(u.Paths.project_saved_dir(),'seat-graph.json').write_text(json.dumps(r,indent=2,ensure_ascii=False),encoding='utf-8')
