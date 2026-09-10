import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();E=u.get_editor_subsystem(u.EditorActorSubsystem);ML=u.MaterialEditingLibrary;report={}
def scalar(m,value,prop):
 n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=value;ML.connect_material_property(n,'',prop)
try:
 world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world();assert 'OfficeNatural_A' in world.get_path_name();lights=[]
 for a in E.get_all_level_actors():
  label=a.get_actor_label()
  if isinstance(a,u.RectLight):
   c=a.light_component;c.set_editor_property('intensity_units',u.LightUnits.LUMENS)
   window=label=='WindowLight';c.set_editor_property('intensity',8500.0 if window else 600.0);c.set_editor_property('use_temperature',True);c.set_editor_property('temperature',5200.0 if window else 3100.0)
   c.set_editor_property('light_color',u.Color(255,255,255,255));lights.append({'label':label,'lumens':c.intensity})
  if isinstance(a,u.DirectionalLight):a.set_actor_rotation(u.Rotator(pitch=-24,yaw=12,roll=0),False);a.light_component.set_editor_property('intensity',2.5);a.light_component.set_editor_property('light_source_angle',6.0)
  if isinstance(a,u.PostProcessVolume):
   s=a.settings;s.set_editor_property('auto_exposure_bias',-5.0);a.settings=s
  # Reduce repetition through different prop combinations and placement.
  if label in ['DeskLamp_02','DeskLamp_04','Stationery_02','Stationery_03','DeskPlant_02','DeskPlant_03','Notebook_03']:
   a.set_is_temporarily_hidden_in_editor(True);a.set_actor_hidden_in_game(True)
  if label=='Notebook_01':a.set_actor_rotation(u.Rotator(pitch=0,yaw=-12,roll=0),False);a.set_actor_location(u.Vector(-350,215,75.6),False,False)
  if label=='Notebook_02':a.set_actor_rotation(u.Rotator(pitch=0,yaw=18,roll=0),False)
  if label=='Notebook_04':a.set_actor_scale3d(u.Vector(.8,.8,.8));a.set_actor_rotation(u.Rotator(pitch=0,yaw=-8,roll=0),False)
  if label=='Stationery_04':a.set_actor_rotation(u.Rotator(pitch=0,yaw=90,roll=0),False);a.set_actor_location(u.Vector(-120,170,75.6),False,False)
 m=u.load_asset('/Game/FinishedOffice/Materials/M_desk_lamp_arm_01')
 if m:
  n=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);n.constant=u.LinearColor(.025,.028,.026,1);ML.connect_material_property(n,'',u.MaterialProperty.MP_BASE_COLOR);scalar(m,.55,u.MaterialProperty.MP_ROUGHNESS);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 for name in ['M_Plant01_leaves','M_potted_plant_02_leaves']:
  m=u.load_asset('/Game/FinishedOffice/Materials/'+name)
  if m:scalar(m,.88,u.MaterialProperty.MP_ROUGHNESS);scalar(m,.08,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 u.get_editor_subsystem(u.LevelEditorSubsystem).editor_set_viewport_realtime(True)
 if hasattr(u.EditorLevelLibrary,'editor_set_game_view'):u.EditorLevelLibrary.editor_set_game_view(True)
 u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-520,350,160),u.Rotator(pitch=-4,yaw=-36,roll=0));u.EditorLevelLibrary.editor_invalidate_viewports();u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
 report={'saved':True,'lights':lights,'exposure_bias':-5.0,'decor':'different prop sets per station; charcoal lamps; low specular foliage'}
except Exception:report['error']=traceback.format_exc()
(root/'Saved/office-lighting-deepening.json').write_text(json.dumps(report,indent=2));print(report)
