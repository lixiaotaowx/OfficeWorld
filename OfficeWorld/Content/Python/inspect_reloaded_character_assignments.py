import unreal as u,json,pathlib
r={'actors':[]}
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if a.get_actor_label().startswith('Working_DemoColleague_'):
  r['actors'].append({'actor':a.get_actor_label(),'children':[{'name':c.get_name(),'class':str(c.get_editor_property('child_actor_class'))} for c in a.get_components_by_class(u.ChildActorComponent)]})
pathlib.Path(u.Paths.project_saved_dir(),'reloaded-character-assignments.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
