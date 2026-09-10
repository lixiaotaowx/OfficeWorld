import unreal as u,pathlib,json
r=[]
for identity in ['Office_F01','Office_F02','Office_M01_Aoi','Office_M02']:
 mesh=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Body/SKM_'+identity+'_BodyMesh')
 for slot in mesh.materials:
  mat=slot.material_interface;parent=mat.get_editor_property('parent') if isinstance(mat,u.MaterialInstance) else None
  r.append({'id':identity,'mat':mat.get_path_name(),'parent':str(parent),'parent_class':parent.get_class().get_name() if parent else None})
pathlib.Path(u.Paths.project_saved_dir(),'body-mask-material-inspect.json').write_text(json.dumps(r,indent=2))
