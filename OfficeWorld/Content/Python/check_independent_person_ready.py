import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()));r={}
job=json.loads((root/'Saved/independent-person-job.json').read_text(encoding='utf-8'))
try:
 c=u.load_asset('/Game/MetaHumans/Office/'+job['id']);s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 r['id']=job['id'];r['editing']=s.is_object_added_for_editing(c)
 r['can_build']=s.can_build_meta_human(c,True)
 if r['can_build']:r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
except Exception:r['error']=traceback.format_exc()
(root/('Saved/'+job['id']+'-ready.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
