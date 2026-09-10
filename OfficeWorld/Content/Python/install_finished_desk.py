import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();src=root.parent/'AssetSources/Realistic/Finished/Converted';base='/Game/FinishedOffice'
A=u.AssetToolsHelpers.get_asset_tools();ML=u.MaterialEditingLibrary;E=u.get_editor_subsystem(u.EditorActorSubsystem);report={}
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert 'OfficeNatural_A' in world.get_path_name()
 m=u.load_asset(base+'/Materials/M_D1_Authored')
 if m:ML.delete_all_material_expressions(m)
 else:m=A.create_asset('M_D1_Authored',base+'/Materials',u.Material,u.MaterialFactoryNew())
 for name,prop in [('BaseColor',u.MaterialProperty.MP_BASE_COLOR),('Roughness',u.MaterialProperty.MP_ROUGHNESS)]:
  task=u.AssetImportTask();task.filename=str(src/('D1_'+name+'.png'));task.destination_path=base+'/Textures';task.automated=True;task.save=True;task.replace_existing=True;A.import_asset_tasks([task]);tex=u.load_asset(task.imported_object_paths[0])
  if name=='Roughness':tex.set_editor_property('srgb',False)
  n=ML.create_material_expression(m,u.MaterialExpressionTextureSample);n.texture=tex;n.sampler_type=u.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR if name=='Roughness' else u.MaterialSamplerType.SAMPLERTYPE_COLOR;ML.connect_material_property(n,'R' if name=='Roughness' else 'RGB',prop);u.EditorAssetLibrary.save_loaded_asset(tex)
 ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 options=u.FbxImportUI();options.import_mesh=True;options.import_materials=False;options.import_textures=False;options.import_as_skeletal=False;options.mesh_type_to_import=u.FBXImportType.FBXIT_STATIC_MESH;options.static_mesh_import_data.combine_meshes=True
 t=u.AssetImportTask();t.filename=str(src/'D1_OfficeDesk.fbx');t.destination_path=base+'/Meshes';t.destination_name='SM_D1_OfficeDesk';t.automated=True;t.save=True;t.replace_existing=True;t.factory=u.FbxFactory();t.options=options;A.import_asset_tasks([t]);mesh=next(u.load_asset(p) for p in t.imported_object_paths if isinstance(u.load_asset(p),u.StaticMesh))
 for i in range(len(mesh.static_materials)):mesh.set_material(i,m)
 u.EditorAssetLibrary.save_loaded_asset(mesh)
 actor=next((a for a in E.get_all_level_actors() if a.get_actor_label()=='D1_RealWoodDesk_01'),None)
 if not actor:actor=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(-120,-50,0));actor.set_actor_label('D1_RealWoodDesk_01')
 actor.static_mesh_component.set_static_mesh(mesh);actor.set_folder_path('NaturalOffice/FinishedFurniture')
 u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-340,-285,160),u.Rotator(pitch=-13,yaw=47,roll=0));E.clear_actor_selection_set();u.EditorLevelLibrary.editor_invalidate_viewports();u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 report={'map':world.get_path_name(),'actor':actor.get_actor_label(),'mesh':mesh.get_path_name(),'saved':True}
except Exception:report['error']=traceback.format_exc()
(root/'Saved/finished-desk-install.json').write_text(json.dumps(report,indent=2));print(report)
