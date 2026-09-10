import unreal as u,json,pathlib
E=u.get_editor_subsystem(u.EditorActorSubsystem)
for a in E.get_all_level_actors():
 if isinstance(a,u.DirectionalLight):a.set_actor_rotation(u.Rotator(pitch=-48,yaw=-150,roll=0),False);a.light_component.set_editor_property('use_temperature',True);a.light_component.set_editor_property('temperature',5500)
 if isinstance(a,u.SkyLight):a.light_component.set_editor_property('intensity',.2)
 if isinstance(a,u.PostProcessVolume):
  s=a.settings;s.set_editor_property('auto_exposure_bias',-2);a.settings=s
m=u.load_asset('/Game/DeliveryAssets/Materials/M_tree_small_02_leaves');ML=u.MaterialEditingLibrary
# Preserve leaf silhouettes in Nanite instead of simplified distant fallback.
mesh=u.load_asset('/Game/DeliveryAssets/Meshes/SM_tree_small_02');settings=mesh.get_editor_property('nanite_settings');settings.set_editor_property('shape_preservation',u.NaniteShapePreservation.PRESERVE_AREA);mesh.set_editor_property('nanite_settings',settings);u.EditorAssetLibrary.save_loaded_asset(mesh,False)
u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
