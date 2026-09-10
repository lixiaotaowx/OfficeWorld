import unreal as u,pathlib,json,traceback
r={};s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 path='/Game/MetaHumans/Trials/RefWoman_A01'
 assert not u.EditorAssetLibrary.does_asset_exist(path),'Trial already exists; do not overwrite'
 c=u.AssetToolsHelpers.get_asset_tools().duplicate_asset('RefWoman_A01','/Game/MetaHumans/Trials',u.load_asset('/MetaHumanCharacter/Optional/Presets/Aera'))
 assert c and s.try_add_object_to_edit(c)
 r['asset']=c.get_path_name();r['landmarks']=[[p.x,p.y,p.z] for p in s.get_face_landmarks(c)]
 r['character_properties']=c.__doc__
 for prop in ['eyes_settings','skin_settings','head_model_settings']:
  try:r[prop]=str(c.get_editor_property(prop))
  except Exception as e:r[prop]=str(e)
 r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'reference-woman-created.json').write_text(json.dumps(r,indent=2))
