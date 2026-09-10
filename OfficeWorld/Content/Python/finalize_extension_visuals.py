import unreal as u,pathlib,json
E=u.get_editor_subsystem(u.EditorActorSubsystem);root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();report=[]
for a in E.get_all_level_actors():
 label=a.get_actor_label()
 if str(a.get_folder_path()).startswith('OfficeExtension'):
  if isinstance(a,u.StaticMeshActor):
   c=a.static_mesh_component;c.set_editor_property('lighting_channels',u.LightingChannels(channel0=False,channel1=True,channel2=False))
   if label.startswith('Extension_MeetingChair'):
    report.append({'name':label,'hidden':str(a.get_editor_property('hidden')),'visible':c.is_visible(),'scale':str(a.get_actor_scale3d()),'mesh':str(c.static_mesh),'properties':{k:str(c.get_editor_property(k)) for k in ['min_draw_distance','ld_max_draw_distance','visible_in_scene_capture_only','hidden_in_scene_capture']}})
    a.set_actor_hidden_in_game(False);a.set_is_temporarily_hidden_in_editor(False);c.set_visibility(True,True);c.set_hidden_in_game(False,True);c.set_editor_property('min_draw_distance',0.0);c.set_editor_property('ld_max_draw_distance',0.0)
  if isinstance(a,u.RectLight):a.light_component.set_editor_property('lighting_channels',u.LightingChannels(channel0=True,channel1=True,channel2=False))
assert u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
(root/'Saved/extension-final-visuals.json').write_text(json.dumps(report,indent=2))

