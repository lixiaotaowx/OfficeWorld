import unreal as u
import os,json
E=u.get_editor_subsystem(u.EditorActorSubsystem)
L=u.get_editor_subsystem(u.LevelEditorSubsystem)
actors=E.get_all_level_actors()
def find(label):return next(a for a in actors if a.get_actor_label()==label)
sun=find('AfternoonSun')
sun.light_component.set_editor_property('intensity',4.0)
sun.set_actor_rotation(u.Rotator(pitch=-40,yaw=-35,roll=0),False)
sun.light_component.set_editor_property('light_source_angle',3.0)
pp=find('Exposure')
s=pp.settings
s.set_editor_property('override_auto_exposure_method',True)
s.set_editor_property('auto_exposure_method',u.AutoExposureMethod.AEM_MANUAL)
s.set_editor_property('override_auto_exposure_apply_physical_camera_exposure',True)
s.set_editor_property('auto_exposure_apply_physical_camera_exposure',False)
s.set_editor_property('override_auto_exposure_bias',True)
s.set_editor_property('auto_exposure_bias',0.0)
pp.set_editor_property('settings',s)
skyclass=u.load_class(None,'/Engine/EngineSky/BP_Sky_Sphere.BP_Sky_Sphere_C')
if not any(a.get_actor_label()=='BlueSkyBackdrop' for a in actors):
    backdrop=E.spawn_actor_from_class(skyclass,u.Vector(0,0,0))
    backdrop.set_actor_label('BlueSkyBackdrop')
    backdrop.set_folder_path('Campus/Lighting')
skylight=find('SoftSky').light_component
skylight.set_editor_property('real_time_capture',False)
skylight.set_editor_property('intensity',0.8)
skylight.recapture_sky()
for a in actors:
    if a.get_actor_label().startswith('ParkShrub'):
        a.static_mesh_component.set_material(0,u.load_asset('/Game/Campus/Materials/Sage'))
E.clear_actor_selection_set()
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-2200,-3700,2050),u.Rotator(pitch=-29,yaw=48,roll=0))
L.save_current_level()
u.log('CAMPUS_LIGHTING_COMPLETE')
