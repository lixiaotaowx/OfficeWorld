import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');fixed=[]
for g in B.list_graphs(bp):
 for n in B.find_nodes(g):
  for p in B._get_node_info(n).input_pins:
   if ('WasInputKeyJustPressed' in n.get_node_title().replace(' ','') and p.name=='Key') or (g.get_name()=='OnPreviewKeyDown' and p.name=='B'):
    assert n.find_input_pin(p.name).set_pin_value('Tab');fixed.append(n.get_name()+'.'+p.name)
B.compile_blueprint(bp)
for g in B.list_graphs(bp):assert not u.BlueprintGraphEditor.get_graph_editor(g).list_nodes_with_errors()
u.EditorAssetLibrary.save_loaded_asset(bp)
pathlib.Path(u.Paths.project_saved_dir(),'office-key-literal.json').write_text(json.dumps({'saved':True,'fixed':fixed}))
