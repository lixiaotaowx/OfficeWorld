import unreal as u,json,pathlib
w=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();r={'game_mode':str(w.get_world_settings().default_game_mode),'assets':u.EditorAssetLibrary.list_assets('/Game/FirstPerson/Blueprints',True,False)}
from editor_toolset.toolsets.blueprint import BlueprintTools as B
for path in ['/Game/OfficeInteraction/BP_OfficeInteraction','/Game/OfficeInteraction/UI/WBP_OfficeHUD']:
 bp=u.load_asset(path);g=B.get_graph(bp,'EventGraph');r[path]=B.read_graph_dsl(g)
pathlib.Path(u.Paths.project_saved_dir(),'office-runtime-inspection.json').write_text(json.dumps(r,ensure_ascii=False,indent=2,default=str),encoding='utf-8')
