import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
def inspect_seat_nodes_full():
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');out=[]
 for n in B.find_nodes(g):
  title=n.get_node_title()
  if any(t in title.lower().replace(' ','') for t in ['seated','viewtarget','movementmode','actorlocation','ignoremove','seatbutton','returnlocation']):
   info=B._get_node_info(n);out.append({'name':n.get_name(),'title':title,'in':{p.name:{'value':p.value,'links':[(x.get_owning_node().get_name(),x.get_pin_name()) for x in n.find_input_pin(p.name).list_connected_pins()]} for p in info.input_pins},'out':{p.name:[(x.get_owning_node().get_name(),x.get_pin_name()) for x in n.find_output_pin(p.name).list_connected_pins()] for p in info.output_pins}})
 pathlib.Path(u.Paths.project_saved_dir(),'seat-nodes-full.json').write_text(json.dumps(out,indent=2,ensure_ascii=False,default=str),encoding='utf-8')
inspect_seat_nodes_full()
