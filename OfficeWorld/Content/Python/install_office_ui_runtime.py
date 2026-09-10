import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
r={};root=pathlib.Path(u.Paths.project_saved_dir());lang=u.InternationalizationLibrary.get_current_language()
try:
 u.InternationalizationLibrary.set_current_language('en')
 path='/Game/OfficeInteraction/BP_OfficeInteraction'
 bp=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else B.create('/Game/OfficeInteraction','BP_OfficeInteraction',u.Actor.static_class())
 if 'SeatCamera' not in list(B.list_variables(bp)):B.add_object_variable(bp,'SeatCamera',u.Actor.static_class())
 B.set_variable_instance_editable(bp,'SeatCamera',True);g=B.get_graph(bp,'EventGraph');_BlueprintCache.invalidate(bp)
 # Class-specialized CreateWidget exposes the HUD instance; find the exact variable setter.
 hud=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');hud_class=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C')
 names=list(B.find_node_types(g,'SetSeatCamera'));r['setters']=names
 getter=next(x for x in B.find_node_types(g,'GetSeatCamera') if 'Default' in x)
 setter=next(x for x in names if 'WBPOfficeHUD' in x.replace('_',''))
 code='''(event EventBeginPlay
 (Utilities|FlowControl|Delay :Duration 0.25)
 (bind pc (Game|GetPlayerController :PlayerIndex 0))
 (bind hud (UserInterface|CreateWidget :Class "/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C" :OwningPlayer pc))
 (SETTER :self hud :SeatCamera (GETTER))
 (UserInterface|Viewport|AddtoViewport :self hud :ZOrder 20))'''.replace('SETTER',setter).replace('GETTER',getter)
 create_widget=next(x for x in B.find_node_types(g,'CreateWidget') if x.endswith('|CreateWidget'))
 code=code.replace('UserInterface|CreateWidget',create_widget)
 from editor_toolset.toolsets import blueprint_dsl as D
 D.Transpiler(g,B.create_node,B.connect_pins,B._get_node_info,B.set_pin_value,lambda graph:B.find_nodes(graph),delete_node_fn=B.delete_node,find_node_types_fn=lambda f:B.find_node_types(g,f)).transpile(code)
 B.compile_blueprint(bp);errors=u.BlueprintGraphEditor.get_graph_editor(g).list_nodes_with_errors();assert not errors,str(errors)
 u.EditorAssetLibrary.save_loaded_asset(bp)
 E=u.get_editor_subsystem(u.EditorActorSubsystem);actors={a.get_actor_label():a for a in E.get_all_level_actors()}
 cam=actors.get('OfficeSeatCamera_A01')
 if not cam:cam=E.spawn_actor_from_class(u.CameraActor,u.Vector(-355,-125,118));cam.set_actor_label('OfficeSeatCamera_A01')
 cam.set_actor_location(u.Vector(-355,-125,118),False,False);cam.set_actor_rotation(u.Rotator(pitch=-5,yaw=-90,roll=0),False);cam.camera_component.set_field_of_view(85);cam.set_folder_path('OfficeInteraction')
 manager=actors.get('OfficeInteractionRuntime')
 if not manager:manager=E.spawn_actor_from_class(u.load_class(None,path+'.BP_OfficeInteraction_C'),u.Vector(0,0,0));manager.set_actor_label('OfficeInteractionRuntime')
 manager.set_editor_property('SeatCamera',cam);manager.set_folder_path('OfficeInteraction')
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 r['saved']=True;r['manager']=manager.get_path_name();r['camera']=cam.get_path_name()
except Exception:r['error']=traceback.format_exc()
finally:u.InternationalizationLibrary.set_current_language(lang)
(root/'office-ui-runtime-install.json').write_text(json.dumps(r,indent=2,ensure_ascii=False),encoding='utf-8')
