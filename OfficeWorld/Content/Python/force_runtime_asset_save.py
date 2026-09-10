import unreal as u,json,pathlib,traceback
r={}
try:
 for path in ['/Game/OfficeInteraction/BP_OfficeCharacter','/Game/OfficeInteraction/BP_OfficeGameMode']+['/Game/OfficeInteraction/Animations/'+n for n in ['Office_Work','Office_Acknowledge','Office_SitDown','Office_StandUp']]:
  ob=u.load_asset(path);r[path]={'object':str(ob),'save':u.EditorAssetLibrary.save_loaded_asset(ob,False) if ob else False}
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'force-runtime-asset-save.json').write_text(json.dumps(r,indent=2))
