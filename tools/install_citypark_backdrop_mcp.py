from ue_mcp import UnrealMCP
import json,pathlib,shutil
root=pathlib.Path(__file__).resolve().parents[1];src=root/'Design/Generated/CityPark';client=UnrealMCP()
def call(group,tool_name,**args):
 r=client.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'editor_toolset.toolsets.'+group,'tool_name':tool_name,'arguments':args}})
 if r.get('isError'):
  if tool_name=='import_file':
   path=args['folder_path']+'/'+args['asset_name']
   if call('asset.AssetTools','exists',path=path):return [call('asset.AssetTools','load_asset',asset_path=path)]
  raise RuntimeError(r)
 for c in r.get('content',[]):
  if c.get('type')=='text':v=json.loads(c['text']);return v.get('returnValue',v)
def props(obj,values):
 fields=json.loads(call('object.ObjectTools','list_properties',instance=obj));assert set(values)<=set(fields),(set(values)-set(fields))
 assert call('object.ObjectTools','set_properties',instance=obj,values=json.dumps(values))
assert call('scene.SceneTools','get_current_level')=='/Game/Maps/OfficeNatural_A'
backup=root/'Backups/BeforeCityParkBackdrop_20260908';backup.mkdir(exist_ok=True)
if not (backup/'OfficeNatural_A.umap').exists():shutil.copy2(root/'OfficeWorld/Content/Maps/OfficeNatural_A.umap',backup/'OfficeNatural_A.umap')
mesh=call('static_mesh.StaticMeshTools','import_file',folder_path='/Game/ExteriorBackdrop/Meshes',asset_name='SM_CityParkArc',source_file=str(src/'CityParkArc.fbx'),import_materials=False,import_textures=False,combine_meshes=True)[0]
tex=call('texture.TextureTools','import_file',folder_path='/Game/ExteriorBackdrop/Textures',asset_name='T_CityParkPanorama',source_file=str(src/'FutureCityPark_Panorama.png'))[0]
props(tex,{'sRGB':True,'compressionSettings':'TC_BC7'})
mat={'refPath':'/Game/ExteriorBackdrop/Materials/M_CityParkPanorama.M_CityParkPanorama'}
props(mat,{'shadingModel':'MSM_Unlit','twoSided':True,'bIsSky':False})
for old in call('material.MaterialTools','get_expressions',material_or_function=mat):call('material.MaterialTools','delete_expression',material_or_function=mat,expression=old)
sample=call('material.MaterialTools','add_expression',material_or_function=mat,expression_class={'refPath':'/Script/Engine.MaterialExpressionTextureSample'})
props(sample,{'texture':tex,'samplerType':'SAMPLERTYPE_Color'})
mul=call('material.MaterialTools','add_expression',material_or_function=mat,expression_class={'refPath':'/Script/Engine.MaterialExpressionMultiply'})
props(mul,{'constB':220.0})
call('material.MaterialTools','connect_expressions',from_expression=sample,from_output_name='RGB',to_expression=mul,to_input_name='A')
call('material.MaterialTools','connect_to_output',expression=mul,output_name='',material_property='MP_EmissiveColor')
call('material.MaterialTools','recompile',material_or_function=mat)
for slot in call('static_mesh.StaticMeshTools','get_material_slots',mesh=mesh):call('static_mesh.StaticMeshTools','set_material',mesh=mesh,slot_name=slot,material=mat)
actor=call('scene.SceneTools','add_to_scene_from_asset',asset_path=mesh['refPath'],name='FutureCityPark_PanoramicBackdrop',xform={'location':{'x':0,'y':0,'z':100},'rotation':{'pitch':0,'yaw':0,'roll':0},'scale':{'x':.375,'y':.375,'z':.375}},snap_to_ground=False)
print('Actor',actor,flush=True)
component=call('actor.ActorTools','get_root_component',actor=actor)
fields=json.loads(call('object.ObjectTools','list_properties',instance=component))
values={k:v for k,v in {'castShadow':False,'bAffectDistanceFieldLighting':False,'bAffectDynamicIndirectLighting':False,'bVisibleInRayTracing':False,'bReceivesDecals':False}.items() if k in fields};props(component,values)
# Preserve the complete body-instance schema while disabling background collision.
body=json.loads(call('object.ObjectTools','get_properties',instance=component,properties=['bodyInstance']))['bodyInstance'];body['collisionEnabled']='NoCollision';props(component,{'bodyInstance':body})
paths=[mesh['refPath'],tex['refPath'],mat['refPath'],'/Game/Maps/OfficeNatural_A']
assert call('asset.AssetTools','save_assets',asset_paths=paths)
(src/'installation.json').write_text(json.dumps({'actor':actor,'component':component,'material':mat,'brightness_node':mul,'saved':paths,'bounds':call('actor.ActorTools','get_actor_bounds',actor=actor)},indent=2))
print('Backdrop saved',flush=True)

