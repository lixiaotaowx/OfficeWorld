import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
def build_working_colleagues():
 r={};language=u.InternationalizationLibrary.get_current_language()
 try:
  u.InternationalizationLibrary.set_current_language('en')
  assert u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world(),'Stop PIE first'
  path='/Game/OfficeInteraction/BP_WorkingColleague';bp=u.find_object(None,path+'.BP_WorkingColleague')
  if not bp:bp=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else B.create('/Game/OfficeInteraction','BP_WorkingColleague',u.SkeletalMeshActor.static_class())
  for name,typ in [('ActivityPhase','int'),('ActivityOffset','float')]:
   if name not in list(B.list_variables(bp)):B.add_variable(bp,name,typ)
  B.set_variable_instance_editable(bp,'ActivityOffset',True)
  g=B.get_graph(bp,'EventGraph');ed=u.BlueprintGraphEditor.get_graph_editor(g);ed.remove_nodes(list(B.find_nodes(g)));_BlueprintCache.invalidate(bp)
  def c(a,b):assert a.try_create_connection(b)
  def f(path):return ed.add_call_function_node(path)
  def get(n,cls=None):return ed.add_get_member_variable_node(n,cls) if cls else ed.add_get_member_variable_node(n)
  def play(asset):
   n=f('/Script/Engine.SkeletalMeshComponent:PlayAnimation');c(mesh.find_output_pin('SkeletalMeshComponent'),n.find_input_pin('self'));n.find_input_pin('NewAnimToPlay').set_pin_value('/Game/OfficeInteraction/Animations/'+asset+'.'+asset);n.find_input_pin('bLooping').set_pin_value('true');return n
  mesh=get('SkeletalMeshComponent','/Script/Engine.SkeletalMeshActor')
  # Native BeginPlay and Tick events are saved into the asset and run in packaged builds.
  begin=B.create_node(g,'AddEvent|EventBeginPlay',u.IntPoint(0,0))
  assert begin,'BeginPlay event'
  c(begin.find_output_pin('then'),play('Office_Work').find_input_pin('execute'))
  tick=B.create_node(g,'AddEvent|EventTick',u.IntPoint(0,400))
  assert tick,'Tick event'
  time=f('/Script/Engine.GameplayStatics:GetTimeSeconds');offset=get('ActivityOffset');plus=f('/Script/Engine.KismetMathLibrary:Add_DoubleDouble');c(time.find_output_pin('ReturnValue'),plus.find_input_pin('A'));c(offset.find_output_pin('ActivityOffset'),plus.find_input_pin('B'))
  mod=f('/Script/Engine.KismetMathLibrary:Percent_FloatFloat');c(plus.find_output_pin('ReturnValue'),mod.find_input_pin('A'));mod.find_input_pin('B').set_pin_value('25')
  greater=f('/Script/Engine.KismetMathLibrary:Greater_DoubleDouble');c(mod.find_output_pin('ReturnValue'),greater.find_input_pin('A'));greater.find_input_pin('B').set_pin_value('20')
  branch=ed.add_branch_node();c(tick.find_output_pin('then'),branch.find_input_pin('execute'));c(greater.find_output_pin('ReturnValue'),branch.find_input_pin('Condition'))
  phase=get('ActivityPhase')
  for output,value,asset in [('then',1,'Office_Acknowledge'),('else',0,'Office_Work')]:
   neq=f('/Script/Engine.KismetMathLibrary:NotEqual_IntInt');c(phase.find_output_pin('ActivityPhase'),neq.find_input_pin('A'));neq.find_input_pin('B').set_pin_value(str(value));guard=ed.add_branch_node();c(branch.find_output_pin(output),guard.find_input_pin('execute'));c(neq.find_output_pin('ReturnValue'),guard.find_input_pin('Condition'))
   setp=ed.add_set_member_variable_node('ActivityPhase');setp.find_input_pin('ActivityPhase').set_pin_value(str(value));c(guard.find_output_pin('then'),setp.find_input_pin('execute'));c(setp.find_output_pin('then'),play(asset).find_input_pin('execute'))
  B.compile_blueprint(bp);assert not ed.list_nodes_with_errors(),str(ed.list_nodes_with_errors());u.EditorAssetLibrary.save_loaded_asset(bp)
  E=u.get_editor_subsystem(u.EditorActorSubsystem);actors={a.get_actor_label():a for a in E.get_all_level_actors()};r['actors']=[]
  for i,(label,gender,x,y) in enumerate([('DemoColleague_A02_LinKe','Quinn',-25,-125),('DemoColleague_A03_ZhouChen','Manny',-355,275),('DemoColleague_A04_ChenYi','Quinn',-25,275)]):
   old=actors.get(label)
   if old:old.set_actor_hidden_in_game(True);old.set_is_temporarily_hidden_in_editor(True);old.set_folder_path('PendingReplacement/StandingPeople')
   newlabel='Working_'+label;a=actors.get(newlabel) or E.spawn_actor_from_class(bp.generated_class(),u.Vector(x,y,3),u.Rotator(pitch=0,yaw=180,roll=0));a.set_actor_label(newlabel);a.set_folder_path('OfficeInteraction/WorkingPeople');a.set_editor_property('ActivityOffset',i*7.5)
   m=a.skeletal_mesh_component;m.set_skeletal_mesh_asset(u.load_asset('/Game/Characters/Mannequins/Meshes/SKM_'+gender+'_Simple'));m.set_collision_enabled(u.CollisionEnabled.NO_COLLISION);m.set_animation_mode(u.AnimationMode.ANIMATION_SINGLE_NODE)
   d=m.get_editor_property('animation_data');d.anim_to_play=u.load_asset('/Game/OfficeInteraction/Animations/Office_Work');d.saved_looping=True;d.saved_playing=True;m.set_editor_property('animation_data',d);r['actors'].append(a.get_path_name())
  for a in E.get_all_level_actors():
   if a.get_actor_label()=='OfficePerson01_EditorPreview':a.set_actor_hidden_in_game(True)
  u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True
 except:r['error']=traceback.format_exc()
 finally:u.InternationalizationLibrary.set_current_language(language)
 pathlib.Path(u.Paths.project_saved_dir(),'working-colleagues-install.json').write_text(json.dumps(r,indent=2))
build_working_colleagues()
