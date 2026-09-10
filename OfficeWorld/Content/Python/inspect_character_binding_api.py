import unreal as u,json,pathlib
r={}
for cls in ['SubobjectDataSubsystem','AddNewSubobjectParams','IKRetargeterController','IKRigController','ChildActorComponent']:
 c=getattr(u,cls)
 r[cls]={'doc':c.__doc__,'methods':{x:getattr(c,x).__doc__ for x in dir(c) if any(v in x for v in ['add_new','rename_sub','attach','controller','auto_','set_ik_rig','set_skeletal_mesh','child_actor','default_ops'])}}
pathlib.Path(u.Paths.project_saved_dir(),'character-binding-api.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
