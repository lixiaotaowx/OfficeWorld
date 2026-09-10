import unreal as u,json,pathlib
from editor_toolset.toolsets.blueprint import BlueprintTools as B
w=u.EditorLevelLibrary.get_game_world();cls=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C');lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));h=lib.call_method('GetAllWidgetsOfClass',(w,cls,False))[0]
r={'delegate':dir(h.get_editor_property('SeatButton').on_clicked),'eventdoc':u.K2Node_ComponentBoundEvent.__doc__,'funcs':{}}
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph')
for n in B.find_nodes(g):
 if isinstance(n,u.K2Node_ComponentBoundEvent):
  try:r['funcs'][n.get_node_title()]=str(n.get_editor_property('custom_function_name'))
  except Exception as e:r['funcs'][n.get_node_title()]=str(e)
pathlib.Path(u.Paths.project_saved_dir(),'ui-testing-api.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
