import unreal as u,pathlib,json,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
root=pathlib.Path(u.Paths.project_dir()).resolve();identity=json.loads((root/'Saved/independent-person-job.json').read_text())['id'];r={'id':identity}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 bp=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/BP_'+identity);mesh=u.load_asset('/Game/OfficeInteraction/Clothing/'+identity+'/SK_'+identity+'_OfficeClothing');assert bp and mesh
 S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
 objects=[L.get_object_for_blueprint(L.get_data(h),bp) for h in S.k2_gather_subobject_data_for_blueprint(bp)]
 cloth=next(o for o in objects if o and o.get_name()=='SkeletalMesh_GEN_VARIABLE' and isinstance(o,u.SkeletalMeshComponent))
 r['old']=str(cloth.skeletal_mesh_asset);cloth.set_skeletal_mesh_asset(mesh);cloth.set_editor_property('override_materials',[]);cloth.set_collision_enabled(u.CollisionEnabled.NO_COLLISION)
 B.compile_blueprint(bp);r['saved']=u.EditorAssetLibrary.save_loaded_asset(bp,False);r['mesh']=mesh.get_path_name();r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
(root/('Saved/'+identity+'-clothing-installed.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
