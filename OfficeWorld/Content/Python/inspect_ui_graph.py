import unreal as u,json,pathlib,dataclasses
from editor_toolset.toolsets.blueprint import BlueprintTools as B
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph')
r={'nodes':[str(x) for x in B.get_node_infos(B.find_nodes(g))]}
lang=u.InternationalizationLibrary.get_current_language()
try:
 u.InternationalizationLibrary.set_current_language('en')
 from editor_toolset.toolsets.blueprint import _BlueprintCache
 _BlueprintCache.invalidate(bp)
 filters=['SetText(Text)','SetVisibility','ShowMouseCursor','CreateWidget','AddtoViewport','SetInputMode','GetOwningPlayer','GetPlayerPawn','GetPlayerController','GetActorLocation','VectorLength','SetActorLocation','SetControlRotation','GetGameTime','Construct','Tick','IsInputKey','JustPressed','SetIgnoreMove','SetMovementMode','CharacterMovement','GetNearby','OnClicked','SeatButton']
 r['types']={f:list(B.find_node_types(g,f)) for f in filters}
 chosen=['Widget|SetText(Text)','Widget|SetVisibility']
 r['pins']={t:str(B.get_node_type_pins(g,t)) for t in chosen}
finally:
 u.InternationalizationLibrary.set_current_language(lang);_BlueprintCache.invalidate(bp)
pathlib.Path(u.Paths.project_saved_dir(),'ui-graph-inspection.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
