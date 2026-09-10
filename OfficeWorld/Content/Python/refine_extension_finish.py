import unreal as u,pathlib,json
E=u.get_editor_subsystem(u.EditorActorSubsystem);root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve()
for kind in ['Shell','Glazing','Joinery','Planter','Balls']:
 m=u.load_asset('/Game/OfficeExtension/Meshes/SM_'+kind)
 for i,slot in enumerate(m.static_materials):
  key=str(slot.material_slot_name);name={'Black':'Charcoal','White':'White','Light':'Light'}.get(key)
  if name:m.set_material(i,u.load_asset('/Game/RealisticSample/Materials/M_'+name))
 u.EditorAssetLibrary.save_loaded_asset(m,False)
for a in E.get_all_level_actors():
 label=a.get_actor_label()
 if label.startswith('Extension_') and isinstance(a,u.RectLight):
  c=a.light_component;c.set_editor_property('intensity_units',u.LightUnits.LUMENS)
  c.set_editor_property('intensity',3500.0 if 'WindowLight' in label else (1700.0 if 'CeilingLight' in label else 1500.0))
# Additional local WC fill for two cubicles; does not affect original office lights.
for i,y in enumerate([280,475]):
 label='Extension_CubicleFill_'+str(i);a=next((a for a in E.get_all_level_actors() if a.get_actor_label()==label),None) or E.spawn_actor_from_class(u.RectLight,u.Vector(1230,y,285));a.set_actor_label(label);a.set_actor_rotation(u.Rotator(pitch=-90,yaw=0,roll=0),False);a.set_folder_path('OfficeExtension/Lighting');c=a.light_component;c.set_mobility(u.ComponentMobility.MOVABLE);c.set_editor_property('intensity_units',u.LightUnits.LUMENS);c.set_editor_property('intensity',1000.0);c.set_editor_property('source_width',80.0);c.set_editor_property('source_height',60.0);c.set_editor_property('attenuation_radius',450.0)
assert u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
(root/'Saved/extension-finish.json').write_text(json.dumps({'saved':True,'corrected':'Black/White/Light slots use established RealisticSample materials; lumen units explicit; local cubicle fills'}))
