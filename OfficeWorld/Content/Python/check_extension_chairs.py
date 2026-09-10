import unreal as u,pathlib,json
r=[]
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if str(a.get_folder_path()).startswith('OfficeExtension') and isinstance(a,u.StaticMeshActor):
  c=a.static_mesh_component;row={'name':a.get_actor_label(),'position':str(a.get_actor_location())}
  for key in ['render_in_main_pass','render_in_depth_pass','owner_no_see','only_owner_see','disallow_nanite','force_hidden','cast_hidden_shadow']:
   try:row[key]=str(c.get_editor_property(key))
   except Exception:pass
  r.append(row)
  c.set_editor_property('render_in_main_pass',True);c.set_editor_property('owner_no_see',False);c.set_editor_property('only_owner_see',False)
  try:c.set_editor_property('disallow_nanite',True)
  except Exception:pass
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();pathlib.Path(u.Paths.project_saved_dir(),'extension-chair-check.json').write_text(json.dumps(r,indent=2))

