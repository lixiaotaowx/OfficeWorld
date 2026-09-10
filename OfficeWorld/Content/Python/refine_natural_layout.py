import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();E=u.get_editor_subsystem(u.EditorActorSubsystem);ML=u.MaterialEditingLibrary;A=u.AssetToolsHelpers.get_asset_tools();report={}
def constant(m,val,prop):
 n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=val;ML.connect_material_property(n,'',prop)
def plaster(name,color):
 m=u.load_asset('/Game/NaturalOffice/Materials/M_'+name);ML.delete_all_material_expressions(m)
 c=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);c.constant=u.LinearColor(*color,1);ML.connect_material_property(c,'',u.MaterialProperty.MP_BASE_COLOR)
 uv=ML.create_material_expression(m,u.MaterialExpressionTextureCoordinate);uv.u_tiling=32;uv.v_tiling=32
 t=ML.create_material_expression(m,u.MaterialExpressionTextureSample);t.texture=u.load_asset('/Game/NaturalOffice/Textures/beige_wall_001_nor_dx_4k');t.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_NORMAL;ML.connect_material_expressions(uv,'',t,'Coordinates')
 flat=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);flat.constant=u.LinearColor(0,0,1,1)
 lerp=ML.create_material_expression(m,u.MaterialExpressionLinearInterpolate);lerp.set_editor_property('const_alpha',.12);ML.connect_material_expressions(flat,'',lerp,'A');ML.connect_material_expressions(t,'RGB',lerp,'B');ML.connect_material_property(lerp,'',u.MaterialProperty.MP_NORMAL)
 constant(m,.85,u.MaterialProperty.MP_ROUGHNESS);constant(m,.25,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert 'OfficeNatural_A' in world.get_path_name()
 plaster('SagePlaster',(.21,.25,.18));plaster('SandPlaster',(.52,.49,.42))
 for path,rough in [('/Game/FinishedOffice/Materials/M_D1_Authored',.52),('/Game/RealisticSample/Materials/M_Oak',.62)]:
  m=u.load_asset(path)
  if m:constant(m,rough,u.MaterialProperty.MP_ROUGHNESS);constant(m,.25,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 desk=u.load_asset('/Game/FinishedOffice/Meshes/SM_D1_OfficeDesk');chair=u.load_asset('/Game/FinishedOffice/Meshes/SM_C1_OrthopedicChair');assert desk and chair
 actors={a.get_actor_label():a for a in E.get_all_level_actors()};stations=[]
 for i,(x,y) in enumerate([(-385,-220),(-55,-220),(-385,180),(-55,180)],1):
  for label,mesh,location,yaw in [('D1_RealWoodDesk_%02d'%i,desk,(x,y,0),0),('C1_RealMeshChair_%02d'%i,chair,(x+30,y+95,0),0)]:
   a=actors.get(label)
   if not a:a=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(*location));a.set_actor_label(label)
   a.static_mesh_component.set_static_mesh(mesh);a.set_actor_location(u.Vector(*location),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=yaw,roll=0),False);a.set_folder_path('NaturalOffice/FinishedFurniture')
   stations.append({'label':label,'location':location,'yaw':yaw})
  for short,offset in [('DeskLamp',(-75,-20)),('Notebook',(40,25)),('Stationery',(-48,-15)),('DeskPlant',(80,-30))]:
   a=actors.get(short+'_%02d'%i)
   if a:a.set_actor_location(u.Vector(x+offset[0],y+offset[1],75.6),False,False)
 for a in E.get_all_level_actors():
  if a.get_actor_label() in ['Furniture','Plants']:a.set_is_temporarily_hidden_in_editor(True);a.set_actor_hidden_in_game(True)
  if isinstance(a,u.PostProcessVolume):
   s=a.settings;s.set_editor_property('override_auto_exposure_bias',True);s.set_editor_property('auto_exposure_bias',-6.2);a.settings=s
 for i,(x,y) in enumerate([(-540,-340),(-540,320),(500,-330)],1):
  a=actors.get('RealPlant01_%02d'%i)
  if a:a.set_actor_location(u.Vector(x,y,0),False,False)
 E.clear_actor_selection_set();u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-530,365,170),u.Rotator(pitch=-7,yaw=-38,roll=0));u.EditorLevelLibrary.editor_invalidate_viewports();u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 report={'saved':True,'map':world.get_path_name(),'stations':stations,'plaster_normal_strength':.12,'plaster_uv_tiling':32,'exposure_bias':-5.4}
except Exception:report['error']=traceback.format_exc()
(root/'Saved/natural-layout-refinement.json').write_text(json.dumps(report,indent=2));print(report)
