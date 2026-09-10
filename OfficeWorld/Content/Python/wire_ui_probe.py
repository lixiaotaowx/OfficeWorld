import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
r={};lang=u.InternationalizationLibrary.get_current_language()
try:
 u.InternationalizationLibrary.set_current_language('en')
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');_BlueprintCache.invalidate(bp);g=B.get_graph(bp,'EventGraph')
 code='''(event "OnClicked(PeopleButton)"
 (Widget|SetVisibility :self (Variables|WBP_OfficeHUD|GetPeoplePanel) :InVisibility "Visible"))'''
 B.write_graph_dsl(g,code);r['compiled']=True;u.EditorAssetLibrary.save_loaded_asset(bp)
except Exception:r['error']=traceback.format_exc()
finally:u.InternationalizationLibrary.set_current_language(lang)
pathlib.Path(u.Paths.project_saved_dir(),'ui-wire-probe.json').write_text(json.dumps(r,indent=2))
