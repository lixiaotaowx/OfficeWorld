import unreal as u,pathlib,json,traceback
r={'project_dirty':[],'other_dirty':[]}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 packages=list(u.EditorLoadingAndSavingUtils.get_dirty_content_packages())+list(u.EditorLoadingAndSavingUtils.get_dirty_map_packages())
 project=[]
 for p in packages:
  name=p.get_name();r['project_dirty' if name.startswith('/Game/') else 'other_dirty'].append(name)
  if name.startswith('/Game/'):project.append(p)
 r['saved']=u.EditorLoadingAndSavingUtils.save_packages(project,False) if project else True
 r['map_saved']=u.get_editor_subsystem(u.LevelEditorSubsystem).save_current_level()
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'character-cache-restart-preflight.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
