import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
def fit_workstations():
 r={}
 try:
  E=u.get_editor_subsystem(u.EditorActorSubsystem);assert u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'Stop PIE first'
  actors={a.get_actor_label():a for a in E.get_all_level_actors()};A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary
  def material(name,color,rough,metal=0,emission=False):
   p='/Game/OfficeInteraction/Materials/'+name;m=u.load_asset(p) if u.EditorAssetLibrary.does_asset_exist(p) else A.create_asset(name,'/Game/OfficeInteraction/Materials',u.Material,u.MaterialFactoryNew());ML.delete_all_material_expressions(m)
   v=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);v.constant=u.LinearColor(*color,1);ML.connect_material_property(v,'',u.MaterialProperty.MP_BASE_COLOR)
   for val,prop in [(rough,u.MaterialProperty.MP_ROUGHNESS),(metal,u.MaterialProperty.MP_METALLIC)]:
    n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=val;ML.connect_material_property(n,'',prop)
   if emission:ML.connect_material_property(v,'',u.MaterialProperty.MP_EMISSIVE_COLOR)
   ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);return m
  case=material('M_EquipmentCharcoal',(.025,.029,.028),.58,.15);screen=material('M_EquipmentScreen',(.025,.075,.085),.32,0,True);keys=material('M_EquipmentKeys',(.13,.145,.14),.7)
  def place(label,mesh,center,width,z,materials):
   box=mesh.get_bounding_box();scale=width/(box.max.x-box.min.x);pos=u.Vector(center[0]-(box.min.x+box.max.x)*.5*scale,center[1]-(box.min.y+box.max.y)*.5*scale,z-box.min.z*scale)
   monitor=label.startswith('OfficeMonitor')
   if monitor:pos=u.Vector(center[0]+(box.min.x+box.max.x)*.5*scale,center[1]+(box.min.y+box.max.y)*.5*scale,z-box.min.z*scale)
   a=actors.get(label) or E.spawn_actor_from_class(u.StaticMeshActor,pos);a.set_actor_label(label);a.set_actor_location(pos,False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=180 if monitor else 0,roll=0),False);a.set_actor_scale3d(u.Vector(scale,scale,scale));a.set_folder_path('NaturalOffice/WorkstationEquipment');a.static_mesh_component.set_static_mesh(mesh);a.static_mesh_component.set_collision_enabled(u.CollisionEnabled.NO_COLLISION)
   for i,m in enumerate(materials):a.static_mesh_component.set_material(i,m)
  for i,(x,y) in enumerate([(-385,-220),(-55,-220),(-385,180),(-55,180)],1):
   chair=actors['C1_RealMeshChair_%02d'%i];chair.set_actor_location(u.Vector(x+30,y+50,0),False,False)
   place('OfficeMonitor_%02d'%i,u.load_asset('/Game/Campus/Assets/furniture_kit/computerScreen'),(x+30,y-32),60,75.6,[case,screen])
   place('OfficeKeyboard_%02d'%i,u.load_asset('/Game/Campus/Assets/furniture_kit/computerKeyboard'),(x+30,y+3),42,75.6,[case,keys])
   place('OfficeMouse_%02d'%i,u.load_asset('/Game/Campus/Assets/furniture_kit/computerMouse'),(x+60,y+3),6,75.6,[case])
   for a in E.get_all_level_actors():
    if a.get_actor_label().startswith('Working_DemoColleague_A%02d'%i):a.set_actor_location(u.Vector(x+30,y+50,3),False,False)
  # Align the actual seat target and all four proximity anchors with the finished desk geometry.
  bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g)
  for n in B.find_nodes(g):
   if n.get_name()=='K2Node_CallFunction_183':n.find_input_pin('NewLocation').set_pin_value('-355,-170,92')
   title=n.get_node_title().lower().replace(' ','')
   if 'makevector' in title:
    try:
     y=n.find_input_pin('Y');val=float(y.get_pin_value())
     if val in [-125,275]:y.set_pin_value(str(val-45))
    except:pass
  B.compile_blueprint(bp);assert not ed.list_nodes_with_errors();u.EditorAssetLibrary.save_loaded_asset(bp);u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True;r['chair_y']=[-170,230];r['equipment']='Kenney Furniture Kit CC0, dimensions and neutral materials adapted'
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'workstation-fit.json').write_text(json.dumps(r,indent=2))
fit_workstations()
