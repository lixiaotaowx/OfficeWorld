import unreal as u,pathlib,json
r=[]
for name in ['bench_press','multigym','dumbbells','pool_table','cue_rack','toilet']:
 m=u.load_asset('/Game/OfficeExtension/Meshes/SM_'+name);s=m.get_editor_property('nanite_settings');r.append({'name':name,'nanite':str(s)})
 s.set_editor_property('enabled',False);m.set_editor_property('nanite_settings',s);u.EditorAssetLibrary.save_loaded_asset(m,False)
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if str(a.get_folder_path()).startswith('OfficeExtension') and isinstance(a,u.StaticMeshActor):
  c=a.static_mesh_component;m=c.static_mesh;c.set_static_mesh(None);c.set_static_mesh(m)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();pathlib.Path(u.Paths.project_saved_dir(),'extension-mesh-stability.json').write_text(json.dumps(r,indent=2))
