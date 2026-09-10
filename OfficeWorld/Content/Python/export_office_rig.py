import unreal as u,json,pathlib
def export_office_rig():
 a=u.load_asset('/Game/Characters/Mannequins/Anims/Unarmed/MM_Idle');p=u.AnimPoseExtensions.get_anim_pose_at_time(a,0,u.AnimPoseEvaluationOptions());mesh=u.load_asset('/Game/Characters/Mannequins/Meshes/SKM_Quinn_Simple')
 E=u.get_editor_subsystem(u.EditorActorSubsystem);actor=E.spawn_actor_from_class(u.SkeletalMeshActor,u.Vector(0,0,0));comp=actor.skeletal_mesh_component;comp.set_skeletal_mesh_asset(mesh)
 def tr(t):return {'p':[t.translation.x,t.translation.y,t.translation.z],'q':[t.rotation.x,t.rotation.y,t.rotation.z,t.rotation.w],'s':[t.scale3d.x,t.scale3d.y,t.scale3d.z]}
 data={str(b):{'parent':str(comp.get_parent_bone(b)),'local':tr(u.AnimPoseExtensions.get_bone_pose(p,b,u.AnimPoseSpaces.LOCAL)),'world':tr(u.AnimPoseExtensions.get_bone_pose(p,b,u.AnimPoseSpaces.WORLD))} for b in u.AnimPoseExtensions.get_bone_names(p)}
 E.destroy_actor(actor);pathlib.Path(u.Paths.project_saved_dir(),'office-rig.json').write_text(json.dumps(data,indent=2))
export_office_rig()
