import unreal as u,pathlib,json,traceback
r={}
try:
 worlds=[w for w in u.EditorLevelLibrary.get_pie_worlds(False)]
 r['worlds']=[w.get_path_name() for w in worlds]
 w=worlds[0];pc=u.GameplayStatics.get_player_controller(w,0);pawn=u.GameplayStatics.get_player_pawn(w,0)
 r['pawn']=pawn.get_path_name() if pawn else None;r['actors']=[]
 for a in u.GameplayStatics.get_all_actors_of_class(w,u.Actor):
  if any(x in a.get_class().get_name() for x in ['OfficePerson','Office_M','Office_F','Colleague']) or a==pawn:
   item={'name':a.get_name(),'class':a.get_class().get_name(),'pos':str(a.get_actor_location()),'components':[]}
   for m in a.get_components_by_class(u.SkeletalMeshComponent):
    item['components'].append({'name':m.get_name(),'mesh':str(m.skeletal_mesh_asset),'visible':m.is_visible(),'anim':str(m.get_anim_instance()),'pelvis':str(m.get_socket_location('pelvis')),'foot_l':str(m.get_socket_location('foot_l'))})
   r['actors'].append(item)
 u.SystemLibrary.execute_console_command(w,'Shot ShowUI',pc)
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'live-metahuman-audit.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
