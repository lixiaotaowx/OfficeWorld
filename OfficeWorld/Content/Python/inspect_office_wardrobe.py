import unreal as u,pathlib,json
c=u.load_asset('/Game/MetaHumans/Office/OfficePerson01')
s=u.get_editor_subsystem(u.MetaHumanCharacterEditorSubsystem)
col=c.internal_collection
r={'collection':str(col),'collection_api':{x:str(getattr(col,x)) for x in dir(col) if not x.startswith('_')},'preview':str(s.get_preview_collection(c))}
r['slots']=str(col.get_slot_names());r['items']=[str(k) for k in col.get_all_item_keys()]
r['selection']=str(col.default_instance.get_slot_selection_data())
r['add_doc']=col.try_add_item_from_wardrobe_item.__doc__
r['select_doc']=col.default_instance.set_single_slot_selection.__doc__
r['selected_api']=str(dir(col.default_instance))
for cls in ['MetaHumanCollection','MetaHumanCharacterInstance','MetaHumanCollectionEditorSubsystem','MetaHumanCharacterPaletteEditorSubsystem','MetaHumanCharacterInstanceEditorSubsystem']:
 if hasattr(u,cls):r[cls]=str(dir(getattr(u,cls)))
pathlib.Path(u.Paths.project_saved_dir(),'metahuman-wardrobe-inspect.json').write_text(json.dumps(r,indent=2),encoding='utf-8')
