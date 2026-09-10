import unreal as u,pathlib,json
s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
r={'pie':[w.get_path_name() for w in u.EditorLevelLibrary.get_pie_worlds(False)],'map':u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world().get_path_name(),'methods':{}}
for n in dir(s):
 if any(k in n for k in ['face','sculpt','blend','eye','skin','preview','state','head','parameter']):
  r['methods'][n]=str(getattr(s,n).__doc__)
pathlib.Path(u.Paths.project_saved_dir(),'reference-trial-api.json').write_text(json.dumps(r,indent=2))
