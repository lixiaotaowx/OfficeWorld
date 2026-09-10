import unreal as u,pathlib,json
root=pathlib.Path(u.Paths.project_dir()).resolve().parent;identity=json.loads((root/'OfficeWorld/Saved/independent-person-job.json').read_text())['id']
t=u.AssetExportTask();t.object=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Face/SKM_'+identity+'_FaceMesh');t.filename=str(root/'AssetSources/Realistic/OfficePeople/Fitting'/(identity+'_Face.fbx'));t.automated=True;t.prompt=False;t.replace_identical=True
t.options=u.FbxExportOption();t.options.level_of_detail=False
assert u.Exporter.run_asset_export_task(t),list(t.errors)
