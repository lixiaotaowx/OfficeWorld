import unreal as u,pathlib,json,datetime,traceback
root=pathlib.Path(u.Paths.project_dir()).resolve();job=json.loads((root/'Saved/independent-person-job.json').read_text(encoding='utf-8'));identity=job['id']
r={'id':identity,'started':datetime.datetime.now().isoformat(),'saved':[],'failed':[]};out=root/('Saved/'+identity+'-assembly.json')
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False),'Stop play before assembly'
 c=u.load_asset('/Game/MetaHumans/Office/'+identity);s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 assert (s.is_object_added_for_editing(c) or s.try_add_object_to_edit(c)) and s.can_build_meta_human(c,True)
 assert not any('MetaHumanCharacterEditorActor' in a.get_class().get_name() for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors())
 assert u.EditorAssetLibrary.save_loaded_asset(c,False)
 p=u.MetaHumanCharacterEditorBuildParameters(pipeline_type=u.MetaHumanDefaultPipelineType.OPTIMIZED,pipeline_quality=u.MetaHumanQualityLevel.HIGH,animation_system_name='AnimBP',absolute_build_path='/Game/MetaHumans/Runtime',name_override=identity,common_folder_path='/Game/MetaHumans/Common')
 r['status']='building';out.write_text(json.dumps(r,indent=2),encoding='utf-8')
 s.build_meta_human(c,p)
 folder='/Game/MetaHumans/Runtime/'+identity
 r['blueprint_exists']=u.EditorAssetLibrary.does_asset_exist(folder+'/BP_'+identity)
 assert r['blueprint_exists']
 r['status']='saving';out.write_text(json.dumps(r,indent=2),encoding='utf-8')
 for path in u.EditorAssetLibrary.list_assets(folder,True,False):
  obj=u.load_asset(path)
  if obj:r['saved' if u.EditorAssetLibrary.save_loaded_asset(obj,False) else 'failed'].append(path)
 r['status']='assembled';r['finished']=datetime.datetime.now().isoformat()
except Exception:r['error']=traceback.format_exc()
out.write_text(json.dumps(r,indent=2),encoding='utf-8')
