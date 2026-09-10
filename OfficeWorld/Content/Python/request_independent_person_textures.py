import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
job=json.loads((root/'Saved/independent-person-job.json').read_text(encoding='utf-8'));r={'id':job['id']}
try:
 c=u.load_asset('/Game/MetaHumans/Office/'+job['id']);s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 assert s.is_object_added_for_editing(c)
 r['saved_rig']=u.EditorAssetLibrary.save_loaded_asset(c,False)
 s.request_texture_sources(c,u.MetaHumanCharacterTextureRequestParams(report_progress=False,blocking=False))
 r['request_submitted']=True
except Exception:r['error']=traceback.format_exc()
(root/('Saved/'+job['id']+'-texture-request.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
