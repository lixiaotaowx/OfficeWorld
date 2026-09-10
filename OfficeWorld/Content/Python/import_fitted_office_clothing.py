import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.project_dir()).resolve().parent
job=json.loads((root/'OfficeWorld/Saved/independent-person-job.json').read_text(encoding='utf-8'));identity=job['id'];folder='/Game/OfficeInteraction/Clothing/'+identity;r={'id':identity}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 source=root/'AssetSources/Realistic/OfficePeople/Fitting'/identity
 fit=json.loads((source/'fitting.json').read_text());body=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Body/SKM_'+identity+'_BodyMesh');assert body
 opts=u.FbxImportUI();opts.import_mesh=True;opts.import_as_skeletal=True;opts.mesh_type_to_import=u.FBXImportType.FBXIT_SKELETAL_MESH;opts.automated_import_should_detect_type=False;opts.skeleton=body.skeleton
 opts.create_physics_asset=False;opts.import_materials=False;opts.import_textures=False;opts.import_animations=False
 opts.skeletal_mesh_import_data.set_editor_property('update_skeleton_reference_pose',False);opts.skeletal_mesh_import_data.set_editor_property('use_t0_as_ref_pose',False)
 task=u.AssetImportTask();task.filename=str(source/'Clothing.fbx');task.destination_path=folder;task.destination_name='SK_'+identity+'_OfficeClothing';task.automated=True;task.replace_existing=True;task.save=True;task.options=opts;task.factory=u.FbxFactory()
 u.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task]);r['imported']=list(task.imported_object_paths)
 meshes=[x for x in task.get_objects() if isinstance(x,u.SkeletalMesh)];assert meshes,r
 r['meshes']=[m.get_path_name() for m in meshes];r['skeletons']=[str(m.skeleton) for m in meshes]
 textures={}
 for garment in [fit['garment'],fit['shoes']]:
  textures[garment]={}
  for kind in ['diffuse','normal','ao']:
   path=root/'AssetSources/Realistic/OfficePeople/MakeHumanCC0/clothes'/garment/(garment+'_'+kind+'.png')
   if not path.exists():continue
   t=u.AssetImportTask();t.filename=str(path);t.destination_path=folder+'/Textures';t.automated=True;t.replace_existing=True;t.save=True
   u.AssetToolsHelpers.get_asset_tools().import_asset_tasks([t]);objects=list(t.get_objects());assert objects
   tex=objects[0]
   if kind=='normal':tex.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);tex.set_editor_property('srgb',False)
   elif kind=='ao':tex.set_editor_property('srgb',False)
   u.EditorAssetLibrary.save_loaded_asset(tex,False);textures[garment][kind]=tex
  matpath=folder+'/M_'+garment;mat=u.load_asset(matpath) if u.EditorAssetLibrary.does_asset_exist(matpath) else u.AssetToolsHelpers.get_asset_tools().create_asset('M_'+garment,folder,u.Material,u.MaterialFactoryNew())
  u.MaterialEditingLibrary.delete_all_material_expressions(mat)
  for kind,tex in textures[garment].items():
   node=u.MaterialEditingLibrary.create_material_expression(mat,u.MaterialExpressionTextureSample);node.texture=tex
   if kind=='normal':node.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL
   elif kind=='ao':node.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR
   prop={'diffuse':u.MaterialProperty.MP_BASE_COLOR,'normal':u.MaterialProperty.MP_NORMAL,'ao':u.MaterialProperty.MP_AMBIENT_OCCLUSION}[kind]
   u.MaterialEditingLibrary.connect_material_property(node,'RGB' if kind!='ao' else 'R',prop)
  rough=u.MaterialEditingLibrary.create_material_expression(mat,u.MaterialExpressionConstant);rough.r=.72;u.MaterialEditingLibrary.connect_material_property(rough,'',u.MaterialProperty.MP_ROUGHNESS)
  u.MaterialEditingLibrary.recompile_material(mat);assert u.EditorAssetLibrary.save_loaded_asset(mat,False)
  plain=None
  if identity=='Office_F01' and garment==fit['garment']:
   pp=folder+'/M_'+garment+'_Top';plain=u.load_asset(pp) if u.EditorAssetLibrary.does_asset_exist(pp) else u.AssetToolsHelpers.get_asset_tools().duplicate_asset('M_'+garment+'_Top',folder,mat)
   color=u.MaterialEditingLibrary.create_material_expression(plain,u.MaterialExpressionConstant3Vector);color.constant=u.LinearColor(.23,.37,.29,1)
   u.MaterialEditingLibrary.connect_material_property(color,'',u.MaterialProperty.MP_BASE_COLOR);u.MaterialEditingLibrary.recompile_material(plain);u.EditorAssetLibrary.save_loaded_asset(plain,False)
  for mesh in meshes:
   materials=list(mesh.materials)
   for index,slot in enumerate(materials):
    if garment.lower() in str(slot.material_slot_name).lower():slot.material_interface=plain if plain and str(slot.material_slot_name).lower().endswith('_top') else mat;materials[index]=slot
   mesh.set_editor_property('materials',materials);u.EditorAssetLibrary.save_loaded_asset(mesh,False)
 if True:
  original=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Clothing/'+identity+'_Outfits')
  parent=next(x.material_interface for x in original.materials if 'Shirt' in str(x.material_slot_name))
  ip=folder+'/MI_NativeSageShirt';mi=u.load_asset(ip) if u.EditorAssetLibrary.does_asset_exist(ip) else u.AssetToolsHelpers.get_asset_tools().duplicate_asset('MI_NativeSageShirt',folder,parent)
  color={'Office_F01':(.23,.37,.29,1),'Office_F02':(.52,.42,.32,1),'Office_M01_Aoi':(.075,.12,.20,1),'Office_M02':(.27,.28,.29,1)}[identity]
  for parameter in ['diffuse_color_1','diffuse_color_2','B_diffuse_color_1','C_color']:u.MaterialEditingLibrary.set_material_instance_vector_parameter_value(mi,parameter,u.LinearColor(*color))
  u.MaterialEditingLibrary.update_material_instance(mi);u.EditorAssetLibrary.save_loaded_asset(mi,False)
  for mesh in meshes:
   materials=list(mesh.materials)
   for slot in materials:
    if 'NativeShirt' in str(slot.material_slot_name):slot.material_interface=mi
   mesh.set_editor_property('materials',materials);u.EditorAssetLibrary.save_loaded_asset(mesh,False)
 r['status']='imported candidate; not installed or motion accepted'
 r['materials']={m.get_name():[{'slot':str(x.material_slot_name),'material':str(x.material_interface)} for x in m.materials] for m in meshes}
except Exception:r['error']=traceback.format_exc()
(root/('OfficeWorld/Saved/'+identity+'-clothing-import.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
