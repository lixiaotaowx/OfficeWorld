import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).resolve();E=u.get_editor_subsystem(u.EditorActorSubsystem);ML=u.MaterialEditingLibrary;r={}
def scalar(m,value,prop):
 n=ML.create_material_expression(m,u.MaterialExpressionConstant);n.r=value;ML.connect_material_property(n,'',prop)
try:
 for a in E.get_all_level_actors():
  if isinstance(a,u.RectLight):a.light_component.set_editor_property('intensity',4500.0 if a.get_actor_label()=='WindowLight' else 800.0)
  if isinstance(a,u.PostProcessVolume):
   s=a.settings;s.set_editor_property('auto_exposure_bias',-6.5);a.settings=s
 m=u.load_asset('/Game/RealisticSample/Materials/M_Glass');scalar(m,.015,u.MaterialProperty.MP_OPACITY);scalar(m,.12,u.MaterialProperty.MP_SPECULAR);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 m=u.load_asset('/Game/RealisticSample/Materials/M_Oak');flat=ML.create_material_expression(m,u.MaterialExpressionConstant3Vector);flat.constant=u.LinearColor(0,0,1,1);ML.connect_material_property(flat,'',u.MaterialProperty.MP_NORMAL);scalar(m,.72,u.MaterialProperty.MP_ROUGHNESS);ML.recompile_material(m);u.EditorAssetLibrary.save_loaded_asset(m)
 # Fully remove hidden repetitions from rendering, preserving the source actors.
 for a in E.get_all_level_actors():
  if a.get_actor_label() in ['DeskLamp_02','DeskLamp_04','Stationery_02','Stationery_03','DeskPlant_02','DeskPlant_03','Notebook_03','Furniture','Plants']:
   a.set_is_temporarily_hidden_in_editor(True);a.set_actor_hidden_in_game(True)
   if isinstance(a,u.StaticMeshActor):a.static_mesh_component.set_visibility(False,True)
 u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();u.EditorLevelLibrary.editor_set_game_view(True);u.EditorLevelLibrary.editor_invalidate_viewports();r={'saved':True,'exposure':-6.5,'window_lumens':4500,'ceiling_lumens':800,'glass_opacity':.015}
except Exception:r['error']=traceback.format_exc()
(root/'Saved/office-softened-finish.json').write_text(json.dumps(r,indent=2));print(r)
