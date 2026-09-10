import unreal as u,json,pathlib
def inspect_office_animation():
 result={}
 for name in ['AnimationDataController','AnimPoseExtensions','AnimPose','AnimSequence','AnimationBlueprintLibrary','Skeleton','AnimSequenceFactory','AnimPoseEvaluationOptions']:
  cls=getattr(u,name,None)
  result[name]={'doc':str(getattr(cls,'__doc__','')),'methods':{n:str(getattr(getattr(cls,n),'__doc__','')) for n in dir(cls) if any(k in n for k in ['bone','pose','controller','frame','track','skeleton','sequence_length'])}}
 pathlib.Path(u.Paths.project_saved_dir(),'office-animation-api.json').write_text(json.dumps(result,indent=2))
inspect_office_animation()
