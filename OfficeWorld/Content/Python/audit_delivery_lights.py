import unreal as u,json,pathlib
r=[]
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if isinstance(a,u.Light):
  c=a.light_component;r.append({'name':a.get_actor_label(),'class':a.get_class().get_name(),'rotation':str(a.get_actor_rotation()),'intensity':c.get_editor_property('intensity'),'temperature':c.get_editor_property('temperature')})
 if isinstance(a,u.PostProcessVolume):
  r.append({'name':a.get_actor_label(),'unbound':a.get_editor_property('unbound'),'settings':{n:str(a.settings.get_editor_property(n)) for n in ['auto_exposure_method','auto_exposure_bias','auto_exposure_min_brightness','auto_exposure_max_brightness','override_auto_exposure_bias','override_auto_exposure_method','override_auto_exposure_min_brightness','override_auto_exposure_max_brightness']}})
pathlib.Path(u.Paths.project_saved_dir(),'delivery-light-audit.json').write_text(json.dumps(r,indent=2))
