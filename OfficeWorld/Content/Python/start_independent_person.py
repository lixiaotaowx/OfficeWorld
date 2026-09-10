import unreal as u,pathlib,json,traceback,datetime
root=pathlib.Path(u.Paths.convert_relative_path_to_full(u.Paths.project_dir())).parent
job=json.loads((root/'OfficeWorld/Saved/independent-person-job.json').read_text(encoding='utf-8'))
manifest=json.loads((root/'Design/Characters/office_people.json').read_text(encoding='utf-8'))
spec=next(x for x in manifest['characters'] if x['id']==job['id'])
r={'id':spec['id'],'started':datetime.datetime.now().isoformat()}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False),'Wait for the scene task to stop PIE'
 c=u.load_asset('/Game/MetaHumans/Office/'+spec['id']);assert c
 s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
 r['editing']=s.is_object_added_for_editing(c) or s.try_add_object_to_edit(c);assert r['editing']
 col=s.get_preview_collection(c);assert col
 item=u.load_asset('/MetaHumanCharacter/Optional/Grooms/Bindings/Hair/WI_'+spec['hair']);assert item
 keys=col.get_item_keys_for_wardrobe_item(item)
 key=keys[0] if keys else col.try_add_item_from_wardrobe_item('Hair',item)
 assert key is not None
 col.default_instance.set_single_slot_selection('Hair',key)
 for slot in ['Beard','Mustache']:col.default_instance.set_single_slot_selection(slot,u.MetaHumanPaletteItemKey())
 s.on_edit_preview_collection(c)
 r['saved_before_rig']=u.EditorAssetLibrary.save_loaded_asset(c,False)
 s.request_auto_rigging(c,u.MetaHumanCharacterAutoRiggingRequestParams(report_progress=False,blocking=False))
 r['rig_request_submitted']=True
except Exception:r['error']=traceback.format_exc()
(root/('OfficeWorld/Saved/'+spec['id']+'-rig-request.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
