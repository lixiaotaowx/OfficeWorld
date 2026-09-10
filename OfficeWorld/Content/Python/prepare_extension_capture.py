import unreal as u,json,pathlib
v=u.SystemLibrary.get_console_variable_int_value('r.AllowOcclusionQueries');pathlib.Path(u.Paths.project_saved_dir(),'extension-capture-setting.json').write_text(json.dumps({'r.AllowOcclusionQueries':v}))
u.SystemLibrary.execute_console_command(u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'r.AllowOcclusionQueries 0')
