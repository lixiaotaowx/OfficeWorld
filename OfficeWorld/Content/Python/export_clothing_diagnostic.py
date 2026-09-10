import unreal as u,pathlib,json
root=pathlib.Path(u.Paths.project_dir()).resolve().parent
mesh=u.load_asset('/Game/OfficeInteraction/Clothing/Office_F01/SK_Office_F01_OfficeClothing')
t=u.AssetExportTask();t.object=mesh;t.filename=str(root/'AssetSources/Realistic/OfficePeople/Fitting/Office_F01/UE_Clothing.fbx');t.automated=True;t.prompt=False;t.replace_identical=True
t.options=u.FbxExportOption();t.options.level_of_detail=False
assert u.Exporter.run_asset_export_task(t),list(t.errors)
