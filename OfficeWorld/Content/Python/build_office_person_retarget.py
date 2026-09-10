import unreal as u,pathlib,json,traceback
r={}
try:
 a=u.AssetToolsHelpers.get_asset_tools();folder='/Game/OfficeInteraction/MetaHuman'
 source=u.load_asset('/Game/Characters/Mannequins/Meshes/SKM_Manny_Simple')
 target=u.load_asset('/Game/MetaHumans/Runtime/OfficePerson01/Body/SKM_OfficePerson01_BodyMesh')
 assert source and target
 rigs=[]
 for name,mesh in [('IK_OfficeSource',source),('IK_OfficePerson',target)]:
  path=folder+'/'+name
  rig=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else a.create_asset(name,folder,u.IKRigDefinition,u.IKRigDefinitionFactory())
  ctrl=u.IKRigController.get_controller(rig);assert ctrl.set_skeletal_mesh(mesh)
  r[name]={'retarget_definition':ctrl.apply_auto_generated_retarget_definition(),'fbik':ctrl.apply_auto_fbik()}
  assert r[name]['retarget_definition']
  assert u.EditorAssetLibrary.save_loaded_asset(rig,False);rigs.append(rig)
 name='RTG_OfficeMannequin_To_Person';path=folder+'/'+name
 rt=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else a.create_asset(name,folder,u.IKRetargeter,u.IKRetargetFactory())
 ctrl=u.IKRetargeterController.get_controller(rt)
 ctrl.set_ik_rig(u.RetargetSourceOrTarget.SOURCE,rigs[0]);ctrl.set_ik_rig(u.RetargetSourceOrTarget.TARGET,rigs[1])
 ctrl.set_preview_mesh(u.RetargetSourceOrTarget.SOURCE,source);ctrl.set_preview_mesh(u.RetargetSourceOrTarget.TARGET,target)
 ctrl.add_default_ops();ctrl.auto_map_chains(u.AutoMapChainType.EXACT,True)
 ctrl.auto_align_all_bones(u.RetargetSourceOrTarget.TARGET)
 r['saved']=u.EditorAssetLibrary.save_loaded_asset(rt,False)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'office-person-retarget.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
