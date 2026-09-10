import unreal as u,pathlib,json,shutil,datetime,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
report=root/'Saved/metahuman-runtime-build.json'
r={'started':datetime.datetime.now().isoformat()}
try:
 c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 backup=root/'Saved/Backups/BeforeMetaHumanRuntime_20260908'
 backup.mkdir(parents=True,exist_ok=True)
 src=root/'Content/MetaHumans/Office/OfficePerson01.uasset'
 if not (backup/src.name).exists():shutil.copy2(src,backup/src.name)
 col=c.internal_collection
 r['wardrobe']=[]
 for slot,path in [('Outfits','/MetaHumanCharacter/Optional/Clothing/WI_DefaultGarment'),('Hair','/MetaHumanCharacter/Optional/Grooms/Bindings/Hair/WI_Hair_S_Casual'),('Eyebrows','/MetaHumanCharacter/Optional/Grooms/Bindings/Eyebrows/WI_Eyebrows_M_Natural'),('Eyelashes','/MetaHumanCharacter/Optional/Grooms/Bindings/Eyelashes/WI_Eyelashes_S_Sparse')]:
  item=u.load_asset(path)
  if not item:raise RuntimeError('Missing wardrobe item '+path)
  key=col.try_add_item_from_wardrobe_item(slot,item)
  if key is None:raise RuntimeError('Could not add '+path)
  col.default_instance.set_single_slot_selection(slot,key)
  r['wardrobe'].append({'slot':slot,'asset':path})
 r['character_saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
 p=u.MetaHumanCharacterEditorBuildParameters(pipeline_type=u.MetaHumanDefaultPipelineType.OPTIMIZED,pipeline_quality=u.MetaHumanQualityLevel.HIGH,animation_system_name='AnimBP',absolute_build_path='/Game/MetaHumans/Runtime',name_override='OfficePerson01',common_folder_path='/Game/MetaHumans/Common')
 r['status']='build_requested';report.write_text(json.dumps(r,indent=2),encoding='utf-8')
 s.build_meta_human(c,p)
 r['status']='build_function_returned'
except Exception:r['error']=traceback.format_exc()
report.write_text(json.dumps(r,indent=2),encoding='utf-8')
