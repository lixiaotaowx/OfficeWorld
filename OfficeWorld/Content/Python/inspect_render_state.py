import unreal as u,pathlib,json
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();r={};mesh=u.load_asset('/Game/NaturalOffice/Meshes/SM_Architecture')
r['mesh_methods']=[n for n in dir(mesh) if 'mesh_description' in n or 'vertex' in n]
r['editor_game_methods']=[n for n in dir(u.EditorLevelLibrary) if 'game' in n or 'view' in n]
r['geometry_classes']=[n for n in dir(u) if 'GeometryScript' in n and ('Query' in n or 'Asset' in n)]
r['camera']=str(u.EditorLevelLibrary.get_level_viewport_camera_info())
r['textures']={}
for name in ['potted_plant_01_leaves_diff_2k','potted_plant_02_leaves_diff_2k']:
 t=u.load_asset('/Game/FinishedOffice/Textures/'+name);r['textures'][name]={'srgb':t.get_editor_property('srgb'),'compression':str(t.get_editor_property('compression_settings'))}
(root/'Saved/render-state-debug.json').write_text(json.dumps(r,indent=2))
