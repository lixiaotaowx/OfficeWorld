import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools
r={}
try:
 r['umg_classes']=[n for n in dir(u) if 'UMGTool' in n]
 r['blueprint_methods']=[n for n in dir(BlueprintTools) if not n.startswith('_')]
 r['umg_methods']={n:[m for m in dir(getattr(u,n)) if any(v in m for v in ['widget','event'])] for n in r['umg_classes']}
 r['widget_docs']={n:getattr(u,n).__doc__ for n in ['WidgetBlueprintFactory','SlateFontInfo']}
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-api.json').write_text(json.dumps(r,indent=2))
