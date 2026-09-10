import unreal as u,pathlib,json,traceback
r={};root=pathlib.Path(u.Paths.project_saved_dir());E=u.get_editor_subsystem(u.EditorActorSubsystem);L=u.get_editor_subsystem(u.LevelEditorSubsystem)
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 path='/Game/Maps/CharacterTrials/RefWoman_Studio_A01'
 assert not u.EditorAssetLibrary.does_asset_exist(path),'Never overwrite existing trial level'
 r['previous_map_saved']=L.save_current_level();assert r['previous_map_saved']
 assert L.new_level(path)
 assets=u.AssetToolsHelpers.get_asset_tools();folder='/Game/MetaHumans/Trials/Studio'
 mat=assets.create_asset('M_NeutralStudio',folder,u.Material,u.MaterialFactoryNew())
 color=u.MaterialEditingLibrary.create_material_expression(mat,u.MaterialExpressionConstant3Vector);color.constant=u.LinearColor(.20,.21,.23,1)
 u.MaterialEditingLibrary.connect_material_property(color,'',u.MaterialProperty.MP_BASE_COLOR)
 rough=u.MaterialEditingLibrary.create_material_expression(mat,u.MaterialExpressionConstant);rough.r=.85;u.MaterialEditingLibrary.connect_material_property(rough,'',u.MaterialProperty.MP_ROUGHNESS)
 u.MaterialEditingLibrary.recompile_material(mat);assert u.EditorAssetLibrary.save_loaded_asset(mat,False)
 def box(label,pos,scale):
  a=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(*pos));a.set_actor_label(label);a.static_mesh_component.set_static_mesh(u.load_asset('/Engine/BasicShapes/Cube'));a.static_mesh_component.set_material(0,mat);a.set_actor_scale3d(u.Vector(*scale));return a
 box('Studio_Floor',(0,0,-6),(12,12,.1));box('Studio_Backdrop',(0,-180,240),(12,.1,5))
 for label,pos,target,intensity in [('Studio_Key',(-130,210,245),(0,0,155),6000),('Studio_Fill',(140,130,180),(0,0,155),3000),('Studio_Rim',(50,-90,240),(0,0,155),4000)]:
  a=E.spawn_actor_from_class(u.RectLight,u.Vector(*pos));a.set_actor_label(label);a.set_actor_rotation(u.MathLibrary.find_look_at_rotation(u.Vector(*pos),u.Vector(*target)),False)
  light=a.get_component_by_class(u.RectLightComponent);light.set_intensity(intensity);light.set_editor_property('source_width',120);light.set_editor_property('source_height',160)
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 actor=s.spawn_meta_human_actor(c,False);assert actor
 actor.set_actor_label('RefWoman_A01_MetaHumanPreview');actor.set_actor_location(u.Vector(0,0,0),False,False)
 r['preview_actor']=actor.get_path_name();r['bounds']=str(actor.get_actor_bounds(False))
 for label,pos,target in [('Camera_FullBody',(0,350,112),(0,0,90)),('Camera_Face',(0,90,163),(0,8,163))]:
  a=E.spawn_actor_from_class(u.CameraActor,u.Vector(*pos));a.set_actor_label(label);a.set_actor_rotation(u.MathLibrary.find_look_at_rotation(u.Vector(*pos),u.Vector(*target)),False);a.camera_component.set_field_of_view(40 if label=='Camera_Face' else 45)
 u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(0,90,163),u.MathLibrary.find_look_at_rotation(u.Vector(0,90,163),u.Vector(0,8,163)))
 u.EditorLevelLibrary.editor_invalidate_viewports();r['map_saved']=L.save_current_level();r['map']=path
except Exception:r['error']=traceback.format_exc()
(root/'reference-woman-studio.json').write_text(json.dumps(r,indent=2))
