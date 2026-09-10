import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={}
try:
 t=u.get_default_object(u.UMGToolSet)
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD')
 if not bp:
  f=u.WidgetBlueprintFactory();f.set_editor_property('parent_class',u.UserWidget)
  bp=u.AssetToolsHelpers.get_asset_tools().create_asset('WBP_OfficeHUD','/Game/OfficeInteraction/UI',u.WidgetBlueprint,f)
  u.EditorAssetLibrary.save_loaded_asset(bp)
 r['asset']=bp.get_path_name()
 g=B.get_graph(bp,'EventGraph')
 r['graph']=g.get_path_name()
 filters=['SetText','SetVisibility','CreateWidget','GetPlayer','SetInputMode','SetShowMouse','GetActorLocation','SetActorLocation','GetDistance','IsInputKey','SetIgnoreMove','SetControlRotation','SetViewTarget','SetActive','GetOwningPlayer','GetOwningPlayerPawn']
 r['nodes']={f:list(B.find_node_types(g,f)) for f in filters}
 r['umg_call']=str(t.call_method('GetWidgets',(bp,)))
 r['font']=str(u.TextBlock().font)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-bootstrap.json').write_text(json.dumps(r,indent=2,ensure_ascii=False),encoding='utf-8')
