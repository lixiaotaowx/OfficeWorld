"""Optional packaged-runtime probe, gated by -OfficeWorldSmokeTest."""
import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
def build():
 r={};lang=u.InternationalizationLibrary.get_current_language()
 try:
  u.InternationalizationLibrary.set_current_language('en');E=u.get_editor_subsystem(u.EditorActorSubsystem);assert E.get_all_level_actors(),'Stop PIE'
  path='/Game/OfficeInteraction/BP_RuntimeSmokeProbe';bp=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else B.create('/Game/OfficeInteraction','BP_RuntimeSmokeProbe',u.Actor.static_class())
  if 'RunMovement' not in list(B.list_variables(bp)):B.add_variable(bp,'RunMovement','bool')
  g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g);ed.remove_nodes(list(B.find_nodes(g)));_BlueprintCache.invalidate(bp)
  def c(a,b):assert a.try_create_connection(b),(str(a),str(b))
  def f(path,**values):
   n=ed.add_call_function_node(path)
   for key,value in values.items():assert n.find_input_pin(key).set_pin_value(str(value)),(path,key)
   return n
  def chain(pin,*nodes):
   for n in nodes:c(pin,n.find_input_pin('execute'));pin=n.find_output_pin('then')
   return pin
  def setv(value):n=ed.add_set_member_variable_node('RunMovement');n.find_input_pin('RunMovement').set_pin_value(value);return n
  def log(text):return f('/Script/Engine.KismetSystemLibrary:PrintString',InString=text,bPrintToScreen='false',bPrintToLog='true')
  pc=f('/Script/Engine.GameplayStatics:GetPlayerController');pawn=f('/Script/Engine.GameplayStatics:GetPlayerCharacter')
  command=f('/Script/Engine.KismetSystemLibrary:GetCommandLine');contains=f('/Script/Engine.KismetStringLibrary:Contains',Substring='-OfficeWorldSmokeTest',bUseCase='true');c(command.find_output_pin('ReturnValue'),contains.find_input_pin('SearchIn'))
  begin=B.create_node(g,'AddEvent|EventBeginPlay',u.IntPoint(0,0));guard=ed.add_branch_node();c(begin.find_output_pin('then'),command.find_input_pin('execute'));c(command.find_output_pin('then'),guard.find_input_pin('execute'));c(contains.find_output_pin('ReturnValue'),guard.find_input_pin('Condition'))
  delay=f('/Script/Engine.KismetSystemLibrary:Delay',Duration='8');pin=chain(guard.find_output_pin('then'),delay)
  inp=f('/Script/UMG.WidgetBlueprintLibrary:SetInputMode_GameOnly');c(pc.find_output_pin('ReturnValue'),inp.find_input_pin('PlayerController'))
  reset=f('/Script/Engine.Controller:ResetIgnoreMoveInput');c(pc.find_output_pin('ReturnValue'),reset.find_input_pin('self'));pin=chain(pin,inp,reset)
  # Hide only onboarding in this explicit test mode; keep the normal HUD visible.
  widgets=f('/Script/UMG.WidgetBlueprintLibrary:GetAllWidgetsOfClass',WidgetClass='/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C',TopLevelOnly='false');pin=chain(pin,widgets)
  arr=f('/Script/Engine.KismetArrayLibrary:Array_Get',Index='0');c(widgets.find_output_pin('FoundWidgets'),arr.find_input_pin('TargetArray'))
  help=ed.add_get_member_variable_node('HelpPanel','/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C');c(arr.find_output_pin('Item'),help.find_input_pin('self'));hide=f('/Script/UMG.Widget:SetVisibility',InVisibility='Collapsed');c(help.find_output_pin('HelpPanel'),hide.find_input_pin('self'));pin=chain(pin,hide)
  # Report live positions before/after actual Enhanced Input action processing.
  def position_log(prefix):
   loc=f('/Script/Engine.Actor:K2_GetActorLocation');c(pawn.find_output_pin('ReturnValue'),loc.find_input_pin('self'));conv=f('/Script/Engine.KismetStringLibrary:Conv_VectorToString');c(loc.find_output_pin('ReturnValue'),conv.find_input_pin('InVec'));join=f('/Script/Engine.KismetStringLibrary:Concat_StrStr',A=prefix);c(conv.find_output_pin('ReturnValue'),join.find_input_pin('B'));n=log('');c(join.find_output_pin('ReturnValue'),n.find_input_pin('InString'));return n
  pin=chain(pin,log('OFFICE_RUNTIME_SMOKE_START'),position_log('OFFICE_RUNTIME_POSITION_START='),setv('true'),f('/Script/Engine.KismetSystemLibrary:Delay',Duration='1'),setv('false'),position_log('OFFICE_RUNTIME_POSITION_END='),f('/Script/Engine.KismetSystemLibrary:Delay',Duration='2'))
  shot=f('/Script/Engine.KismetSystemLibrary:ExecuteConsoleCommand',Command='Shot ShowUI');c(pc.find_output_pin('ReturnValue'),shot.find_input_pin('SpecificPlayer'));chain(pin,shot,log('OFFICE_RUNTIME_SMOKE_SCREENSHOT_REQUESTED'))
  tick=B.create_node(g,'AddEvent|EventTick',u.IntPoint(0,900));moving=ed.add_get_member_variable_node('RunMovement');gate=ed.add_branch_node();c(tick.find_output_pin('then'),gate.find_input_pin('execute'));c(moving.find_output_pin('RunMovement'),gate.find_input_pin('Condition'))
  sub=B.create_node(g,'PlayerController|LocalPlayerSubsystems|GetEnhancedInputLocalPlayerSubsystem',u.IntPoint(300,900));c(pc.find_output_pin('ReturnValue'),sub.find_input_pin('PlayerController'))
  inject=f('/Script/EnhancedInput.EnhancedInputSubsystemInterface:InjectInputVectorForAction',Action='/Game/Input/Actions/IA_Move.IA_Move',Value='1,0,0');c(sub.find_output_pin('ReturnValue'),inject.find_input_pin('self'));c(gate.find_output_pin('then'),inject.find_input_pin('execute'))
  B.compile_blueprint(bp);r['errors']=[str(e) for e in ed.list_nodes_with_errors()];assert not r['errors'],r['errors'];assert u.EditorAssetLibrary.save_loaded_asset(bp,False)
  a=next((a for a in E.get_all_level_actors() if a.get_actor_label()=='RuntimeSmokeProbe'),None) or E.spawn_actor_from_class(bp.generated_class(),u.Vector());a.set_actor_label('RuntimeSmokeProbe');a.set_folder_path('OfficeInteraction/Diagnostics');u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True
 except:r['error']=traceback.format_exc()
 finally:u.InternationalizationLibrary.set_current_language(lang)
 pathlib.Path(u.Paths.project_saved_dir(),'runtime-smoke-probe-install.json').write_text(json.dumps(r,indent=2))
build()
