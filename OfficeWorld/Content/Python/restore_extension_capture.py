import unreal as u,json,pathlib
v=json.loads(pathlib.Path(u.Paths.project_saved_dir(),'extension-capture-setting.json').read_text())['r.AllowOcclusionQueries']
u.SystemLibrary.execute_console_command(u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'r.AllowOcclusionQueries '+str(v))
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if str(a.get_folder_path()).startswith('OfficeExtension') and isinstance(a,u.StaticMeshActor):a.static_mesh_component.set_editor_property('disallow_nanite',False)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
