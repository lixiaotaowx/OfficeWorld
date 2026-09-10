import unreal as u,pathlib,json
r={};ML=u.MaterialEditingLibrary
for n in ['SagePlaster','SandPlaster','NaturalWood']:
 m=u.load_asset('/Game/NaturalOffice/Materials/M_'+n);node=ML.get_material_property_input_node(m,u.MaterialProperty.MP_BASE_COLOR);r[n]={'node':str(node),'constant':str(node.get_editor_property('constant')) if isinstance(node,u.MaterialExpressionConstant3Vector) else ''}
m=u.load_asset('/Game/DeliveryAssets/Materials/M_tree_small_02_leaves');node=ML.get_material_property_input_node(m,u.MaterialProperty.MP_OPACITY_MASK);r['leaf']={'node':str(node),'texture':str(node.texture)}
pathlib.Path(u.Paths.project_saved_dir(),'material-diagnostics.json').write_text(json.dumps(r,indent=2))
