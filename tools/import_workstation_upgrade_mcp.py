"""Background native MCP asset import; does not simulate input or focus windows."""
from ue_mcp import UnrealMCP
import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]
src=root/'AssetSources/Realistic/Finished/WorkstationUpgrade'
client=UnrealMCP()
def call(group,name,**args):
    r=client.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'editor_toolset.toolsets.'+group,'tool_name':name,'arguments':args}})
    if r.get('isError'):raise RuntimeError(r)
    for c in r.get('content',[]):
        if c.get('type')=='text':
            v=json.loads(c['text']);return v.get('returnValue',v)
def props(obj,values):
    fields=json.loads(call('object.ObjectTools','list_properties',instance=obj))
    assert set(values)<=set(fields),(values,fields.keys())
    assert call('object.ObjectTools','set_properties',instance=obj,values=json.dumps(values))
def ref(p):return {'refPath':p}
report={}
for kind,name in [('monitor','MonitorG8'),('mouse','MouseMX4')]:
    meshpath='/Game/WorkstationUpgrade/Meshes/SM_'+name
    mesh=call('asset.AssetTools','load_asset',asset_path=meshpath) if call('asset.AssetTools','exists',path=meshpath) else call('static_mesh.StaticMeshTools','import_file',folder_path='/Game/WorkstationUpgrade/Meshes',asset_name='SM_'+name,source_file=str(src/kind/(kind+'_UE.fbx')),import_materials=False,import_textures=False,combine_meshes=True)[0]
    path='/Game/WorkstationUpgrade/Materials/M_'+name
    mat=call('asset.AssetTools','load_asset',asset_path=path) if call('asset.AssetTools','exists',path=path) else call('material.MaterialTools','create_material',folder_path='/Game/WorkstationUpgrade/Materials',asset_name='M_'+name)
    existing=call('material.MaterialTools','get_expressions',material_or_function=mat)
    for e in existing:call('material.MaterialTools','delete_expression',material_or_function=mat,expression=e)
    save=[mesh['refPath'],path]
    for channel,output in [('BaseColor','MP_BaseColor'),('Roughness','MP_Roughness'),('Metallic','MP_Metallic'),('Emissive','MP_EmissiveColor')]:
        texpath='/Game/WorkstationUpgrade/Textures/T_'+kind+'_'+channel
        tex=call('asset.AssetTools','load_asset',asset_path=texpath) if call('asset.AssetTools','exists',path=texpath) else call('texture.TextureTools','import_file',folder_path='/Game/WorkstationUpgrade/Textures',asset_name='T_'+kind+'_'+channel,source_file=str(src/kind/(kind+'_'+channel+'.png')))[0]
        rgb=channel in ['BaseColor','Emissive']
        props(tex,{'sRGB':rgb,'compressionSettings':'TC_BC7' if rgb else 'TC_Masks'})
        e=call('material.MaterialTools','add_expression',material_or_function=mat,expression_class=ref('/Script/Engine.MaterialExpressionTextureSample'))
        props(e,{'texture':tex,'samplerType':'SAMPLERTYPE_Color' if rgb else 'SAMPLERTYPE_Masks'})
        call('material.MaterialTools','connect_to_output',expression=e,output_name='RGB' if rgb else 'R',material_property=output)
        save.append(tex['refPath'])
    call('material.MaterialTools','recompile',material_or_function=mat)
    slots=call('static_mesh.StaticMeshTools','get_material_slots',mesh=mesh)
    for slot in slots:call('static_mesh.StaticMeshTools','set_material',mesh=mesh,slot_name=slot,material=mat)
    assert call('asset.AssetTools','save_assets',asset_paths=save)
    report[kind]={'mesh':mesh,'material':mat,'bounds':call('static_mesh.StaticMeshTools','get_bounds',mesh=mesh),'saved':save}
    print(kind,'imported and saved',flush=True)
(root/'OfficeWorld/Saved/workstation-upgrade-import.json').write_text(json.dumps(report,indent=2))
