import unreal as u, os, json, traceback
root=os.path.abspath(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
src=os.path.join(os.path.dirname(root),'AssetSources','Realistic')
base='/Game/NaturalOffice'; report={}
A=u.AssetToolsHelpers.get_asset_tools(); ML=u.MaterialEditingLibrary
E=u.get_editor_subsystem(u.EditorActorSubsystem); L=u.get_editor_subsystem(u.LevelEditorSubsystem)
def tex(asset,suffix):
 name=asset+'_'+suffix+'_4k'; path=base+'/Textures/'+name
 obj=u.load_asset(path)
 if not obj:
  t=u.AssetImportTask(); t.filename=os.path.join(src,'Textures',name+'.jpg'); t.destination_path=base+'/Textures'; t.automated=True;t.save=True
  A.import_asset_tasks([t]);obj=u.load_asset(t.imported_object_paths[0])
 if suffix=='nor_dx':obj.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);obj.set_editor_property('srgb',False)
 if suffix=='rough':obj.set_editor_property('srgb',False)
 return obj
def pbr(name,asset,color,scale):
 p=base+'/Materials/M_'+name;m=u.load_asset(p)
 if m:return m
 m=A.create_asset('M_'+name,base+'/Materials',u.Material,u.MaterialFactoryNew())
 coord=ML.create_material_expression(m,u.MaterialExpressionTextureCoordinate);coord.set_editor_property('u_tiling',scale);coord.set_editor_property('v_tiling',scale)
 for suffix,prop in [('diff',u.MaterialProperty.MP_BASE_COLOR),('nor_dx',u.MaterialProperty.MP_NORMAL),('rough',u.MaterialProperty.MP_ROUGHNESS)]:
  sample=ML.create_material_expression(m,u.MaterialExpressionTextureSample);sample.set_editor_property('texture',tex(asset,suffix))
  sample.set_editor_property('sampler_type',u.MaterialSamplerType.SAMPLERTYPE_NORMAL if suffix=='nor_dx' else (u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR if suffix=='rough' else u.MaterialSamplerType.SAMPLERTYPE_COLOR))
  ML.connect_material_expressions(coord,'',sample,'Coordinates')
  if suffix=='diff':
   tint=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);tint.set_editor_property('constant',u.LinearColor(*color,1))
   mul=ML.create_material_expression(m,u.MaterialExpressionMultiply);ML.connect_material_expressions(sample,'RGB',mul,'A');ML.connect_material_expressions(tint,'',mul,'B');ML.connect_material_property(mul,'',prop)
  else:ML.connect_material_property(sample,'RGB' if suffix=='nor_dx' else 'R',prop)
 ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);return m
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
 assert 'OfficeRealisticSample' in world.get_path_name() or 'OfficeNatural_A' in world.get_path_name(),world.get_path_name()
 L.save_current_level()
 if 'OfficeRealisticSample' in world.get_path_name():
  assert u.EditorLoadingAndSavingUtils.save_map(world,'/Game/Maps/OfficeNatural_A')
 mats={k:u.load_asset('/Game/RealisticSample/Materials/M_'+k) for k in ['Oak','Charcoal','White','Glass','Light','Metal']}
 mats['SagePlaster']=pbr('SagePlaster','beige_wall_001',(.39,.48,.34),3)
 mats['SandPlaster']=pbr('SandPlaster','beige_wall_001',(.85,.80,.68),3)
 mats['NaturalWood']=pbr('NaturalWood','plywood',(.8,.72,.59),4)
 report['imports']={}
 for name in ['Architecture','Glazing']:
  options=u.FbxImportUI();options.import_mesh=True;options.import_materials=False;options.import_textures=False;options.import_as_skeletal=False;options.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH
  options.static_mesh_import_data.combine_meshes=True;options.static_mesh_import_data.auto_generate_collision=False
  t=u.AssetImportTask();t.filename=os.path.join(src,'NaturalArchitecture',name+'.fbx');t.destination_path=base+'/Meshes';t.destination_name='SM_'+name;t.automated=True;t.save=True;t.replace_existing=True;t.factory=u.FbxFactory();t.options=options
  A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
  mesh.get_editor_property('body_setup').set_editor_property('collision_trace_flag',u.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
  actor=next((a for a in E.get_all_level_actors() if a.get_actor_label()==name),None)
  assert actor,name
  comp=actor.static_mesh_component;comp.set_static_mesh(mesh)
  for i,s in enumerate(mesh.static_materials):
   key=str(s.material_slot_name).split('.')[0]
   if key in mats:comp.set_material(i,mats[key]);mesh.set_material(i,mats[key])
  actor.set_folder_path('NaturalOffice/Architecture');u.EditorAssetLibrary.save_loaded_asset(mesh)
  report['imports'][name]=[str(s.material_slot_name) for s in mesh.static_materials]
 # Old furnishings stay explicitly named as temporary, pending the licensed assets.
 for a in E.get_all_level_actors():
  if a.get_actor_label() in ['Furniture','Plants']:a.set_folder_path('PendingReplacement/PrototypeOnly')
  if isinstance(a,u.PostProcessVolume):
   s=a.settings;s.set_editor_property('auto_exposure_bias',-4.6);a.settings=s
 u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-470,-340,165),u.Rotator(pitch=-3,yaw=48,roll=0))
 E.clear_actor_selection_set();L.save_current_level()
 u.EditorAssetLibrary.save_directory(base,only_if_is_dirty=True,recursive=True)
 u.EditorAssetLibrary.save_asset('/Game/MetaHumans/Office/OfficePerson01')
 report['map']=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()
 report['metahuman_created']=u.EditorAssetLibrary.does_asset_exist('/Game/MetaHumans/Office/OfficePerson01')
 report['finished_furniture_installed']=False;report['finished_plants_installed']=False
except Exception:report['error']=traceback.format_exc()
with open(os.path.join(root,'Saved','natural-architecture-report.json'),'w',encoding='utf-8') as f:json.dump(report,f,indent=2)
print(report)
