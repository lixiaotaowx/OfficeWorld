import unreal as u,json,pathlib,traceback
def import_office_motion():
 r={}
 try:
  root=pathlib.Path(u.Paths.project_saved_dir());data=json.loads((root/'office-authored-motion.json').read_text());skeleton=u.load_asset('/Game/Characters/Mannequins/Meshes/SK_Mannequin');assets=[]
  for name,v in data.items():
   path='/Game/OfficeInteraction/Animations/'+name
   a=u.find_object(None,path+'.'+name)
   if not a:
    if u.EditorAssetLibrary.does_asset_exist(path):a=u.load_asset(path)
    else:
     f=u.AnimSequenceFactory();f.target_skeleton=skeleton;f.preview_skeletal_mesh=u.load_asset('/Game/Characters/Mannequins/Meshes/SKM_Quinn_Simple');a=u.AssetToolsHelpers.get_asset_tools().create_asset(name,'/Game/OfficeInteraction/Animations',u.AnimSequence,f)
   assert a,path
   c=a.controller;c.open_bracket('Authored office action',False);c.set_frame_rate(u.FrameRate(30,1),False);c.set_number_of_frames(u.FrameNumber(v['frames']),False);c.remove_all_bone_tracks(False)
   for b,t in v['tracks'].items():
    if not c.add_bone_curve(b,False):continue
    assert c.set_bone_track_keys(b,[u.Vector(*x) for x in t['p']],[u.Quat(*x) for x in t['q']],[u.Vector(*t['s'][0]) for _ in t['p']],False),b
   c.close_bracket(False);u.EditorAssetLibrary.save_loaded_asset(a);assets.append(path)
  r['assets']=assets;r['saved']=True
 except:r['error']=traceback.format_exc()
 pathlib.Path(u.Paths.project_saved_dir(),'office-motion-import.json').write_text(json.dumps(r,indent=2))
import_office_motion()
