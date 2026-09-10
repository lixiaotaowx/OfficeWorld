import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
def install_delivery_shell():
 r={}
 try:
  E=u.get_editor_subsystem(u.EditorActorSubsystem);A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert world,'Stop PIE first';root=pathlib.Path(u.Paths.project_dir()).resolve().parent
  mats={n:u.load_asset('/Game/RealisticSample/Materials/M_'+n) for n in ['Oak','Charcoal','White','Metal','Glass','Light']}
  mats.update({n:u.load_asset('/Game/NaturalOffice/Materials/M_'+n) for n in ['SagePlaster','SandPlaster','NaturalWood']});mats['Oak']=u.load_asset('/Game/NaturalOffice/Materials/M_FloorMeasured')
  for name,color,rough,metal in [('Porcelain',(.72,.75,.73),.24,0),('Stone',(.31,.32,.29),.85,0),('Asphalt',(.055,.06,.065),.95,0),('Grass',(.06,.13,.035),.95,0),('RoadMarking',(.64,.65,.59),.85,0)]:
   path='/Game/DeliveryAssets/Materials/M_'+name;m=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else A.create_asset('M_'+name,'/Game/DeliveryAssets/Materials',u.Material,u.MaterialFactoryNew());ML.delete_all_material_expressions(m)
   c=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);c.constant=u.LinearColor(*color,1);ML.connect_material_property(c,'',u.MaterialProperty.MP_BASE_COLOR)
   for val,prop in [(rough,u.MaterialProperty.MP_ROUGHNESS),(metal,u.MaterialProperty.MP_METALLIC)]:n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=val;ML.connect_material_property(n,'',prop)
   ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);mats[name]=m
  actors={a.get_actor_label():a for a in E.get_all_level_actors()};r['meshes']={}
  for name in ['Architecture','Glazing','MeetingJoinery','OfficeFacilities','OfficeExterior']:
   options=u.FbxImportUI();options.import_mesh=True;options.import_materials=False;options.import_textures=False;options.import_as_skeletal=False;options.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;options.static_mesh_import_data.combine_meshes=True;options.static_mesh_import_data.auto_generate_collision=False
   t=u.AssetImportTask();t.filename=str(root/'AssetSources/Realistic/DeliveryArchitecture'/(name+'.fbx'));t.destination_path='/Game/DeliveryAssets/Meshes';t.destination_name='SM_'+name;t.automated=True;t.save=True;t.replace_existing=True;t.factory=u.FbxFactory();t.options=options;A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
   mesh.get_editor_property('body_setup').set_editor_property('collision_trace_flag',u.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
   a=actors.get(name) or E.spawn_actor_from_class(u.StaticMeshActor,u.Vector());a.set_actor_label(name);a.static_mesh_component.set_static_mesh(mesh)
   for i,s in enumerate(mesh.static_materials):
    key=str(s.material_slot_name).split('.')[0]
    if key in mats:mesh.set_material(i,mats[key]);a.static_mesh_component.set_material(i,mats[key])
   a.set_folder_path('NaturalOffice/Architecture' if name in ['Architecture','Glazing'] else 'OfficeDelivery/'+name);u.EditorAssetLibrary.save_loaded_asset(mesh);r['meshes'][name]=str(mesh.get_bounding_box())
  chair=u.load_asset('/Game/FinishedOffice/Meshes/SM_C1_OrthopedicChair')
  for i,(x,y,yaw) in enumerate([(290,-210,90),(290,-310,90),(490,-210,-90),(490,-310,-90)],1):
   name='ConferenceChair_%02d'%i;a=actors.get(name) or E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(x,y,0));a.set_actor_label(name);a.static_mesh_component.set_static_mesh(chair);a.set_actor_location(u.Vector(x,y,0),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=yaw,roll=0),False);a.set_folder_path('OfficeDelivery/MeetingRoom')
  # Wide area sources produce softer window light and readable meeting/pantry interiors.
  window=actors.get('WindowLight')
  if window:
   window.set_actor_location(u.Vector(-570,0,170),False,False);window.set_actor_rotation(u.Rotator(pitch=0,yaw=0,roll=0),False);c=window.light_component;c.set_editor_property('source_width',760);c.set_editor_property('source_height',220);c.set_editor_property('intensity',6500)
  for name,loc,watts,width in [('MeetingAreaLight',(390,-260,265),2400,180),('PantryAreaLight',(490,145,270),1700,140),('RestroomAreaLight',(520,365,260),800,80),('OfficeSoftFill',(-220,30,270),1700,280)]:
   a=actors.get(name) or E.spawn_actor_from_class(u.RectLight,u.Vector(*loc));a.set_actor_label(name);a.set_actor_location(u.Vector(*loc),False,False);a.set_actor_rotation(u.Rotator(pitch=-90,yaw=0,roll=0),False);c=a.light_component;c.set_editor_property('intensity_units',u.LightUnits.LUMENS);c.set_editor_property('intensity',watts);c.set_editor_property('source_width',width);c.set_editor_property('source_height',65);c.set_editor_property('use_temperature',True);c.set_editor_property('temperature',3800 if name=='OfficeSoftFill' else 3400);a.set_folder_path('OfficeDelivery/Lighting')
  bp=u.load_asset('/Game/OfficeInteraction/BP_OfficeCharacter');u.get_default_object(bp.generated_class()).capsule_component.set_capsule_radius(30);B.compile_blueprint(bp);u.EditorAssetLibrary.save_loaded_asset(bp)
  E.clear_actor_selection_set();u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-490,330,160),u.Rotator(pitch=-7,yaw=-34,roll=0));u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'delivery-shell-install.json').write_text(json.dumps(r,indent=2))
install_delivery_shell()
