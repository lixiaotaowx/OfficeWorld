import unreal as u, pathlib, json
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
r={'can_build':s.can_build_meta_human(c,True),'character_methods':[x for x in dir(c) if not x.startswith('_')],'subsystem_methods':[x for x in dir(s) if any(y in x for y in ['outfit','wardrobe','pipeline','collection'])], 'build_params':str(u.MetaHumanCharacterEditorBuildParameters()),'pipeline_enum':str(list(u.MetaHumanDefaultPipelineType)), 'quality_enum':str(list(u.MetaHumanQualityLevel))}
ar=u.AssetRegistryHelpers.get_asset_registry()
r['wardrobe_assets']=[str(a.package_name) for a in ar.get_all_assets() if any(t in str(a.asset_class_path) for t in ['Wardrobe','Outfit','Collection'])][:300]
(root/'Saved/metahuman-assembly-inspect.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
