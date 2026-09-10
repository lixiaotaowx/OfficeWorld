import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={}
try:
 u.AssetRegistryHelpers.get_asset_registry().scan_paths_synchronous(['/Game/ThirdPerson'],True)
 for name in ['Character','GameMode','PlayerController']:
  bp=u.load_asset('/Game/ThirdPerson/Blueprints/BP_ThirdPerson'+name);B.compile_blueprint(bp)
  c=u.get_default_object(bp.generated_class());r[name]={'cdo':str(c),'errors':[],'dependencies':list(u.AssetRegistryHelpers.get_asset_registry().get_dependencies(bp.get_path_name().split('.')[0],u.AssetRegistryDependencyOptions(True,True,False,False)))}
  for g in B.list_graphs(bp):
   try:r[name]['errors']+=list(map(str,u.BlueprintGraphEditor.get_graph_editor(g).list_nodes_with_errors()))
   except:pass
  if name=='Character':
   a=u.get_editor_subsystem(u.EditorActorSubsystem).spawn_actor_from_class(bp.generated_class(),u.Vector(0,0,100));r[name]['components']=[{'name':x.get_name(),'class':x.get_class().get_name()} for x in a.get_components_by_class(u.ActorComponent)];u.get_editor_subsystem(u.EditorActorSubsystem).destroy_actor(a)
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'thirdperson-inspect.json').write_text(json.dumps(r,indent=2,default=str))
