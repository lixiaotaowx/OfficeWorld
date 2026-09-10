import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
from editor_toolset.toolsets import blueprint_dsl as D
r={};root=pathlib.Path(u.Paths.project_saved_dir());lang=u.InternationalizationLibrary.get_current_language()
try:
 u.InternationalizationLibrary.set_current_language('en')
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g);T=u.get_default_object(u.UMGToolSet)
 widgets={str(i.widget_name):i.widget for i in T.call_method('GetWidgets',(bp,)).widgets}
 # Do not retain escaped newlines produced by the experimental graph DSL tokenizer.
 for n in B.find_nodes(g):
  if isinstance(n,u.K2Node_CallFunction):
   pin=n.find_input_pin('InText')
   if pin.is_valid():
    value=pin.get_pin_value()
    if '\\n' in value:pin.set_pin_value(value.replace('\\n','\n'))
    if value=='我的工位':pin.set_pin_value('坐下 / 站起')
 widgets['NearbyHint'].set_text('Tab 切换鼠标 / 视角 · 观看需获准')
 widgets['HelpBody'].set_text('W A S D 移动 · 鼠标看向四周\nTab 切换鼠标操作 / 视角控制\n靠近自己的椅子：坐下 / 站起\n靠近同事工位：申请观看屏幕\n专注或离线的同事暂不接受申请')
 for name,height in [('HelpBody',165),('PeopleList',170),('IncomingBody',100),('ViewingPlaceholder',200),('ShareStatus',90),('RequestBody',90)]:widgets[name].slot.set_size(u.Vector2D(widgets[name].slot.get_size().x,height))
 # Remove stock button outlines and match the sage/charcoal office palette.
 def brush(color):
  b=u.SlateBrush();b.set_editor_property('draw_as',u.SlateBrushDrawType.ROUNDED_BOX);b.set_editor_property('tint_color',u.SlateColor(specified_color=u.LinearColor(*color)))
  outline=b.get_editor_property('outline_settings');outline.set_editor_property('corner_radii',u.Vector4(8,8,8,8));outline.set_editor_property('width',0);b.set_editor_property('outline_settings',outline);return b
 for name,w in widgets.items():
  if isinstance(w,u.Button):
   primary=name in ['SeatButton','InteractButton','DemoAllow','AllowIncoming','CloseHelp']
   style=w.widget_style;style.set_editor_property('normal',brush((.20,.34,.23,1) if primary else (.075,.105,.085,1)));style.set_editor_property('hovered',brush((.29,.45,.31,1)));style.set_editor_property('pressed',brush((.13,.23,.15,1)));w.set_style(style);w.set_background_color(u.LinearColor(1,1,1,1))
  if isinstance(w,u.Border):w.set_brush(brush((.023,.035,.028,.97)))
 # The nearby own-workstation button uses exactly the same seat flow as the toolbar.
 events={n.get_node_title().replace(' ',''):n for n in B.find_nodes(g) if isinstance(n,u.K2Node_ComponentBoundEvent)}
 source=events['OnClicked(InteractButton)'].find_output_pin('then');previous=list(source.list_connected_pins())
 near=ed.add_get_member_variable_node('NearbyIndex');eq=ed.add_call_function_node('/Script/Engine.KismetMathLibrary:EqualEqual_IntInt');eq.find_input_pin('B').set_pin_value('1');near.find_output_pin('NearbyIndex').try_create_connection(eq.find_input_pin('A'))
 branch=ed.add_branch_node();eq.find_output_pin('ReturnValue').try_create_connection(branch.find_input_pin('Condition'));source.break_pin_links();source.try_create_connection(branch.find_input_pin('execute'))
 for pin in previous:branch.find_output_pin('else').try_create_connection(pin)
 for pin in events['OnClicked(SeatButton)'].find_output_pin('then').list_connected_pins():branch.find_output_pin('then').try_create_connection(pin)
 # Incoming consent is valid only while the request is actually displayed.
 for key in ['AllowIncoming','DenyIncoming']:
  src=events['OnClicked('+key+')'].find_output_pin('then');links=list(src.list_connected_pins());panel=ed.add_get_member_variable_node('IncomingPanel');visible=ed.add_call_function_node('/Script/UMG.Widget:IsVisible');panel.find_output_pin('IncomingPanel').try_create_connection(visible.find_input_pin('self'));gate=ed.add_branch_node();visible.find_output_pin('ReturnValue').try_create_connection(gate.find_input_pin('Condition'));src.break_pin_links();src.try_create_connection(gate.find_input_pin('execute'))
  for pin in links:gate.find_output_pin('then').try_create_connection(pin)
 # Persistent session status, visible even when the sharing panel is closed.
 canvas=widgets['RootCanvas'];info=T.call_method('AddWidget',(bp,u.Border.static_class(),'SessionStatusPanel',canvas,-1));panel=info.widget;panel.set_brush(brush((.023,.035,.028,.97)));panel.set_padding(u.Margin(14,8,14,8));s=info.slot;s.set_anchors(u.Anchors(u.Vector2D(.5,0),u.Vector2D(.5,0)));s.set_position(u.Vector2D(-235,24));s.set_size(u.Vector2D(470,48))
 tx=T.call_method('AddWidget',(bp,u.TextBlock.static_class(),'SessionStatusText',panel,-1)).widget;tx.set_text('屏幕未分享 · 仅本人可见');f=tx.font;f.size=16;f.typeface_font_name='Regular';tx.set_font(f);T.call_method('ToggleWidgetAsVariable',(bp,tx,True))
 if 'IncomingDeadline' not in list(B.list_variables(bp)):B.add_variable(bp,'IncomingDeadline','float')
 _BlueprintCache.invalidate(bp)
 def typ(s):return next(v for v in B.find_node_types(g,s) if v.rsplit('|',1)[-1]==s)
 def get(n):return '('+typ('Get'+n)+')'
 # Stamp an incoming request deadline as it is opened.
 src=events['OnClicked(DemoIncoming)'].find_output_pin('then');links=list(src.list_connected_pins());now=ed.add_call_function_node('/Script/Engine.KismetSystemLibrary:GetGameTimeInSeconds');plus=ed.add_call_function_node('/Script/Engine.KismetMathLibrary:Add_DoubleDouble');now.find_output_pin('ReturnValue').try_create_connection(plus.find_input_pin('A'));plus.find_input_pin('B').set_pin_value('30.0');deadline=ed.add_set_member_variable_node('IncomingDeadline');plus.find_output_pin('ReturnValue').try_create_connection(deadline.find_input_pin('IncomingDeadline'));src.break_pin_links();src.try_create_connection(deadline.find_input_pin('execute'))
 for pin in links:deadline.find_output_pin('then').try_create_connection(pin)
 fg=B.add_function_graph(bp,'UpdateOfficeStatus')
 text='(Widget|SetText(Text) :self '+get('SessionStatusText')+' :InText '
 code='(fn UpdateOfficeStatus () (if '+get('Sharing')+' '+text+'"林可正在观看你的屏幕 · 演示授权") (elif (== '+get('RequestState')+' 2) '+text+'"正在观看林可 · 仅观看 · 演示") (elif (== '+get('RequestState')+' 1) '+text+'"观看请求等待回应 · 可以取消") (else '+text+'"屏幕未分享 · 仅本人可见"))))) (if (and (Widget|IsVisible :self '+get('IncomingPanel')+') (> (Utilities|Time|GetGameTimeinSeconds) '+get('IncomingDeadline')+')) (Widget|SetVisibility :self '+get('IncomingPanel')+' :InVisibility "Collapsed")))'
 def create(graph,tid,pos=u.Vector2D(),declaring_class=None):
  if tid=='Utilities|FlowControl|Branch':return u.BlueprintGraphEditor.get_graph_editor(graph).add_branch_node()
  return B.create_node(graph,tid,pos,declaring_class)
 D.Transpiler(fg,create,B.connect_pins,B._get_node_info,B.set_pin_value,lambda graph:B.find_nodes(graph),delete_node_fn=B.delete_node,find_node_types_fn=lambda f:B.find_node_types(fg,f)).transpile(code)
 B.compile_blueprint(bp)
 update=ed.add_call_function_node('/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C:UpdateOfficeStatus');assert update
 event=next(n for n in B.find_nodes(g) if isinstance(n,u.K2Node_Event) and 'Tick' in n.get_node_title());src=event.find_output_pin('then');links=list(src.list_connected_pins());src.break_pin_links();src.try_create_connection(update.find_input_pin('execute'))
 for pin in links:update.find_output_pin('then').try_create_connection(pin)
 B.compile_blueprint(bp);assert not ed.list_nodes_with_errors();assert not u.BlueprintGraphEditor.get_graph_editor(fg).list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp);r['saved']=True
except Exception:r['error']=traceback.format_exc()
finally:u.InternationalizationLibrary.set_current_language(lang)
(root/'office-ui-polish.json').write_text(json.dumps(r,indent=2))
