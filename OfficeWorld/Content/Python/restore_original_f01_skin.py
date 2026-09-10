import unreal as u,pathlib,json
from editor_toolset.toolsets.blueprint import BlueprintTools as B
assert not u.EditorLevelLibrary.get_pie_worlds(False)
bp=u.load_asset('/Game/MetaHumans/Runtime/Office_F01/BP_Office_F01')
mesh=u.load_asset('/Game/MetaHumans/Runtime/Office_F01/Body/SKM_Office_F01_BodyMesh')
S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
objects=[L.get_object_for_blueprint(L.get_data(h),bp) for h in S.k2_gather_subobject_data_for_blueprint(bp)]
body=next(o for o in objects if o and o.get_name()=='Body_GEN_VARIABLE')
body.set_material(0,mesh.materials[0].material_interface)
B.compile_blueprint(bp)
assert u.EditorAssetLibrary.save_loaded_asset(bp,False)
pathlib.Path(u.Paths.project_saved_dir(),'f01-original-skin-restored.json').write_text(json.dumps({'saved':True,'material':str(mesh.materials[0].material_interface)}))
