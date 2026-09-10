import unreal as u,pathlib,json
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();E=u.get_editor_subsystem(u.EditorActorSubsystem)
r=[]
for a in E.get_all_level_actors():
 if a.get_actor_label() in ['Architecture','D1_RealWoodDesk_01','C1_RealMeshChair_01','RealPlant01_01']:
  origin,extent=a.get_actor_bounds(False);r.append({'label':a.get_actor_label(),'origin':[origin.x,origin.y,origin.z],'extent':[extent.x,extent.y,extent.z]})
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(470,-350,170),u.Rotator(pitch=-8,yaw=140,roll=0));u.EditorLevelLibrary.editor_invalidate_viewports()
u.get_editor_subsystem(u.LevelEditorSubsystem).editor_set_viewport_realtime(True)
r.append({'camera':str(u.EditorLevelLibrary.get_level_viewport_camera_info()),'viewport_methods':[n for n in dir(u.get_editor_subsystem(u.LevelEditorSubsystem)) if 'viewport' in n or 'realtime' in n]})
(root/'Saved/layout-bounds.json').write_text(json.dumps(r,indent=2))
