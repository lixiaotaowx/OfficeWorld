import unreal as u,json,pathlib,traceback
r={}
try:
 E=u.get_editor_subsystem(u.EditorActorSubsystem);actors=E.get_all_level_actors()
 for a in actors:
  if isinstance(a,u.DirectionalLight):
   a.set_actor_rotation(u.Rotator(pitch=-48,yaw=28,roll=0),False);c=a.light_component;c.set_editor_property('intensity',25000);c.set_editor_property('light_source_angle',4);c.set_editor_property('atmosphere_sun_light',True)
  if isinstance(a,u.PostProcessVolume):
   s=a.settings
   for key,val in [('override_auto_exposure_method',True),('auto_exposure_method',u.AutoExposureMethod.AEM_HISTOGRAM),('override_auto_exposure_bias',True),('auto_exposure_bias',-1.0),('override_auto_exposure_min_brightness',True),('auto_exposure_min_brightness',.03),('override_auto_exposure_max_brightness',True),('auto_exposure_max_brightness',20000.0)]:s.set_editor_property(key,val)
   a.settings=s
 if not any(isinstance(a,u.SkyAtmosphere) for a in actors):a=E.spawn_actor_from_class(u.SkyAtmosphere,u.Vector());a.set_actor_label('DeliverySkyAtmosphere')
 sky=next((a for a in actors if isinstance(a,u.SkyLight)),None) or E.spawn_actor_from_class(u.SkyLight,u.Vector(0,0,1000));sky.set_actor_label('DeliverySkyLight');c=sky.light_component;c.set_editor_property('real_time_capture',True);c.set_editor_property('intensity',1.0)
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'daylight-balance.json').write_text(json.dumps(r,indent=2))
