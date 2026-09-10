import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
r={}
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
 assert world is not None,'Stop PIE before installing visible avatars'
 E=u.get_editor_subsystem(u.EditorActorSubsystem)
 src='/Game/ThirdPerson/Blueprints/BP_ThirdPersonCharacter';dest='/Game/OfficeInteraction/BP_OfficeCharacter'
 bp=u.find_object(None,dest+'.BP_OfficeCharacter')
 if not bp:bp=u.load_asset(dest) if u.EditorAssetLibrary.does_asset_exist(dest) else u.AssetToolsHelpers.get_asset_tools().duplicate_asset('BP_OfficeCharacter','/Game/OfficeInteraction',u.load_asset(src))
 assert bp,'Character duplication failed'
 c=u.get_default_object(bp.generated_class());c.character_movement.set_editor_property('max_walk_speed',180)
 c.mesh.set_owner_no_see(False);c.mesh.set_only_owner_see(False)
 # Use short collision-tested spring arm suited to an office instead of template outdoor distance.
 S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
 r['components']=[]
 for handle in S.k2_gather_subobject_data_for_blueprint(bp):
  data=L.get_data(handle);obj=L.get_object(data);r['components'].append(str(obj))
  if isinstance(obj,u.SpringArmComponent):
   obj.set_editor_property('target_arm_length',210);obj.set_editor_property('socket_offset',u.Vector(0,35,45));obj.set_editor_property('do_collision_test',True)
  if isinstance(obj,u.CameraComponent):obj.set_field_of_view(80)
 B.compile_blueprint(bp);u.EditorAssetLibrary.save_loaded_asset(bp)
 gmPath='/Game/OfficeInteraction/BP_OfficeGameMode'
 gm=u.find_object(None,gmPath+'.BP_OfficeGameMode')
 if not gm:gm=u.load_asset(gmPath) if u.EditorAssetLibrary.does_asset_exist(gmPath) else u.AssetToolsHelpers.get_asset_tools().duplicate_asset('BP_OfficeGameMode','/Game/OfficeInteraction',u.load_asset('/Game/ThirdPerson/Blueprints/BP_ThirdPersonGameMode'))
 u.get_default_object(gm.generated_class()).set_editor_property('default_pawn_class',bp.generated_class());B.compile_blueprint(gm);u.EditorAssetLibrary.save_loaded_asset(gm)
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();world.get_world_settings().set_editor_property('default_game_mode',gm.generated_class())
 actors={a.get_actor_label():a for a in E.get_all_level_actors()}
 idle=u.load_asset('/Game/Characters/Mannequins/Anims/Unarmed/MM_Idle')
 assert idle,'Idle animation missing'
 r['people']=[]
 # Standing colleagues are placed alongside, not through, their corresponding chairs.
 for label,mesh,x,y,yaw in [('DemoColleague_A02_LinKe','Quinn',70,-90,-120),('DemoColleague_A03_ZhouChen','Manny',-460,270,-50),('DemoColleague_A04_ChenYi','Quinn',70,265,-125)]:
  a=actors.get(label) or E.spawn_actor_from_class(u.SkeletalMeshActor,u.Vector(x,y,4),u.Rotator(pitch=0,yaw=yaw,roll=0));a.set_actor_label(label);a.set_folder_path('OfficeInteraction/DemoPeople')
  a.set_actor_location(u.Vector(x,y,4),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=yaw,roll=0),False)
  m=a.skeletal_mesh_component;m.set_skeletal_mesh_asset(u.load_asset('/Game/Characters/Mannequins/Meshes/SKM_'+mesh+'_Simple'));m.set_animation_mode(u.AnimationMode.ANIMATION_SINGLE_NODE)
  anim=m.get_editor_property('animation_data');anim.set_editor_property('anim_to_play',idle);anim.set_editor_property('saved_looping',True);anim.set_editor_property('saved_playing',True);m.set_editor_property('animation_data',anim)
  m.set_collision_enabled(u.CollisionEnabled.NO_COLLISION);m.set_owner_no_see(False);m.set_visibility(True);a.set_actor_hidden_in_game(False);r['people'].append(a.get_path_name())
 # Fixed seated camera remains in first-person until a real seated animation is supplied.
 # This avoids presenting a standing mesh intersecting the chair as a seated animation.
 for a in E.get_all_level_actors():
  if isinstance(a,u.PlayerStart):a.set_actor_location(u.Vector(-280,-20,100),False,False);a.set_actor_rotation(u.Rotator(pitch=0,yaw=-45,roll=0),False)
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();r['saved']=True
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'visible-office-people.json').write_text(json.dumps(r,indent=2))
