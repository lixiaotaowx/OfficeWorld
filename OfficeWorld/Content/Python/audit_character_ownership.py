import unreal as u,pathlib,json
r=[]
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if 'Office_M' in a.get_class().get_name() or 'Office_F' in a.get_class().get_name():
  r.append({'path':a.get_path_name(),'class':a.get_class().get_name(),'label':a.get_actor_label(),'parent':str(a.get_parent_actor()),'owner':str(a.get_owner()),'attach':str(a.get_attach_parent_actor()),'child':a.is_child_actor()})
pathlib.Path(u.Paths.project_saved_dir(),'character-ownership.json').write_text(json.dumps(r,indent=2))
