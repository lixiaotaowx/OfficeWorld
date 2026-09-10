"""A runtime visual child preserves the existing pawn/seat motion driver."""
import unreal as u,pathlib,json,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
r={};lang=u.InternationalizationLibrary.get_current_language()
try:
 u.InternationalizationLibrary.set_current_language('en')
 S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
 jobfile=pathlib.Path(u.Paths.project_saved_dir(),'independent-person-job.json')
 identity=json.loads(jobfile.read_text(encoding='utf-8'))['id'] if jobfile.exists() else 'OfficePerson01'
 visual=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/BP_'+identity)
 assert visual
 seen=set()
 for h in S.k2_gather_subobject_data_for_blueprint(visual):
  obj=L.get_object_for_blueprint(L.get_data(h),visual)
  if not obj or obj.get_path_name() in seen:continue
  seen.add(obj.get_path_name())
  if isinstance(obj,u.SkeletalMeshComponent):
   obj.set_collision_enabled(u.CollisionEnabled.NO_COLLISION)
   if obj.get_name()=='Body_GEN_VARIABLE':obj.set_editor_property('component_tags',['OfficeRetargetBody'])
 B.compile_blueprint(visual);assert u.EditorAssetLibrary.save_loaded_asset(visual,False)
 folder='/Game/OfficeInteraction/MetaHuman';name='BP_OfficePersonVisual' if identity=='OfficePerson01' else 'BP_Visual_'+identity;path=folder+'/'+name
 bp=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else B.create(folder,name,u.Actor.static_class())
 handles=S.k2_gather_subobject_data_for_blueprint(bp);actorhandle=handles[0]
 def component(name,cls,parent):
  for h in S.k2_gather_subobject_data_for_blueprint(bp):
   o=L.get_object_for_blueprint(L.get_data(h),bp)
   if o and o.get_name()==name+'_GEN_VARIABLE':return h,o
  h,reason=S.add_new_subobject(u.AddNewSubobjectParams(parent_handle=parent,new_class=cls,blueprint_context=bp))
  assert S.rename_subobject(h,u.Text(name)),str(reason)
  return h,L.get_object_for_blueprint(L.get_data(h),bp)
 root,rootobj=component('VisualRoot',u.SceneComponent,actorhandle)
 child,childobj=component('VisualPerson',u.ChildActorComponent,root)
 childobj.set_child_actor_class(visual.generated_class())
 ret,retobj=component('MotionRetarget',u.RetargetComponent,actorhandle)
 rt=u.load_asset(folder+'/RTG_OfficeMannequin_To_Person');assert rt
 retobj.set_editor_property('force_other_meshes_to_follow_controlled_mesh',False)
 retobj.set_editor_property('retarget_asset',rt)
 B.compile_blueprint(bp)
 g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g)
 ed.remove_nodes(list(B.find_nodes(g)));_BlueprintCache.invalidate(bp)
 def c(a,b):assert a.try_create_connection(b),(str(a),str(b))
 def f(path,**values):
  n=ed.add_call_function_node(path)
  for k,v in values.items():assert n.find_input_pin(k).set_pin_value(str(v)),(path,k)
  return n
 begin=B.create_node(g,'AddEvent|EventBeginPlay',u.IntPoint(0,0))
 delay=f('/Script/Engine.KismetSystemLibrary:Delay',Duration='0.15')
 c(begin.find_output_pin('then'),delay.find_input_pin('execute'))
 parent=f('/Script/Engine.Actor:GetParentActor')
 source=f('/Script/Engine.Actor:GetComponentByClass',ComponentClass='/Script/Engine.SkeletalMeshComponent')
 c(parent.find_output_pin('ReturnValue'),source.find_input_pin('self'))
 childget=ed.add_get_member_variable_node('VisualPerson')
 childactor=ed.add_get_member_variable_node('ChildActor','/Script/Engine.ChildActorComponent')
 c(childget.find_output_pin('VisualPerson'),childactor.find_input_pin('self'))
 tagged=f('/Script/Engine.Actor:GetComponentsByTag',ComponentClass='/Script/Engine.SkeletalMeshComponent',Tag='OfficeRetargetBody')
 c(childactor.find_output_pin('ChildActor'),tagged.find_input_pin('self'))
 arr=f('/Script/Engine.KismetArrayLibrary:Array_Get',Index='0')
 c(tagged.find_output_pin('ReturnValue'),arr.find_input_pin('TargetArray'))
 retget=ed.add_get_member_variable_node('MotionRetarget')
 setsource=f('/Script/PerformanceCaptureCore.RetargetComponent:SetSourcePerformerMesh')
 settarget=f('/Script/PerformanceCaptureCore.RetargetComponent:SetControlledMesh')
 setasset=f('/Script/PerformanceCaptureCore.RetargetComponent:SetRetargetAsset',InRetargetAsset=rt.get_path_name())
 for n in [setsource,settarget,setasset]:c(retget.find_output_pin('MotionRetarget'),n.find_input_pin('self'))
 c(source.find_output_pin('ReturnValue'),setsource.find_input_pin('InPerformerMesh'))
 c(arr.find_output_pin('Item'),settarget.find_input_pin('InControlledMesh'))
 pin=delay.find_output_pin('then')
 for n in [setsource,settarget,setasset]:c(pin,n.find_input_pin('execute'));pin=n.find_output_pin('then')
 B.compile_blueprint(bp);r['errors']=[str(e) for e in ed.list_nodes_with_errors()]
 assert not r['errors'];r['saved']=u.EditorAssetLibrary.save_loaded_asset(bp,False)
except Exception:r['error']=traceback.format_exc()
finally:u.InternationalizationLibrary.set_current_language(lang)
pathlib.Path(u.Paths.project_saved_dir(),'office-person-wrapper.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
