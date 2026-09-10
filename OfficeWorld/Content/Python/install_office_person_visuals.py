import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={'blueprints':[],'actors':[]}
try:
 S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
 visual=u.load_asset('/Game/OfficeInteraction/MetaHuman/BP_OfficePersonVisual');assert visual
 for path in ['/Game/OfficeInteraction/BP_OfficeCharacter','/Game/OfficeInteraction/BP_WorkingColleague']:
  bp=u.load_asset(path);assert bp
  handles=S.k2_gather_subobject_data_for_blueprint(bp)
  source_handle=None
  for h in handles:
   obj=L.get_object_for_blueprint(L.get_data(h),bp)
   if isinstance(obj,u.SkeletalMeshComponent):source_handle=h;source=obj;break
  assert source_handle
  child=None
  for h in handles:
   obj=L.get_object_for_blueprint(L.get_data(h),bp)
   if obj and obj.get_name()=='OfficePerson_GEN_VARIABLE':child=obj
  if child is None:
   h,reason=S.add_new_subobject(u.AddNewSubobjectParams(parent_handle=source_handle,new_class=u.ChildActorComponent,blueprint_context=bp,conform_transform_to_parent=True))
   assert S.rename_subobject(h,u.Text('OfficePerson')),str(reason)
   child=L.get_object_for_blueprint(L.get_data(h),bp)
  child.set_child_actor_class(visual.generated_class())
  child.set_editor_property('relative_location',u.Vector())
  child.set_editor_property('relative_rotation',u.Rotator())
  source.set_visibility(False,False)
  source.set_editor_property('visibility_based_anim_tick_option',u.VisibilityBasedAnimTickOption.ALWAYS_TICK_POSE_AND_REFRESH_BONES)
  B.compile_blueprint(bp);assert u.EditorAssetLibrary.save_loaded_asset(bp,False)
  r['blueprints'].append(path)
 for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
  if a.get_actor_label().startswith('Working_DemoColleague_'):
   source=a.skeletal_mesh_component
   source.set_visibility(False,False)
   source.set_editor_property('visibility_based_anim_tick_option',u.VisibilityBasedAnimTickOption.ALWAYS_TICK_POSE_AND_REFRESH_BONES)
   a.set_actor_hidden_in_game(False)
   r['actors'].append(a.get_actor_label())
 r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'office-person-install.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
