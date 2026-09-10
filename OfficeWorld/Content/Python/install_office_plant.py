import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();src=root.parent/'AssetSources/Realistic/Finished/Plant';base='/Game/FinishedOffice';A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;E=u.get_editor_subsystem(u.EditorActorSubsystem);report={}
def material(part):
 name='M_Plant01_'+part;m=u.load_asset(base+'/Materials/'+name)
 if m:return m
 m=A.create_asset(name,base+'/Materials',u.Material,u.MaterialFactoryNew())
 for kind,prop in [('diff',u.MaterialProperty.MP_BASE_COLOR),('rough',u.MaterialProperty.MP_ROUGHNESS),('nor_gl',u.MaterialProperty.MP_NORMAL),('alpha',u.MaterialProperty.MP_OPACITY_MASK)]:
  name='potted_plant_01_'+part+'_'+kind+'_2k';file=src/'textures'/(name+'.png')
  if not file.exists():continue
  task=u.AssetImportTask();task.filename=str(file);task.destination_path=base+'/Textures';task.automated=True;task.save=True;A.import_asset_tasks([task]);tex=u.load_asset(task.imported_object_paths[0])
  if kind!='diff':tex.set_editor_property('srgb',False)
  if kind=='nor_gl':tex.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);tex.set_editor_property('flip_green_channel',True)
  sample=ML.create_material_expression(m,u.MaterialExpressionTextureSample);sample.texture=tex;sample.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL if kind=='nor_gl' else (u.MaterialSamplerType.SAMPLERTYPE_COLOR if kind=='diff' else u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
  ML.connect_material_property(sample,'RGB' if kind in ['diff','nor_gl'] else 'R',prop);u.EditorAssetLibrary.save_loaded_asset(tex)
 if part=='leaves':
  m.set_editor_property('two_sided',True);m.set_editor_property('blend_mode',u.BlendMode.BLEND_MASKED);m.set_editor_property('opacity_mask_clip_value',.35)
 ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);return m
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert 'OfficeNatural_A' in world.get_path_name()
 mats={p:material(p) for p in ['pot','leaves']}
 options=u.FbxImportUI();options.import_mesh=True;options.import_materials=False;options.import_textures=False;options.import_as_skeletal=False;options.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;options.static_mesh_import_data.combine_meshes=True
 t=u.AssetImportTask();t.filename=str(src/'PottedPlant01.fbx');t.destination_path=base+'/Meshes';t.destination_name='SM_PottedPlant01';t.automated=True;t.save=True;t.factory=u.FbxFactory();t.options=options;A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
 for i,s in enumerate(mesh.static_materials):mesh.set_material(i,mats['leaves' if 'leaves' in str(s.material_slot_name) else 'pot'])
 u.EditorAssetLibrary.save_loaded_asset(mesh);created=[]
 for i,(x,y) in enumerate([(325,-500),(-360,-500),(-350,510)],1):
  label='RealPlant01_%02d'%i;a=next((a for a in E.get_all_level_actors() if a.get_actor_label()==label),None)
  if not a:a=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(x,y,0));a.set_actor_label(label)
  a.static_mesh_component.set_static_mesh(mesh);a.set_folder_path('NaturalOffice/FinishedPlants');created.append(label)
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();u.EditorLevelLibrary.editor_invalidate_viewports();report={'saved':True,'plants':created,'source':'Poly Haven / Rico Cilliers / CC0'}
except Exception:report['error']=traceback.format_exc()
(root/'Saved/finished-plant-install.json').write_text(json.dumps(report,indent=2));print(report)
