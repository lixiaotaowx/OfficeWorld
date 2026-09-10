import unreal as u,pathlib,json
r=json.loads(pathlib.Path(u.Paths.project_saved_dir(),'character-cache-restart-preflight.json').read_text(encoding='utf-8'))
assert r.get('saved') and r.get('map_saved') and not r.get('other_dirty') and not r.get('error')
assert not u.EditorLevelLibrary.get_pie_worlds(False)
assert not list(u.EditorLoadingAndSavingUtils.get_dirty_content_packages())
assert not list(u.EditorLoadingAndSavingUtils.get_dirty_map_packages())
u.SystemLibrary.execute_console_command(u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'CLOSE_SLATE_MAINFRAME')
