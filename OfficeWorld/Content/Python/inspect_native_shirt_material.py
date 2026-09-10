import unreal as u,pathlib,json
m=u.load_asset('/Game/MetaHumans/Runtime/Office_F01/Clothing/Office_F01_Outfits');r=[]
for slot in m.materials:
 mat=slot.material_interface
 r.append({'slot':str(slot.material_slot_name),'mat':mat.get_path_name(),'vectors':[str(n) for n in u.MaterialEditingLibrary.get_vector_parameter_names(mat)],'scalars':[str(n) for n in u.MaterialEditingLibrary.get_scalar_parameter_names(mat)]})
pathlib.Path(u.Paths.project_saved_dir(),'native-shirt-material.json').write_text(json.dumps(r,indent=2))
