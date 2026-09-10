import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.project_dir()).resolve().parent;out=root/'Design/Characters/ReferenceWomanTrial/Conform';out.mkdir(exist_ok=True);r={}
try:
 E=u.get_editor_subsystem(u.EditorActorSubsystem)
 for a in E.get_all_level_actors():
  if a.get_actor_label().startswith('QA_FacePoint_'):E.destroy_actor(a)
 a=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='RefWoman_A01_MetaHumanPreview')
 parts=a.get_components_by_class(u.SkeletalMeshComponent);r['parts']=[{'name':p.get_name(),'mesh':str(p.skeletal_mesh_asset)} for p in parts]
 face=next(p.skeletal_mesh_asset for p in parts if 'face' in p.get_name().lower())
 source=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');assets=u.AssetToolsHelpers.get_asset_tools()
 checkpoint=assets.duplicate_asset('RefWoman_A01_R07','/Game/MetaHumans/Trials/Checkpoints',source);assert u.EditorAssetLibrary.save_loaded_asset(checkpoint,False)
 mesh=assets.duplicate_asset('SK_RefWoman_Face_R07','/Game/MetaHumans/Trials/Conform',face);assert u.EditorAssetLibrary.save_loaded_asset(mesh,False)
 task=u.AssetExportTask();task.object=mesh;task.filename=str(out/'Face_R07.fbx');task.automated=True;task.prompt=False;task.replace_identical=True;task.exporter=u.SkeletalMeshExporterFBX();options=u.FbxExportOption();options.set_editor_property('level_of_detail',False);task.options=options;r['exported']=u.Exporter.run_asset_export_task(task);r['face']=mesh.get_path_name()
 r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
(out/'export.json').write_text(json.dumps(r,indent=2))
