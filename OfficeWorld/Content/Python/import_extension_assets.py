"""Import only new extension assets. Run via background bridge; no map writes."""
import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();src=root.parent/'AssetSources/Realistic';base='/Game/OfficeExtension';A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;report={}
def save(o):assert u.EditorAssetLibrary.save_loaded_asset(o,False)
def texture(path,name,kind):
 t=u.load_asset(base+'/Textures/'+name)
 if not t:
  task=u.AssetImportTask();task.filename=str(path);task.destination_path=base+'/Textures';task.destination_name=name;task.automated=True;task.save=True
  try:A.import_asset_tasks([task])
  except RuntimeError as e:
   if not u.load_asset(base+'/Textures/'+name):raise
   report.setdefault('import_log_warnings',[]).append(str(e))
  t=u.load_asset(base+'/Textures/'+name);assert t
 t.set_editor_property('srgb',kind in ['BaseColor','Emissive'])
 t.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP if kind=='Normal' else (u.TextureCompressionSettings.TC_BC7 if kind in ['BaseColor','Emissive'] else u.TextureCompressionSettings.TC_MASKS));save(t);return t
def material(name,maps=None,color=(.1,.1,.1),metal=0,rough=.6,foliage=False):
 m=u.load_asset(base+'/Materials/M_'+name)
 if m:ML.delete_all_material_expressions(m)
 else:m=A.create_asset('M_'+name,base+'/Materials',u.Material,u.MaterialFactoryNew())
 def constant(v,prop):
  n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.set_editor_property('r',v);assert ML.connect_material_property(n,'',prop)
 n=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);n.set_editor_property('constant',u.LinearColor(*color));ML.connect_material_property(n,'',u.MaterialProperty.MP_BASE_COLOR)
 constant(rough,u.MaterialProperty.MP_ROUGHNESS);constant(metal,u.MaterialProperty.MP_METALLIC)
 properties={'BaseColor':u.MaterialProperty.MP_BASE_COLOR,'Roughness':u.MaterialProperty.MP_ROUGHNESS,'Metallic':u.MaterialProperty.MP_METALLIC,'Emissive':u.MaterialProperty.MP_EMISSIVE_COLOR,'Normal':u.MaterialProperty.MP_NORMAL,'Alpha':u.MaterialProperty.MP_OPACITY_MASK}
 for kind,path in (maps or {}).items():
  tex=texture(path,'T_'+name+'_'+kind,kind);n=ML.create_material_expression(m,u.MaterialExpressionTextureSample);n.texture=tex;n.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL if kind=='Normal' else (u.MaterialSamplerType.SAMPLERTYPE_COLOR if kind in ['BaseColor','Emissive'] else u.MaterialSamplerType.SAMPLERTYPE_MASKS);ML.connect_material_property(n,'RGB' if kind in ['BaseColor','Emissive','Normal'] else 'R',properties[kind])
 if foliage:m.set_editor_property('two_sided',True);m.set_editor_property('blend_mode',u.BlendMode.BLEND_MASKED)
 ML.recompile_material(m);save(m);return m
