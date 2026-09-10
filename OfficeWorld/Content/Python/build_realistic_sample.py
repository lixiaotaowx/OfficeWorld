import unreal as u,os,json,traceback
ROOT=os.path.abspath(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
SRC=os.path.join(os.path.dirname(ROOT),'AssetSources','Realistic')
E=u.get_editor_subsystem(u.EditorActorSubsystem);L=u.get_editor_subsystem(u.LevelEditorSubsystem)
A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary
BASE='/Game/RealisticSample';MAP='/Game/Maps/OfficeRealisticSample'
report={};mats={}
def spawn(cls,name,xyz,rot=(0,0,0)):
 a=E.spawn_actor_from_class(cls,u.Vector(*xyz),u.Rotator(pitch=rot[0],yaw=rot[1],roll=rot[2]));a.set_actor_label(name);a.set_folder_path('RealisticSample');return a
def val(m,value,prop):
 n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.set_editor_property('r',value);ML.connect_material_property(n,'',prop);return n
def material(name,color,rough=.5,metal=0):
 m=A.create_asset('M_'+name,BASE+'/Materials',u.Material,u.MaterialFactoryNew())
 n=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);n.set_editor_property('constant',u.LinearColor(*color,1));ML.connect_material_property(n,'',u.MaterialProperty.MP_BASE_COLOR)
 val(m,rough,u.MaterialProperty.MP_ROUGHNESS);val(m,metal,u.MaterialProperty.MP_METALLIC)
 if name=='Glass':
  m.set_editor_property('blend_mode',u.BlendMode.BLEND_TRANSLUCENT);m.set_editor_property('two_sided',True)
  val(m,.08,u.MaterialProperty.MP_OPACITY)
 if name in ['Screen','Light']:
  mul=ML.create_material_expression(m,u.MaterialExpressionMultiply);ML.connect_material_expressions(n,'',mul,'A');mul.set_editor_property('const_b',1.2 if name=='Screen' else 6.0);ML.connect_material_property(mul,'',u.MaterialProperty.MP_EMISSIVE_COLOR)
 mats[name]=m;return m
def texture(filename,normal=False):
 t=u.AssetImportTask();t.filename=os.path.join(SRC,'Textures',filename);t.destination_path=BASE+'/Textures';t.automated=True;t.save=True
 A.import_asset_tasks([t]);obj=u.load_asset(t.imported_object_paths[0])
 if normal:obj.set_editor_property('compression_settings',u.TextureCompressionSettings.TC_NORMALMAP);obj.set_editor_property('srgb',False)
 elif 'rough' in filename:obj.set_editor_property('srgb',False)
 return obj
