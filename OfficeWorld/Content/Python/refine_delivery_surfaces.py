import unreal as u,json,pathlib,traceback
def refine_delivery_surfaces():
 r={}
 try:
  E=u.get_editor_subsystem(u.EditorActorSubsystem);A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;assert u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'Stop PIE first'
  def scalar(m,value,prop):
   n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=value;ML.connect_material_property(n,'',prop)
  p='/Game/NaturalOffice/Materials/M_FloorMeasured';m=u.load_asset(p) if u.EditorAssetLibrary.does_asset_exist(p) else A.create_asset('M_FloorMeasured','/Game/NaturalOffice/Materials',u.Material,u.MaterialFactoryNew());ML.delete_all_material_expressions(m)
  pos=ML.create_material_expression(m,u.MaterialExpressionWorldPosition);mask=ML.create_material_expression(m,u.MaterialExpressionComponentMask)
  for key,value in [('r',True),('g',True),('b',False),('a',False)]:mask.set_editor_property(key,value)
  assert ML.connect_material_expressions(pos,'',mask,'')
  uv=ML.create_material_expression(m,u.MaterialExpressionMultiply);uv.set_editor_property('const_b',1.0/170.0);assert ML.connect_material_expressions(mask,'',uv,'A')
  diff=ML.create_material_expression(m,u.MaterialExpressionTextureSample);diff.texture=u.load_asset('/Game/RealisticSample/Textures/laminate_floor_02_diff_4k');assert ML.connect_material_expressions(uv,'',diff,'UVs');ML.connect_material_property(diff,'RGB',u.MaterialProperty.MP_BASE_COLOR)
  scalar(m,.78,u.MaterialProperty.MP_ROUGHNESS);scalar(m,.18,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
  for name in ['M_Plant01_leaves','M_potted_plant_02_leaves']:
   leaf=u.load_asset('/Game/FinishedOffice/Materials/'+name);base=ML.get_material_property_input_node(leaf,u.MaterialProperty.MP_BASE_COLOR)
   if isinstance(base,u.MaterialExpressionTextureSample):
    base.texture.set_editor_property('srgb',True);tint=ML.create_material_expression(leaf,u.MaterialExpressionMultiply);tint.set_editor_property('const_b',.65);ML.connect_material_expressions(base,'RGB',tint,'A');ML.connect_material_property(tint,'',u.MaterialProperty.MP_BASE_COLOR);u.EditorAssetLibrary.save_loaded_asset(base.texture)
   normal=ML.get_material_property_input_node(leaf,u.MaterialProperty.MP_NORMAL)
   if isinstance(normal,u.MaterialExpressionTextureSample):normal.texture.set_editor_property('flip_green_channel',True);u.EditorAssetLibrary.save_loaded_asset(normal.texture)
   scalar(leaf,.85,u.MaterialProperty.MP_ROUGHNESS);scalar(leaf,.1,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(leaf);u.EditorAssetLibrary.save_loaded_asset(leaf)
  for a in E.get_all_level_actors():
   if a.get_actor_label()=='Architecture':
    comp=a.static_mesh_component
    for i,s in enumerate(comp.static_mesh.static_materials):
     if str(s.material_slot_name).split('.')[0]=='Oak':comp.set_material(i,m)
   if isinstance(a,u.DirectionalLight):a.light_component.set_editor_property('intensity',.35);a.light_component.set_editor_property('light_source_angle',12.0)
   if isinstance(a,u.RectLight):
    c=a.light_component;window=a.get_actor_label()=='WindowLight';c.set_editor_property('intensity',4500.0 if window else 1400.0);c.set_editor_property('temperature',5600.0 if window else 3500.0)
   if isinstance(a,u.PostProcessVolume):
    s=a.settings;s.set_editor_property('auto_exposure_bias',-6.0);s.set_editor_property('override_motion_blur_amount',True);s.set_editor_property('motion_blur_amount',0.0);a.settings=s
  u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True;r['floor_mapping']='world XY / 170 cm (Poly Haven physical tile)';r['lighting']='reduced direct sunlight and window peak, raised interior fill; visual check required'
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'delivery-surfaces.json').write_text(json.dumps(r,indent=2))
refine_delivery_surfaces()
