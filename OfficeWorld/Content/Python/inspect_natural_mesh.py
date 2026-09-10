import unreal as u,json,os
report=[]
for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors():
 if isinstance(a,u.StaticMeshActor):report.append({'label':a.get_actor_label(),'mesh':a.static_mesh_component.static_mesh.get_path_name(),'location':str(a.get_actor_location()),'rotation':str(a.get_actor_rotation()),'scale':str(a.get_actor_scale3d()),'mats':[str(a.static_mesh_component.get_material(i)) for i in range(a.static_mesh_component.get_num_materials())]})
with open(os.path.join(u.Paths.project_saved_dir(),'natural-mesh-inspect.json'),'w') as f:json.dump(report,f,indent=2)
