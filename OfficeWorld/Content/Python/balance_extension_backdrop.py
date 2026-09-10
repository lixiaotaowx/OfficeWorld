import unreal as u
path='/Game/OfficeExtension/Materials/M_ExtensionCityPark';m=u.load_asset(path);ml=u.MaterialEditingLibrary
if not m:m=u.AssetToolsHelpers.get_asset_tools().create_asset('M_ExtensionCityPark','/Game/OfficeExtension/Materials',u.Material,u.MaterialFactoryNew())
ml.delete_all_material_expressions(m);m.set_editor_property('shading_model',u.MaterialShadingModel.MSM_UNLIT);m.set_editor_property('two_sided',True)
t=ml.create_material_expression(m,u.MaterialExpressionTextureSample);t.texture=u.load_asset('/Game/ExteriorBackdrop/Textures/T_CityParkPanorama');t.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_COLOR
n=ml.create_material_expression(m,u.MaterialExpressionMultiply);n.set_editor_property('const_b',100.0);ml.connect_material_expressions(t,'RGB',n,'A');ml.connect_material_property(n,'',u.MaterialProperty.MP_EMISSIVE_COLOR);ml.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m,False)
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if a.get_actor_label()=='Extension_CityParkBackdrop':a.static_mesh_component.set_material(0,m)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
