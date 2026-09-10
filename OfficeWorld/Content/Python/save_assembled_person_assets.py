import unreal as u,json,pathlib,traceback
r={'saved':[],'failed':[]}
try:
 for folder in ['/Game/MetaHumans/Runtime','/Game/MetaHumans/Common']:
  for path in u.EditorAssetLibrary.list_assets(folder,True,False):
   obj=u.load_asset(path)
   if obj:
    ok=u.EditorAssetLibrary.save_loaded_asset(obj,False)
    r['saved' if ok else 'failed'].append(path)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-runtime-saved.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
