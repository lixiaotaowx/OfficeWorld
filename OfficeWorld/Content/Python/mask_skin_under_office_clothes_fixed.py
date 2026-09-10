"""Per-character skin coverage mask; preserves rig and the original skin shader."""
raise RuntimeError('Withdrawn after runtime QA: altered skin appearance and masking ineffective. Original F01 skin restored. Do not apply this candidate.')
import unreal as u,pathlib,json,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
root=pathlib.Path(u.Paths.project_dir()).resolve();identity=json.loads((root/'Saved/independent-person-job.json').read_text())['id'];r={'id':identity}
try:
 assert not u.EditorLevelLibrary.get_pie_worlds(False)
 body=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/Body/SKM_'+identity+'_BodyMesh');original=body.materials[0].material_interface
 folder='/Game/OfficeInteraction/Clothing/'+identity+'/SkinCoverageFixed';assets=u.AssetToolsHelpers.get_asset_tools();edit=u.MaterialEditingLibrary
 def clone_chain(material,depth=0):
  name='Covered_'+str(depth)+'_'+material.get_name();path=folder+'/'+name
  copy=u.load_asset(path) if u.EditorAssetLibrary.does_asset_exist(path) else assets.duplicate_asset(name,folder,material)
  if isinstance(material,u.MaterialInstance):
   parent=clone_chain(material.get_editor_property('parent'),depth+1);edit.set_material_instance_parent(copy,parent);edit.update_material_instance(copy)
  else:
   copy.set_editor_property('blend_mode',u.BlendMode.BLEND_MASKED)
   # These comparisons use bind-pose coordinates, so sitting cannot clip hands.
   def expr(cls):return edit.create_material_expression(copy,cls)
   def constant(v):n=expr(u.MaterialExpressionConstant);n.r=v;return n
   def link(a,out,b,pin):
    names=list(edit.get_material_expression_input_names(b));aliases={'Input':0,'AGreaterThanB':2,'AEqualsB':3,'ALessThanB':4}
    if pin not in names and pin in aliases:pin=names[aliases[pin]]
    assert edit.connect_material_expressions(a,out,b,pin),(b.get_class().get_name(),names,pin)
   r['uses_material_attributes']=copy.get_editor_property('use_material_attributes')
   pos=expr(u.MaterialExpressionPreSkinnedPosition);height=expr(u.MaterialExpressionComponentMask)
   for key,value in {'r':False,'g':False,'b':True,'a':False}.items():height.set_editor_property(key,value)
   link(pos,'',height,'Input');xy=expr(u.MaterialExpressionComponentMask)
   for key,value in {'r':True,'g':True,'b':False,'a':False}.items():xy.set_editor_property(key,value)
   link(pos,'',xy,'Input')
   radius=expr(u.MaterialExpressionDotProduct);link(xy,'',radius,'A');link(xy,'',radius,'B');one=constant(1);zero=constant(0)
   def greater(a,threshold,yes,no):
    n=expr(u.MaterialExpressionIf);link(a,'',n,'A');link(constant(threshold),'',n,'B');link(yes,'',n,'AGreaterThanB');link(yes,'',n,'AEqualsB');link(no,'',n,'ALessThanB');return n
   coverage=greater(height,90,one,zero)
   if identity=='Office_F02':
    calf=greater(height,49,zero,greater(height,10,one,zero));coverage=greater(height,90,one,calf)
   mask=greater(radius,38*38,one,coverage)
   if r['uses_material_attributes']:
    previous=edit.get_material_property_input_node(copy,u.MaterialProperty.MP_MATERIAL_ATTRIBUTES);output=edit.get_material_property_input_node_output_name(copy,u.MaterialProperty.MP_MATERIAL_ATTRIBUTES)
    # Fixed-layout BreakMaterialAttributes avoids the unsafe dynamic pin-array API.
    attributes=expr(u.MaterialExpressionBreakMaterialAttributes);link(previous,output,attributes,'')
    outputs=list(edit.get_material_expression_output_names(attributes));copy.set_editor_property('use_material_attributes',False);r['preserved_attributes']=[]
    properties={'BaseColor':'MP_BASE_COLOR','Metallic':'MP_METALLIC','Specular':'MP_SPECULAR','Roughness':'MP_ROUGHNESS','Anisotropy':'MP_ANISOTROPY','EmissiveColor':'MP_EMISSIVE_COLOR','Opacity':'MP_OPACITY','Normal':'MP_NORMAL','Tangent':'MP_TANGENT','WorldPositionOffset':'MP_WORLD_POSITION_OFFSET','SubsurfaceColor':'MP_SUBSURFACE_COLOR','ClearCoat':'MP_CLEAR_COAT','ClearCoatRoughness':'MP_CLEAR_COAT_ROUGHNESS','AmbientOcclusion':'MP_AMBIENT_OCCLUSION','Refraction':'MP_REFRACTION','PixelDepthOffset':'MP_PIXEL_DEPTH_OFFSET','ShadingModel':'MP_SHADING_MODEL'}
    for name in outputs:
     key=name.replace(' ','');prop=properties.get(key)
     if prop and hasattr(u.MaterialProperty,prop) and edit.connect_material_property(attributes,name,getattr(u.MaterialProperty,prop)):r['preserved_attributes'].append(key)
    assert all(k in r['preserved_attributes'] for k in ['BaseColor','Normal','Roughness']),r
   assert edit.connect_material_property(mask,'',u.MaterialProperty.MP_OPACITY_MASK)
   edit.recompile_material(copy)
  assert u.EditorAssetLibrary.save_loaded_asset(copy,False)
  return copy
 material=clone_chain(original);bp=u.load_asset('/Game/MetaHumans/Runtime/'+identity+'/BP_'+identity)
 S=u.get_engine_subsystem(u.SubobjectDataSubsystem);L=u.SubobjectDataBlueprintFunctionLibrary
 objects=[L.get_object_for_blueprint(L.get_data(h),bp) for h in S.k2_gather_subobject_data_for_blueprint(bp)]
 component=next(o for o in objects if o and o.get_name()=='Body_GEN_VARIABLE');component.set_material(0,material)
 B.compile_blueprint(bp);r['saved']=u.EditorAssetLibrary.save_loaded_asset(bp,False);r['material']=material.get_path_name()
except Exception:r['error']=traceback.format_exc()
(root/('Saved/'+identity+'-skin-coverage.json')).write_text(json.dumps(r,indent=2),encoding='utf-8')
