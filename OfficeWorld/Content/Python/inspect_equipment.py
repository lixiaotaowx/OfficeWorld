import unreal as u,json,pathlib
def inspect_equipment():
 r={}
 for n in ['computerScreen','computerKeyboard','computerMouse']:
  m=u.load_asset('/Game/Campus/Assets/furniture_kit/'+n);r[n]={'bounds':str(m.get_bounding_box()),'materials':[str(x.material_interface) for x in m.static_materials]}
 pathlib.Path(u.Paths.project_saved_dir(),'office-equipment-inspect.json').write_text(json.dumps(r,indent=2))
inspect_equipment()
