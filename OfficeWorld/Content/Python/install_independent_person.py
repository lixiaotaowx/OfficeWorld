import unreal as u,pathlib,json,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
root=pathlib.Path(u.Paths.project_dir()).resolve();job=json.loads((root/'Saved/independent-person-job.json').read_text(encoding='utf-8'));identity=job['id'];r={'id':identity}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 visual=u.load_asset('/Game/OfficeInteraction/MetaHuman/BP_Visual_'+identity);assert visual
 if identity in ['Office_M01','Office_M01_Aoi']:
  bp=u.load_asset('/Game/OfficeInteraction/BP_OfficeCharacter');S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
  children=[L.get_object_for_blueprint(L.get_data(h),bp) for h in S.k2_gather_subobject_data_for_blueprint(bp)]
  child=next(o for o in children if o and o.get_name()=='OfficePerson_GEN_VARIABLE')
  child.set_child_actor_class(visual.generated_class());B.compile_blueprint(bp)
  r['blueprint_saved']=u.EditorAssetLibrary.save_loaded_asset(bp,False)
 else:
  suffix={'Office_F01':'A02_LinKe','Office_M02':'A03_ZhouChen','Office_F02':'A04_ChenYi'}[identity]
  actor=next(a for a in u.get_editor_subsystem(u.EditorActorSubsystem).get_all_level_actors() if a.get_actor_label()=='Working_DemoColleague_'+suffix)
  child=next(c for c in actor.get_components_by_class(u.ChildActorComponent) if c.get_name()=='OfficePerson')
  child.set_child_actor_class(visual.generated_class());r['actor']=actor.get_actor_label();r['child_class']=str(child.get_editor_property('child_actor_class'))
 r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
(root/('Saved/'+identity+'-installed.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
