import unreal as u,json,pathlib
r=[]
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if isinstance(a,(u.Light,u.SkyLight)):
  a.light_component.set_mobility(u.ComponentMobility.MOVABLE);r.append(a.get_actor_label())
w=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();w.get_world_settings().set_editor_property('force_no_precomputed_lighting',True)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();pathlib.Path(u.Paths.project_saved_dir(),'dynamic-lighting-install.json').write_text(json.dumps({'movable_lights':r,'saved':True},indent=2))
