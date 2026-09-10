import unreal as u,json,os,traceback
report={}
try:
 u.EditorLevelLibrary.editor_invalidate_viewports()
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
 report['added_for_edit']=s.try_add_object_to_edit(c)
 report['can_build']=s.can_build_meta_human(c,True)
 report['build_doc']=s.build_meta_human.__doc__
 report['rig_doc']=s.request_auto_rigging.__doc__
 report['spawn_doc']=s.spawn_meta_human_actor.__doc__
 if report['added_for_edit']:s.remove_object_to_edit(c)
except Exception:report['error']=traceback.format_exc()
with open(os.path.join(u.Paths.project_saved_dir(),'metahuman-ready.json'),'w') as f:json.dump(report,f,indent=2)
