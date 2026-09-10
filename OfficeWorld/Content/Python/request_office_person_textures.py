"""Prepare source textures after successful Epic auth/rig. Run when UE control is free."""
import unreal as u,pathlib,json,traceback
r={}
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 assert c and s.is_object_added_for_editing(c),'Character must remain in its current edit session'
 u.EditorAssetLibrary.save_loaded_asset(c,False)
 params=u.MetaHumanCharacterTextureRequestParams();params.set_editor_property('report_progress',False);params.set_editor_property('blocking',False)
 s.request_texture_sources(c,params);r['texture_request_submitted']=True
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-texture-request.json').write_text(json.dumps(r,indent=2))
