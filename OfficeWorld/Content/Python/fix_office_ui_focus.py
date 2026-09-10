import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={}
try:
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');T=u.get_default_object(u.UMGToolSet)
 for info in T.call_method('GetWidgets',(bp,)).widgets:
  w=info.widget
  if isinstance(w,u.Border):
   b=w.background;o=b.outline_settings;o.rounding_type=u.SlateBrushRoundingType.FIXED_RADIUS;o.corner_radii=u.Vector4(12,12,12,12);b.outline_settings=o;w.set_brush(b);w.set_brush_color(u.LinearColor(1,1,1,1))
  if isinstance(w,u.Button):
   s=w.widget_style
   for key in ['normal','hovered','pressed']:
    b=s.get_editor_property(key);o=b.outline_settings;o.rounding_type=u.SlateBrushRoundingType.FIXED_RADIUS;o.corner_radii=u.Vector4(7,7,7,7);b.outline_settings=o;s.set_editor_property(key,b)
   w.set_style(s)
 fg=B.add_function_graph(bp,'OnPreviewKeyDown');ed=u.BlueprintGraphEditor.get_graph_editor(fg)
 ed.remove_nodes([n for n in B.find_nodes(fg) if not isinstance(n,(u.K2Node_FunctionEntry,u.K2Node_FunctionResult))])
 entry=ed.find_graph_entry_pin();node=entry.get_owning_node();r['entry']=str(B._get_node_info(node))
 key=ed.add_call_function_node('/Script/Engine.KismetInputLibrary:GetKey');assert node.find_output_pin('InKeyEvent').try_create_connection(key.find_input_pin('Input'))
 eq=ed.add_call_function_node('/Script/Engine.KismetInputLibrary:EqualEqual_KeyKey');assert key.find_output_pin('ReturnValue').try_create_connection(eq.find_input_pin('A'))
 branch=ed.add_branch_node();assert eq.find_output_pin('ReturnValue').try_create_connection(branch.find_input_pin('Condition'));assert eq.find_input_pin('B').set_pin_value('(KeyName=Tab)');entry.break_pin_links();assert entry.try_create_connection(branch.find_input_pin('execute'))
 pc=ed.add_call_function_node('/Script/UMG.Widget:GetOwningPlayer')
 menu=ed.add_set_member_variable_node('MenuOpen');menu.find_input_pin('MenuOpen').set_pin_value('false');assert branch.find_output_pin('then').try_create_connection(menu.find_input_pin('execute'))
 mode=ed.add_call_function_node('/Script/UMG.WidgetBlueprintLibrary:SetInputMode_GameOnly');assert pc.find_output_pin('ReturnValue').try_create_connection(mode.find_input_pin('PlayerController'));assert menu.find_output_pin('then').try_create_connection(mode.find_input_pin('execute'))
 cursor=ed.add_set_member_variable_node('bShowMouseCursor','/Script/Engine.PlayerController');assert pc.find_output_pin('ReturnValue').try_create_connection(cursor.find_input_pin('self'));cursor.find_input_pin('bShowMouseCursor').set_pin_value('false');assert mode.find_output_pin('then').try_create_connection(cursor.find_input_pin('execute'))
 focus=ed.add_call_function_node('/Script/UMG.WidgetBlueprintLibrary:SetFocusToGameViewport');assert cursor.find_output_pin('then').try_create_connection(focus.find_input_pin('execute'))
 handled=ed.add_call_function_node('/Script/UMG.WidgetBlueprintLibrary:Handled');unhandled=ed.add_call_function_node('/Script/UMG.WidgetBlueprintLibrary:Unhandled');ret1=ed.add_return_node();ret2=ed.add_return_node()
 assert focus.find_output_pin('then').try_create_connection(ret1.find_input_pin('execute'));assert handled.find_output_pin('ReturnValue').try_create_connection(ret1.find_input_pin('ReturnValue'))
 assert branch.find_output_pin('else').try_create_connection(ret2.find_input_pin('execute'));assert unhandled.find_output_pin('ReturnValue').try_create_connection(ret2.find_input_pin('ReturnValue'))
 B.compile_blueprint(bp);assert not ed.list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp);r['saved']=True
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-focus.json').write_text(json.dumps(r,indent=2))
