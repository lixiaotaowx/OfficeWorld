import unreal as u,pathlib,json,traceback
r={'saved':[],'released':[]}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 for identity in ['OfficePerson01','Office_M01','Office_F01','Office_M02','Office_F02']:
  c=u.load_asset('/Game/MetaHumans/Office/'+identity)
  assert u.EditorAssetLibrary.save_loaded_asset(c,False),identity
  r['saved'].append(identity)
  if s.is_object_added_for_editing(c):s.remove_object_to_edit(c);r['released'].append(identity)
 r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 u.SystemLibrary.collect_garbage();r['gc']=True
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'character-memory-release.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
