import unreal as u
E=u.get_editor_subsystem(u.EditorActorSubsystem)
assert 'RefWoman_Studio_A01' in u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name()
p=next((a for a in E.get_all_level_actors() if a.get_actor_label()=='Studio_Exposure'),None)
if not p:p=E.spawn_actor_from_class(u.PostProcessVolume,u.Vector(0,0,0));p.set_actor_label('Studio_Exposure')
p.set_editor_property('unbound',True);s=p.settings
for k,v in [('override_auto_exposure_method',True),('auto_exposure_method',u.AutoExposureMethod.AEM_MANUAL),('override_auto_exposure_apply_physical_camera_exposure',True),('auto_exposure_apply_physical_camera_exposure',False),('override_auto_exposure_bias',True),('auto_exposure_bias',-7.0)]:s.set_editor_property(k,v)
p.settings=s
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(0,43,163),u.MathLibrary.find_look_at_rotation(u.Vector(0,43,163),u.Vector(0,8,163)))
u.EditorLevelLibrary.editor_invalidate_viewports();assert u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
