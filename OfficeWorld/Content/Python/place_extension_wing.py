"""Add the new side wing only; do not modify existing actors/gameplay/lighting."""
import unreal as u,pathlib,json,shutil,traceback,math
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();base='/Game/OfficeExtension';E=u.get_editor_subsystem(u.EditorActorSubsystem);report={};created=[]
def spawn(name,mesh,p=(0,0,0),yaw=0,scale=1,rot=None,collision=True):
 a=next((a for a in E.get_all_level_actors() if a.get_actor_label()==name),None) or E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(*p));a.set_actor_label(name)
 a.static_mesh_component.set_static_mesh(u.load_asset(mesh));a.set_actor_location(u.Vector(*p),False,False);a.set_actor_rotation(u.Rotator(pitch=rot[0] if rot else 0,yaw=rot[1] if rot else yaw,roll=rot[2] if rot else 0),False);a.set_actor_scale3d(u.Vector(scale,scale,scale));a.set_folder_path('OfficeExtension')
 a.static_mesh_component.set_collision_profile_name('BlockAll' if collision else 'NoCollision');created.append(name);return a
def item(kind,name,p=(0,0,0),yaw=0,scale=1,rot=None,collision=True):return spawn(name,base+'/Meshes/SM_'+kind,p,yaw,scale,rot,collision)
def rect(name,p,rot,power,w,h):
 a=next((a for a in E.get_all_level_actors() if a.get_actor_label()==name),None) or E.spawn_actor_from_class(u.RectLight,u.Vector(*p));a.set_actor_label(name);a.set_actor_location(u.Vector(*p),False,False);a.set_actor_rotation(u.Rotator(pitch=rot[0],yaw=rot[1],roll=rot[2]),False);a.set_folder_path('OfficeExtension/Lighting');c=a.light_component;c.set_mobility(u.ComponentMobility.MOVABLE);c.set_editor_property('intensity',power);c.set_editor_property('source_width',w);c.set_editor_property('source_height',h);c.set_editor_property('attenuation_radius',1300.0);c.set_editor_property('use_temperature',True);c.set_editor_property('temperature',5200.0 if 'Window' in name else 3400.0);created.append(name)
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert '/Game/Maps/OfficeNatural_A' in world.get_path_name()
 backup=root.parent/'Backups/BeforeExtensionWing_20260908';backup.mkdir(exist_ok=True)
 if not (backup/'OfficeNatural_A.umap').exists():shutil.copy2(root/'Content/Maps/OfficeNatural_A.umap',backup/'OfficeNatural_A.umap')
 for name in ['Shell','Glazing','Joinery','Balls']:item(name,'Extension_'+name,collision=name not in ['Glazing','Balls'])
 # 8-foot table turned across the 6m room: minimum ~1.65m cue clearance.
 item('pool_table','Billiards_FinishedTable',(1100,-1200,0),90)
 item('cue_rack','Billiards_FinishedCueRack',(1150,-1436,160),rot=(0,0,90),collision=False)
 item('bench_press','Fitness_BenchPress',(1000,-835,0),180,.9)
 item('multigym','Fitness_MultiStation',(1240,-635,0),90)
 for i,(x,y) in enumerate([(970,-510),(1010,-510),(1050,-510)]):item('dumbbells','Fitness_Dumbbell_'+str(i),(x,y,35),scale=.85,collision=False)
 for i,y in enumerate([290,480]):item('toilet','Restroom_FinishedToilet_'+str(i),(1340,y,0),90)
 for i,(x,y,yaw) in enumerate([(1000,-280,-90),(1000,-200,-90),(1000,-120,-90),(1200,-280,90),(1200,-200,90),(1200,-120,90)]):spawn('Extension_MeetingChair_'+str(i),'/Game/FinishedOffice/Meshes/SM_C1_OrthopedicChair',(x,y,0),yaw)
 # Sparse approved decor, original PBR and leaf masks. Keep doorways clear.
 for i,p in enumerate([(1300,-1420,0),(1320,-430,0),(750,540,0)]):
  item('Planter','Extension_CalatheaPot_'+str(i),p,collision=False);item('calathea_orbifolia_01','Extension_Calathea_'+str(i),(p[0],p[1],p[2]+32),scale=1.5,collision=False)
 for i,p in enumerate([(1260,20,93),(1370,-960,82),(-305,-250,75.6)]):item('potted_plant_04','Approved_Succulent_'+str(i),p,collision=False)
 item('decorative_book_set_01','Approved_MeetingBooks',(1130,20,93),collision=False)
 item('ceramic_vase_01','Approved_CeramicVase',(1305,20,93),scale=.65,collision=False)
 # The same generated texture/material, on a second arc facing this facade.
 a=spawn('Extension_CityParkBackdrop','/Game/ExteriorBackdrop/Meshes/SM_CityParkArc',(800,-450,100),180,.375,collision=False);c=a.static_mesh_component
 for key in ['cast_shadow','affect_distance_field_lighting','affect_dynamic_indirect_lighting','visible_in_ray_tracing']:
  try:c.set_editor_property(key,False)
  except Exception:pass
 for i,y in enumerate([-1200,-700,-200,300]):
  rect('Extension_WindowLight_'+str(i),(1370,y,210),(0,180,0),6500,350,200)
  rect('Extension_CeilingLight_'+str(i),(1100,y,298),(-90,0,0),2200,160,65)
 for i,y in enumerate([-1200,-700,-200,300,550]):rect('Extension_CorridorLight_'+str(i),(700,y,298),(-90,0,0),1200,100,100)
 # Persist only the current level, after all extension actors are placed.
 assert u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();report={'saved':True,'actors':created,'scope':'Additive extension only; existing actors retained'}
except Exception:report['error']=traceback.format_exc();report['created_before_error']=created
(root/'Saved/extension-placement.json').write_text(json.dumps(report,indent=2));print(report)
