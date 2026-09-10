import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();src=root.parent/'AssetSources/Realistic/Finished';base='/Game/FinishedOffice';A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;E=u.get_editor_subsystem(u.EditorActorSubsystem);report={}
def mat(asset,part=''):
 name='M_'+asset+('_'+part if part else '');m=u.load_asset(base+'/Materials/'+name)
 if m:return m
 m=A.create_asset(name,base+'/Materials',u.Material,u.MaterialFactoryNew());prefix=asset+('_'+part if part else '')
 for kind,prop in [('diff',u.MaterialProperty.MP_BASE_COLOR),('rough',u.MaterialProperty.MP_ROUGHNESS),('metal',u.MaterialProperty.MP_METALLIC),('nor_dx',u.MaterialProperty.MP_NORMAL),('alpha',u.MaterialProperty.MP_OPACITY_MASK)]:
  file=next((src/asset/'textures'/(prefix+'_'+kind+'_2k'+ext) for ext in ['.png','.jpg'] if (src/asset/'textures'/(prefix+'_'+kind+'_2k'+ext)).exists()),None)
  flip=False
  if not file and kind=='nor_dx':
   file=src/asset/'textures'/(prefix+'_nor_gl_2k.png');flip=True
  if not file or not file.exists():continue
  tex=u.load_asset(base+'/Textures/'+file.stem)
  if not tex:
   t=u.AssetImportTask();t.filename=str(file);t.destination_path=base+'/Textures';t.automated=True;t.save=True;A.import_asset_tasks([t]);tex=u.load_asset(t.imported_object_paths[0])
  if kind!='diff':tex.set_editor_property('srgb',False)
  if kind=='nor_dx':tex.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);tex.set_editor_property('flip_green_channel',flip)
  n=ML.create_material_expression(m,u.MaterialExpressionTextureSample);n.texture=tex;n.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL if kind=='nor_dx' else (u.MaterialSamplerType.SAMPLERTYPE_COLOR if kind=='diff' else u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR);ML.connect_material_property(n,'RGB' if kind in ['diff','nor_dx'] else 'R',prop);u.EditorAssetLibrary.save_loaded_asset(tex)
 if part=='leaves':m.set_editor_property('two_sided',True);m.set_editor_property('blend_mode',u.BlendMode.BLEND_MASKED)
 ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);return m
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert 'OfficeNatural_A' in world.get_path_name();created=[]
 for asset,short,offset,scale in [('desk_lamp_arm_01','DeskLamp',(-75,-20),.65),('binder_notebook','Notebook',(40,25),.65),('stationery_supplies','Stationery',(-48,-15),.65),('potted_plant_02','DeskPlant',(80,-30),.36)]:
  materials={part:mat(asset,part) for part in (['pot','leaves'] if asset=='potted_plant_02' else [''])}
  options=u.FbxImportUI();options.import_mesh=True;options.import_materials=False;options.import_textures=False;options.import_as_skeletal=False;options.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;options.static_mesh_import_data.combine_meshes=True
  t=u.AssetImportTask();t.filename=str(src/asset/(asset+'_UE.fbx'));t.destination_path=base+'/Meshes';t.destination_name='SM_'+asset;t.automated=True;t.save=True;t.replace_existing=True;t.factory=u.FbxFactory();t.options=options;A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
  for i,s in enumerate(mesh.static_materials):mesh.set_material(i,materials['leaves' if 'leaves' in str(s.material_slot_name) else ('pot' if asset=='potted_plant_02' else '')])
  u.EditorAssetLibrary.save_loaded_asset(mesh)
  for i,(x,y) in enumerate([(-40,-230),(315,-230),(-40,140),(315,140)],1):
   label=short+'_%02d'%i;a=next((a for a in E.get_all_level_actors() if a.get_actor_label()==label),None)
   if not a:a=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(x+offset[0],y+offset[1],75.6));a.set_actor_label(label)
   a.static_mesh_component.set_static_mesh(mesh);a.set_actor_scale3d(u.Vector(scale,scale,scale));a.set_folder_path('NaturalOffice/FinishedAccessories');created.append(label)
 u.EditorLevelLibrary.editor_invalidate_viewports();u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();report={'saved':True,'actors':created}
except Exception:report['error']=traceback.format_exc()
(root/'Saved/finished-accessories-install.json').write_text(json.dumps(report,indent=2));print(report)
