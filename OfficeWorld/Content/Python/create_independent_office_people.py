import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).parent
manifest=json.loads((root/'Design/Characters/office_people.json').read_text(encoding='utf-8'))
r={'characters':[]}
try:
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 old=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
 if s.is_object_added_for_editing(old):s.remove_object_to_edit(old)
 a=u.AssetToolsHelpers.get_asset_tools()
 for spec in manifest['characters']:
  path='/Game/MetaHumans/Office/'+spec['id']
  if u.EditorAssetLibrary.does_asset_exist(path):c=u.load_asset(path)
  else:c=a.duplicate_asset(spec['id'],'/Game/MetaHumans/Office',u.load_asset('/MetaHumanCharacter/Optional/Presets/'+spec['preset']))
  assert c
  r['characters'].append({'id':spec['id'],'preset':spec['preset'],'saved':u.EditorAssetLibrary.save_loaded_asset(c,False),'class':c.get_class().get_name()})
except Exception:r['error']=traceback.format_exc()
(root/'OfficeWorld/Saved/independent-people-created.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
