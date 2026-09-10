import unreal as u
assert not u.EditorLevelLibrary.get_pie_worlds(False)
s=u.get_editor_subsystem(u.LevelEditorSubsystem)
assert s.save_current_level()
assert s.load_level('/Game/Maps/OfficeNatural_A')
