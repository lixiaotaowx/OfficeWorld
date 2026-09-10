import unreal as u,pathlib,json,datetime,traceback
r={'started':datetime.datetime.now().isoformat(),'mitigation':'Fresh editor character data; no registered preview actors. Avoid stale InvisibleDrivingActor in global component reregister callback.'}
out=pathlib.Path(u.Paths.project_saved_dir(),'metahuman-recovered-build.json')
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 assert s.is_object_added_for_editing(c) and s.can_build_meta_human(c,True)
 actors=u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors()
 assert not any('MetaHumanCharacterEditorActor' in a.get_class().get_name() for a in actors)
 p=u.MetaHumanCharacterEditorBuildParameters(pipeline_type=u.MetaHumanDefaultPipelineType.OPTIMIZED,pipeline_quality=u.MetaHumanQualityLevel.HIGH,animation_system_name='AnimBP',absolute_build_path='/Game/MetaHumans/Runtime',name_override='OfficePerson01',common_folder_path='/Game/MetaHumans/Common')
 r['status']='requested';out.write_text(json.dumps(r,indent=2),encoding='utf-8')
 s.build_meta_human(c,p)
 r['status']='returned'
 r['blueprint_exists']=u.EditorAssetLibrary.does_asset_exist('/Game/MetaHumans/Runtime/OfficePerson01/BP_OfficePerson01')
except Exception:r['error']=traceback.format_exc()
out.write_text(json.dumps(r,indent=2),encoding='utf-8')
