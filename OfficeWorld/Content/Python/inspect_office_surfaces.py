import unreal as u,json,pathlib
def inspect_office_surfaces():
 r={};ML=u.MaterialEditingLibrary
 for path in ['/Game/FinishedOffice/Materials/M_Plant01_leaves','/Game/FinishedOffice/Materials/M_potted_plant_02_leaves','/Game/RealisticSample/Materials/M_Oak']:
  m=u.load_asset(path);r[path]={}
  for p in [u.MaterialProperty.MP_BASE_COLOR,u.MaterialProperty.MP_EMISSIVE_COLOR,u.MaterialProperty.MP_SUBSURFACE_COLOR,u.MaterialProperty.MP_NORMAL]:
   n=ML.get_material_property_input_node(m,p);d={'node':str(n)}
   if n:
    for k in ['texture','constant','r','const_a','const_b']:
     try:d[k]=str(n.get_editor_property(k))
     except:pass
   r[path][str(p)]=d
 pathlib.Path(u.Paths.project_saved_dir(),'office-surfaces.json').write_text(json.dumps(r,indent=2))
inspect_office_surfaces()
