import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 r['added']=s.try_add_object_to_edit(c)
 r['editing']=s.is_object_added_for_editing(c)
 r['can_build']=s.can_build_meta_human(c,True)
 preview=s.get_preview_collection(c)
 r['preview']=str(preview)
 r['selections']=str(preview.default_instance.get_slot_selection_data()) if preview else None
 r['actors']=[{'label':a.get_actor_label(),'class':a.get_class().get_path_name()} for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors() if 'MetaHuman' in a.get_class().get_name() or 'OfficePerson' in a.get_actor_label()]
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-recovery-prepare.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
