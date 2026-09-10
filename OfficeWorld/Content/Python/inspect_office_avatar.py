import unreal as u,json,pathlib,traceback
r={}
try:
 for path in ['/Game/FirstPerson/Blueprints/BP_FirstPersonCharacter','/Game/FirstPerson/Blueprints/BP_FirstPersonGameMode']:
  bp=u.load_asset(path);c=u.get_default_object(bp.generated_class());r[path]={'class':str(c),'components':[]}
  for comp in c.get_components_by_class(u.ActorComponent):
   d={'name':comp.get_name(),'class':comp.get_class().get_name()}
   for key in ['relative_location','relative_rotation','only_owner_see','owner_no_see','skeletal_mesh_asset','anim_class','use_pawn_control_rotation','default_pawn_class']:
    try:d[key]=str(comp.get_editor_property(key))
    except:pass
   r[path]['components'].append(d)
  if isinstance(c,u.GameModeBase):r[path]['pawn']=str(c.default_pawn_class)
 r['world']=str(u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world())
except:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'avatar-inspect.json').write_text(json.dumps(r,indent=2))