def mesh(name,path,materials,complex_collision=True):
 o=u.load_asset(base+'/Meshes/SM_'+name)
 if not o:
  opt=u.FbxImportUI();opt.import_mesh=True;opt.import_materials=False;opt.import_textures=False;opt.import_as_skeletal=False;opt.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;opt.static_mesh_import_data.combine_meshes=True
  t=u.AssetImportTask();t.filename=str(path);t.destination_path=base+'/Meshes';t.destination_name='SM_'+name;t.automated=True;t.save=True;t.options=opt;t.factory=u.FbxFactory()
  try:A.import_asset_tasks([t])
  except RuntimeError as e:
   if not u.load_asset(base+'/Meshes/SM_'+name):raise
   report.setdefault('import_log_warnings',[]).append(str(e))
  o=u.load_asset(base+'/Meshes/SM_'+name);assert isinstance(o,u.StaticMesh)
 for i,slot in enumerate(o.static_materials):o.set_material(i,materials.get(str(slot.material_slot_name),next(iter(materials.values()))))
 if complex_collision:o.get_editor_property('body_setup').set_editor_property('collision_trace_flag',u.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
 save(o);report[name]={'path':o.get_path_name(),'slots':[str(s.material_slot_name) for s in o.static_materials]};return o
try:
 for name in ['pool_table','cue_rack','toilet','multigym','dumbbells','bench_press']:
  d=src/'Finished/Extension'/name;maps={k:d/(name+'_'+k+'.png') for k in ['BaseColor','Roughness','Metallic','Emissive']};m=material(name,maps);mesh(name,d/(name+'_UE.fbx'),{'all':m});print('Imported',name)
 # Original UVs and alpha remain intact for Poly Haven plants; no atlas bake.
 for name in ['potted_plant_04','calathea_orbifolia_01','decorative_book_set_01','ceramic_vase_01']:
  d=src/'Finished'/name;info=json.loads((d/'conversion.json').read_text());mats={}
  for slot in info['materials']:
   maps={}
   for suffix,kind in [('diff','BaseColor'),('rough','Roughness'),('metal','Metallic'),('nor_dx','Normal'),('alpha','Alpha')]:
    candidates=sorted((d/'textures').glob(slot+'_'+suffix+'_2k.*'),key=lambda p:p.suffix!='.png')
    if candidates:maps[kind]=candidates[0]
   # Book cover variants share geometric-page and roughness maps; retain unique cover.
   if name=='decorative_book_set_01' and not maps.get('BaseColor'):
    candidates=list((d/'textures').glob(slot+'_2k.*'))
    if candidates:maps['BaseColor']=candidates[0]
   m=material(slot,maps,foliage=name=='calathea_orbifolia_01')
   if maps.get('Normal'):
    t=u.load_asset(base+'/Textures/T_'+slot+'_Normal');t.set_editor_property('flip_green_channel',False);save(t)
   mats[slot]=m
  mesh(name,d/(name+'_UE.fbx'),mats,False)
 mats={
 'Sage':u.load_asset('/Game/NaturalOffice/Materials/M_SagePlaster'),'Sand':u.load_asset('/Game/NaturalOffice/Materials/M_SandPlaster'),
 'Wood':u.load_asset('/Game/NaturalOffice/Materials/M_NaturalWood'),'Black':u.load_asset('/Game/RealisticSample/Materials/M_Charcoal'),
 'White':u.load_asset('/Game/RealisticSample/Materials/M_White'),'Floor':u.load_asset('/Game/NaturalOffice/Materials/M_FloorMeasured'),
 'Glass':u.load_asset('/Game/RealisticSample/Materials/M_Glass'),'Light':u.load_asset('/Game/RealisticSample/Materials/M_Light'),
 'Metal':material('BrushedMetal',color=(.3,.32,.33),metal=.8,rough=.28),'Tile':material('QuietStone',color=(.3,.32,.29),rough=.62),'Rubber':material('FitnessRubber',color=(.025,.032,.028),rough=.88)}
 for key,val in list(mats.items()):
  if not val:mats[key]=material('Fallback'+key,color=(.25,.3,.22))
 for n,c in [('BallYellow',(1,.65,.01)),('BallBlue',(.015,.08,.6)),('BallRed',(.65,.015,.02)),('BallPurple',(.24,.03,.45)),('BallOrange',(.95,.2,.01)),('BallGreen',(.02,.25,.08)),('BallMaroon',(.27,.01,.04))]:mats[n]=material(n,color=c,rough=.2)
 for name in ['Shell','Glazing','Joinery','Planter','Balls']:mesh(name,src/'ExtensionArchitecture'/(name+'.fbx'),mats,name!='Glazing')
 report['saved']=True
except Exception:report['error']=traceback.format_exc()
(root/'Saved/extension-import.json').write_text(json.dumps(report,indent=2));print(report)
