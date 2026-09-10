import unreal as u,pathlib,json,traceback
root=pathlib.Path(u.Paths.project_dir()).resolve().parent;r={}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 folder='/Game/MetaHumans/Trials/Conform';source=u.load_asset(folder+'/SK_RefWoman_Face_R07');assert source
 opts=u.FbxImportUI();opts.import_mesh=True;opts.import_as_skeletal=True;opts.mesh_type_to_import=u.FBXImportType.FBXIT_SKELETAL_MESH;opts.automated_import_should_detect_type=False;opts.skeleton=source.skeleton
 opts.create_physics_asset=False;opts.import_materials=False;opts.import_textures=False;opts.import_animations=False
 opts.skeletal_mesh_import_data.set_editor_property('update_skeleton_reference_pose',False);opts.skeletal_mesh_import_data.set_editor_property('use_t0_as_ref_pose',False)
 t=u.AssetImportTask();t.filename=str(root/'Design/Characters/ReferenceWomanTrial/Conform/Face_Compact_A.fbx');t.destination_path=folder;t.destination_name='SK_RefWoman_CompactTemplate';t.automated=True;t.replace_existing=False;t.save=True;t.options=opts;t.factory=u.FbxFactory()
 assets=u.AssetToolsHelpers.get_asset_tools();assets.import_asset_tasks([t]);mesh=next(o for o in t.get_objects() if isinstance(o,u.SkeletalMesh));r['template']=mesh.get_path_name()
 assert not u.EditorAssetLibrary.does_asset_exist('/Game/MetaHumans/Trials/RefWoman_B01')
 c=assets.duplicate_asset('RefWoman_B01','/Game/MetaHumans/Trials',u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01'));s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem);assert s.try_add_object_to_edit(c)
 options=u.ImportFromTemplateParams();options.isolate_head_from_body=True;options.match_vertices_by_u_vs=True;options.use_eye_meshes=True;options.use_teeth_mesh=True;options.alignment_options=u.MetaHumanAlignmentOptions.NONE
 result=s.import_from_template(c,mesh,None,None,None,options);r['result']=str(result);assert result==u.ImportErrorCode.SUCCESS,r
 s.commit_face_state(c);r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False);r['landmarks']=[[p.x,p.y,p.z] for p in s.get_face_landmarks(c)]
 E=u.get_editor_subsystem(u.EditorActorSubsystem);old=next(a for a in E.get_all_level_actors() if a.get_actor_label()=='RefWoman_A01_MetaHumanPreview');old.set_actor_location(u.Vector(400,0,0),False,False)
 actor=s.spawn_meta_human_actor(c,False);assert actor;actor.set_actor_label('RefWoman_B01_MetaHumanPreview');actor.set_actor_location(u.Vector(0,0,0),False,False)
 s.assemble_for_preview(c);r['preview']=actor.get_path_name();r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level();E.clear_actor_selection_set()
except Exception:r['error']=traceback.format_exc()
(root/'OfficeWorld/Saved/reference-compact-face-import.json').write_text(json.dumps(r,indent=2))
