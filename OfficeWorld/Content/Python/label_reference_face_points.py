import unreal as u
s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');E=u.get_editor_subsystem(u.EditorActorSubsystem)
for a in E.get_all_level_actors():
 if a.get_actor_label().startswith('QA_FacePoint_'):E.destroy_actor(a)
for i,p in enumerate(s.get_face_landmarks(c)):
 if i not in [3,4,5,8,9,11,16,17,30,31,32,34,43,45,47,48,49,50,62,63,64,65,67,20,37,44,53]:continue
 a=E.spawn_actor_from_class(u.TextRenderActor,u.Vector(p.x,p.y+2,p.z));a.set_actor_label('QA_FacePoint_'+str(i));a.set_actor_rotation(u.Rotator(pitch=0,yaw=90,roll=0),False)
 a.set_editor_property('sprite_scale',0.0)
 t=a.get_component_by_class(u.TextRenderComponent);t.set_text(str(i));t.set_world_size(.42);t.set_text_render_color(u.Color(0,255,255,255))
E.clear_actor_selection_set();u.get_editor_subsystem(u.LevelEditorSubsystem).editor_invalidate_viewports()
