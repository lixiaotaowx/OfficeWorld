import unreal as u,json,pathlib,traceback
def show_office_people():
 r={}
 try:
  world=u.EditorLevelLibrary.get_game_world();pc=u.GameplayStatics.get_player_controller(world,0);pawn=u.GameplayStatics.get_player_pawn(world,0)
  people=[a for a in u.GameplayStatics.get_all_actors_of_class(world,u.SkeletalMeshActor) if a.get_actor_label().startswith('DemoColleague_')]
  r['colleagues']=[{'name':a.get_actor_label(),'visible':a.skeletal_mesh_component.is_visible(),'location':str(a.get_actor_location())} for a in people]
  r['pawn']=pawn.get_class().get_name();r['own_mesh_visible']=pawn.mesh.is_visible() and not pawn.mesh.get_editor_property('owner_no_see')
  pawn.set_actor_location(u.Vector(-250,-5,100),False,False);pawn.set_actor_rotation(u.Rotator(pitch=0,yaw=70,roll=0),False);pawn.character_movement.stop_movement_immediately();pc.set_control_rotation(u.Rotator(pitch=-15,yaw=70,roll=0))
  r['third_person']=bool(pawn.get_component_by_class(u.SpringArmComponent));r['passed']=len(people)==3 and r['own_mesh_visible'] and r['third_person']
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'visible-avatars-verified.json').write_text(json.dumps(r,indent=2))
show_office_people()
