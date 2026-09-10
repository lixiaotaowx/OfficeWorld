import unreal as u,json,pathlib
w=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
a=u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors()
r={'world':w.get_path_name(),'actor_count':len(a),'labels':[x.get_actor_label() for x in a][:15]}
for name in ['BP_DefaultLegacyPipeline_High','BP_DefaultPipeline']:
 cls=u.load_class(None,'/MetaHumanCharacter/BuildPipeline/'+name+'.'+name+'_C')
 obj=u.get_default_object(cls)
 r[name]={x:str(getattr(obj,x)) for x in dir(obj) if not x.startswith('_') and not callable(getattr(obj,x))}
pathlib.Path(u.Paths.project_saved_dir(),'recovered-office-status.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
