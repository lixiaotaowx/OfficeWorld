import unreal as u,json,os
world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
u.get_editor_subsystem(u.LevelEditorSubsystem).load_level('/Game/Maps/OfficeNatural_A')
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-470,-340,165),u.Rotator(pitch=-3,yaw=48,roll=0))
u.AutomationLibrary.take_high_res_screenshot(1600,900,os.path.join(u.Paths.project_saved_dir(),'natural-architecture.png'))
report={'world':u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name(),
'metahuman_methods':[n for n in dir(u.MetaHumanCharacterEditorSubsystem) if any(k in n for k in ['rig','assemble','preset','spawn'])],
'metahuman_loaded':str(u.load_asset('/Game/MetaHumans/Office/OfficePerson01'))}
with open(os.path.join(u.Paths.project_saved_dir(),'natural-inspect.json'),'w') as f:json.dump(report,f,indent=2)
