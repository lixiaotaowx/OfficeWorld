import unreal as u,pathlib,json,traceback
r={}
try:
 paths=u.EditorAssetLibrary.list_assets('/Game/MetaHumans/Runtime',True,False)
 r['assets']=list(paths);r['skeletal']=[]
 for path in paths:
  data=u.EditorAssetLibrary.find_asset_data(path)
  if 'SkeletalMesh' in str(data.asset_class_path):
   m=data.get_asset();r['skeletal'].append({'path':path,'skeleton':str(m.skeleton),'materials':[str(x.material_interface) for x in m.materials]})
 bp=u.load_asset('/Game/MetaHumans/Runtime/OfficePerson01/BP_OfficePerson01')
 if bp:
  S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
  r['components']=[]
  for h in S.k2_gather_subobject_data_for_blueprint(bp):
   d=L.get_data(h);o=L.get_object_for_blueprint(d,bp)
   r['components'].append({'name':o.get_name() if o else None,'class':o.get_class().get_path_name() if o else None})
  r['bp_saved']=u.EditorAssetLibrary.save_loaded_asset(bp,False)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'assembled-person-inspect.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
