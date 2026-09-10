import unreal as u,os,json,traceback
r={};s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
try:
 r['editing']=s.is_object_added_for_editing(c) or s.try_add_object_to_edit(c)
 if r['editing']:
  s.request_auto_rigging(c)
  r['request_submitted']=True
except Exception:r['error']=traceback.format_exc()
with open(os.path.join(u.Paths.project_saved_dir(),'metahuman-rig-request.json'),'w') as f:json.dump(r,f,indent=2)