try:
 if u.EditorAssetLibrary.does_asset_exist(MAP):raise RuntimeError('Sample exists; refuse destructive rebuild')
 L.save_current_level();assert L.new_level(MAP)
 palette={'Paint':((.68,.67,.62),.83,0),'Oak':((.45,.3,.15),.5,0),'Charcoal':((.022,.027,.03),.4,.15),'Metal':((.18,.20,.21),.29,.85),'Fabric':((.09,.14,.13),.93,0),'White':((.75,.77,.75),.48,0),'Screen':((.026,.060,.083),.19,.05),'Glass':((.75,.85,.85),.06,0),'Light':((1,.88,.72),.5,0),'Leaf':((.035,.105,.032),.58,0),'Soil':((.037,.018,.008),1,0),'Carpet':((.13,.155,.14),.96,0),'Paper':((.72,.72,.66),.85,0)}
 for n,(c,r,metal) in palette.items():material(n,c,r,metal)
 wood=mats['Oak']
 pos=ML.create_material_expression(wood,u.MaterialExpressionWorldPosition)
 mask=ML.create_material_expression(wood,u.MaterialExpressionComponentMask);mask.set_editor_property('r',True);mask.set_editor_property('g',True);mask.set_editor_property('b',False);ML.connect_material_expressions(pos,'',mask,'Input')
 uv=ML.create_material_expression(wood,u.MaterialExpressionMultiply);uv.set_editor_property('const_b',1/170.0);ML.connect_material_expressions(mask,'',uv,'A')
 for suffix,prop in [('diff',u.MaterialProperty.MP_BASE_COLOR),('nor_dx',u.MaterialProperty.MP_NORMAL),('rough',u.MaterialProperty.MP_ROUGHNESS)]:
  tex=texture('laminate_floor_02_'+suffix+'_4k.jpg',suffix=='nor_dx')
  n=ML.create_material_expression(wood,u.MaterialExpressionTextureSample);n.set_editor_property('texture',tex)
  if suffix=='nor_dx':n.set_editor_property('sampler_type',u.MaterialSamplerType.SAMPLERTYPE_NORMAL)
  elif suffix=='rough':n.set_editor_property('sampler_type',u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
  ML.connect_material_expressions(uv,'',n,'Coordinates');ML.connect_material_property(n,'RGB' if suffix!='rough' else 'R',prop)
 for m in mats.values():ML.recompile_material(m)
 report['meshes']={}
 for name in ['Architecture','Furniture','Plants','Glazing']:
  opts=u.FbxImportUI();opts.import_mesh=True;opts.import_materials=False;opts.import_textures=False;opts.import_as_skeletal=False;opts.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH
  opts.static_mesh_import_data.combine_meshes=True;opts.static_mesh_import_data.auto_generate_collision=False
  t=u.AssetImportTask();t.filename=os.path.join(SRC,'Generated',name+'.fbx');t.destination_path=BASE+'/Meshes';t.destination_name='SM_'+name;t.automated=True;t.save=True;t.factory=u.FbxFactory();t.options=opts
  A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
  body=mesh.get_editor_property('body_setup');body.set_editor_property('collision_trace_flag',u.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
  a=spawn(u.StaticMeshActor,name,(0,0,0));c=a.static_mesh_component;c.set_static_mesh(mesh)
  slots=[]
  for i,s in enumerate(mesh.static_materials):
   key=str(s.material_slot_name).split('.')[0];slots.append(key)
   if key in mats:c.set_material(i,mats[key]);mesh.set_material(i,mats[key])
  center,extent=a.get_actor_bounds(False);report['meshes'][name]={'slots':slots,'center':str(center),'extent':str(extent)}
  u.EditorAssetLibrary.save_loaded_asset(mesh)
 # Daylit interior with physically softened window light and local ceiling lights.
 spawn(u.SkyAtmosphere,'Atmosphere',(0,0,0))
 sun=spawn(u.DirectionalLight,'Daylight',(0,0,1000),(-32,25,0));sun.light_component.set_editor_property('intensity',3.0);sun.light_component.set_editor_property('light_source_angle',3.0);sun.light_component.set_editor_property('atmosphere_sun_light',True)
 cls=u.load_class(None,'/Engine/EngineSky/BP_Sky_Sphere.BP_Sky_Sphere_C')
 if cls:spawn(cls,'SkyBackdrop',(0,0,0))
 sky=spawn(u.SkyLight,'AmbientSky',(0,0,800));sky.light_component.set_editor_property('intensity',.65);sky.light_component.recapture_sky()
 for x in [-300,0,300]:
  for y in [-240,180]:
   a=spawn(u.RectLight,'CeilingLight',(x,y,296),(-90,0,0));c=a.light_component;c.set_editor_property('intensity',1600.0);c.set_editor_property('source_width',118.0);c.set_editor_property('source_height',28.0);c.set_editor_property('attenuation_radius',700.0);c.set_editor_property('light_color',u.Color(255,242,219,255))
 # Window fill travels toward the interior, large emitter gives soft desk shadows.
 for y in [-260,80,330]:
  a=spawn(u.RectLight,'WindowLight',(-570,y,200),(0,0,0));c=a.light_component;c.set_editor_property('intensity',4500.0);c.set_editor_property('source_width',230.0);c.set_editor_property('source_height',210.0);c.set_editor_property('attenuation_radius',1300.0);c.set_editor_property('light_color',u.Color(223,237,255,255))
 pp=spawn(u.PostProcessVolume,'InteriorExposure',(0,0,0));pp.set_editor_property('unbound',True);s=pp.settings
 for k,v in [('override_auto_exposure_method',True),('auto_exposure_method',u.AutoExposureMethod.AEM_MANUAL),('override_auto_exposure_apply_physical_camera_exposure',True),('auto_exposure_apply_physical_camera_exposure',False),('override_auto_exposure_bias',True),('auto_exposure_bias',0.0)]:s.set_editor_property(k,v)
 pp.settings=s
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
 gm=u.load_class(None,'/Game/FirstPerson/Blueprints/BP_FirstPersonGameMode.BP_FirstPersonGameMode_C');world.get_world_settings().set_editor_property('default_game_mode',gm)
 spawn(u.PlayerStart,'OfficeSampleStart',(-410,-330,100),(0,52,0))
 E.clear_actor_selection_set();u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-410,-330,165),u.Rotator(pitch=-3,yaw=48,roll=0))
 u.EditorAssetLibrary.save_directory(BASE,only_if_is_dirty=True,recursive=True);L.save_current_level()
 report['status']='saved';report['map']=MAP
 report['metahuman']={'class_available':hasattr(u,'MetaHumanCharacter'),'editor_subsystem_available':hasattr(u,'MetaHumanCharacterEditorSubsystem')}
except Exception:report['status']='error';report['error']=traceback.format_exc();u.log_error(report['error'])
with open(os.path.join(ROOT,'Saved','realistic-sample-build.json'),'w') as f:json.dump(report,f,indent=2)
u.log('REALISTIC_SAMPLE '+json.dumps(report))
