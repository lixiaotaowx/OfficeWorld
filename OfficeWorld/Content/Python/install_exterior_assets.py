import unreal as u, pathlib, json, traceback

def install():
 r={}
 try:
  root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve(); A=u.AssetToolsHelpers.get_asset_tools(); ML=u.MaterialEditingLibrary; E=u.get_editor_subsystem(u.EditorActorSubsystem)
  assert 'OfficeNatural_A' in u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()
  actors={a.get_actor_label():a for a in E.get_all_level_actors()}
  for asset in ['tree_small_02','modular_street_seating']:
   src=root.parent/'AssetSources/Realistic/Finished'/asset; base='/Game/DeliveryAssets'; texs={}
   for f in (src/'textures').iterdir():
    t=u.AssetImportTask();t.filename=str(f);t.destination_path=base+'/Textures';t.automated=True;t.save=True;A.import_asset_tasks([t]);tex=u.load_asset(t.imported_object_paths[0]);kind='diff' if '_diff_' in f.name else ('nor_gl' if '_nor_gl_' in f.name else 'data')
    tex.set_editor_property('srgb',kind=='diff')
    if kind=='nor_gl':tex.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);tex.set_editor_property('flip_green_channel',True)
    u.EditorAssetLibrary.save_loaded_asset(tex);texs[f.stem]=tex
   mats={}
   for slot in json.loads((src/'conversion.json').read_text())['materials']:
    prefix=slot
    if slot=='tree_small_02_trunk':prefix='tree_small_02'
    if slot=='tree_small_02_branches':prefix='tree_small_02_branch'
    name='M_'+slot;m=u.load_asset(base+'/Materials/'+name) if u.EditorAssetLibrary.does_asset_exist(base+'/Materials/'+name) else A.create_asset(name,base+'/Materials',u.Material,u.MaterialFactoryNew());ML.delete_all_material_expressions(m)
    for kind,prop in [('diff',u.MaterialProperty.MP_BASE_COLOR),('rough',u.MaterialProperty.MP_ROUGHNESS),('nor_gl',u.MaterialProperty.MP_NORMAL),('alpha',u.MaterialProperty.MP_OPACITY_MASK),('metal',u.MaterialProperty.MP_METALLIC)]:
     tex=texs.get(prefix+'_'+kind+'_2k')
     if not tex:continue
     node=ML.create_material_expression(m,u.MaterialExpressionTextureSample);node.texture=tex;node.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL if kind=='nor_gl' else (u.MaterialSamplerType.SAMPLERTYPE_COLOR if kind=='diff' else u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR);ML.connect_material_property(node,'RGB' if kind in ['diff','nor_gl'] else 'R',prop)
    if 'leaves' in slot:m.set_editor_property('two_sided',True);m.set_editor_property('blend_mode',u.BlendMode.BLEND_MASKED);m.set_editor_property('opacity_mask_clip_value',.35)
    ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m);mats[slot]=m
   opt=u.FbxImportUI();opt.import_mesh=True;opt.import_materials=False;opt.import_textures=False;opt.import_as_skeletal=False;opt.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;opt.static_mesh_import_data.combine_meshes=True;opt.static_mesh_import_data.auto_generate_collision=False
   t=u.AssetImportTask();t.filename=str(src/(asset+'_UE.fbx'));t.destination_path=base+'/Meshes';t.destination_name='SM_'+asset;t.automated=True;t.save=True;t.factory=u.FbxFactory();t.options=opt;A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
   for i,s in enumerate(mesh.static_materials):mesh.set_material(i,mats[str(s.material_slot_name).split('.')[0]])
   if asset=='tree_small_02':
    settings=mesh.get_editor_property('nanite_settings');settings.set_editor_property('enabled',True);mesh.set_editor_property('nanite_settings',settings)
   else:mesh.get_editor_property('body_setup').set_editor_property('collision_trace_flag',u.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
   u.EditorAssetLibrary.save_loaded_asset(mesh)
   positions=[(-680,1880,0),(-650,2500,65),(-150,2500,150),(700,2510,210),(700,1890,300)] if asset=='tree_small_02' else [(-260,1790,0),(-260,2400,180)]
   for i,(x,y,yaw) in enumerate(positions):
    label='Park_'+asset+'_%02d'%i;a=actors.get(label) or E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(x,y,0));a.set_actor_label(label);a.static_mesh_component.set_static_mesh(mesh);a.set_actor_location(u.Vector(x,y,0),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=yaw,roll=0),False);a.set_folder_path('OfficeDelivery/FinishedParkAssets')
   r[asset]={'materials':list(mats),'instances':len(positions),'bounds':str(mesh.get_bounding_box())}
  u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(1500,2750,800),u.Rotator(pitch=-24,yaw=-137,roll=0));r['saved']=True
 except:r['error']=traceback.format_exc()
 (pathlib.Path(u.Paths.project_saved_dir())/'exterior-assets-install.json').write_text(json.dumps(r,indent=2))
install()
