import unreal as u,pathlib,json,traceback
r={};root=pathlib.Path(u.Paths.project_saved_dir());s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 c=u.load_asset('/Game/MetaHumans/Trials/RefWoman_A01');assert s.is_object_added_for_editing(c)
 before=s.get_face_landmarks(c);changes={}
 # Symmetric moderate eye opening, narrower jaw, shorter chin, softer small nose.
 for i in [18,19,20,22,33,35,36,37,44,51,52,53]:
  p=before[i];cx=3.2 if p.x>0 else -3.2
  changes[i]=u.Vector((p.x-cx)*.12,0,(p.z-163.4)*.24)
 for i in [1,2,28,29,43,63]:changes[i]=u.Vector(-before[i].x*.09,0,.12)
 for i in [3,30,62]:changes[i]=u.Vector(-before[i].x*.04,0,.45)
 for i in [45,67]:changes[i]=u.Vector(-before[i].x*.12,-.10,0)
 changes[64]=u.Vector(0,-.3,.05)
 s.translate_face_landmarks(c,list(changes),list(changes.values()));s.commit_face_state(c)
 col=s.get_preview_collection(c);item=u.load_asset('/MetaHumanCharacter/Optional/Grooms/Bindings/Hair/WI_Hair_S_Updo');assert item
 keys=col.get_item_keys_for_wardrobe_item(item);key=keys[0] if keys else col.try_add_item_from_wardrobe_item('Hair',item)
 col.default_instance.set_single_slot_selection('Hair',key)
 for slot in ['Beard','Mustache']:col.default_instance.set_single_slot_selection(slot,u.MetaHumanPaletteItemKey())
 s.on_edit_preview_collection(c)
 eyes=c.get_editor_property('eyes_settings')
 for side in ['eye_left','eye_right']:
  eye=getattr(eyes,side);eye.iris.global_tint=u.LinearColor(.55,.32,.16,1);eye.pupil.dilation=1.05;setattr(eyes,side,eye)
 s.commit_eyes_settings(c,eyes)
 r['changed_indices']=list(changes);r['before']=[[p.x,p.y,p.z] for p in before];r['after']=[[p.x,p.y,p.z] for p in s.get_face_landmarks(c)]
 r['saved']=u.EditorAssetLibrary.save_loaded_asset(c,False)
except Exception:r['error']=traceback.format_exc()
(root/'reference-woman-sculpt.json').write_text(json.dumps(r,indent=2))
