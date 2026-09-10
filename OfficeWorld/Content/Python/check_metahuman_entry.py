import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();r={}
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 r['asset_exists']=bool(c);r['editing']=s.is_object_added_for_editing(c)
 r['can_build']=s.can_build_meta_human(c,True)
 r['existing_character_actors']=[a.get_actor_label() for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors() if 'MetaHuman' in a.get_class().get_name() or 'OfficePerson' in a.get_actor_label()]
 r['spawn_doc']=s.spawn_meta_human_actor.__doc__;r['build_doc']=s.build_meta_human.__doc__
except Exception:r['error']=traceback.format_exc()
(root/'Saved/metahuman-entry-status.json').write_text(json.dumps(r,indent=2));print(r)
