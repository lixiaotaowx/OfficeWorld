import unreal as u,pathlib,json,traceback
r={}
try:
 folder=pathlib.Path(u.Paths.project_dir()).resolve().parent/'AssetSources/Realistic/OfficePeople/Fitting'
 folder.mkdir(parents=True,exist_ok=True)
 jobfile=pathlib.Path(u.Paths.project_saved_dir(),'independent-person-job.json')
 identity=json.loads(jobfile.read_text(encoding='utf-8'))['id'] if jobfile.exists() else 'OfficePerson01'
 mesh=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Body/SKM_'+identity+'_BodyMesh');assert mesh
 task=u.AssetExportTask();task.object=mesh;task.filename=str(folder/(identity+'_Body.fbx'));task.automated=True;task.prompt=False;task.replace_identical=True
 opts=u.FbxExportOption();opts.ascii=False;opts.level_of_detail=False;task.options=opts
 r['ok']=u.Exporter.run_asset_export_task(task);r['errors']=list(task.errors);r['file']=task.filename
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-body-export.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
