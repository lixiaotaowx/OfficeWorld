from ue_mcp import UnrealMCP
import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1];src=root/'AssetSources/Realistic/Finished/WorkstationUpgrade/keyboard';client=UnrealMCP()
def call(group,name,**args):
    r=client.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'editor_toolset.toolsets.'+group,'tool_name':name,'arguments':args}})
    if r.get('isError'):raise RuntimeError(r)
    for c in r.get('content',[]):
        if c.get('type')=='text':v=json.loads(c['text']);return v.get('returnValue',v)
def props(obj,values):
    fields=json.loads(call('object.ObjectTools','list_properties',instance=obj));assert set(values)<=set(fields),(values,fields.keys())
    assert call('object.ObjectTools','set_properties',instance=obj,values=json.dumps(values))
def node(mat,cls,values=None):
    n=call('material.MaterialTools','add_expression',material_or_function=mat,expression_class={'refPath':'/Script/Engine.MaterialExpression'+cls})
    if values:props(n,values)
    return n
def connect(a,b,pin=''):
    call('material.MaterialTools','connect_expressions',from_expression=a,from_output_name='',to_expression=b,to_input_name=pin)
def output(n,p):call('material.MaterialTools','connect_to_output',expression=n,output_name='',material_property='MP_'+p)
mesh=call('static_mesh.StaticMeshTools','import_file',folder_path='/Game/WorkstationUpgrade/Meshes',asset_name='SM_KeyboardG915',source_file=str(src/'G915_OriginalUV.fbx'),import_materials=False,import_textures=False,combine_meshes=True)[0]
tex=call('texture.TextureTools','import_file',folder_path='/Game/WorkstationUpgrade/Textures',asset_name='T_G915_Legends',source_file=str(src/'G915_Legends.png'))[0];props(tex,{'sRGB':True,'compressionSettings':'TC_BC7'})
save=[mesh['refPath'],tex['refPath']];materials={}
for kind,c,metal,rough in [('Keys',(.015,.02,.025),0,.54),('Metal',(.08,.095,.10),.75,.35),('Plastic',(.012,.016,.018),0,.55),('Rubber',(.008,.008,.009),0,.8),('Light',(.10,.32,.25),0,.35)]:
    mat=call('material.MaterialTools','create_material',folder_path='/Game/WorkstationUpgrade/Materials',asset_name='M_G915_'+kind);materials['G915_'+kind]=mat
    if kind=='Keys':
        t=node(mat,'TextureSample',{'texture':tex,'samplerType':'SAMPLERTYPE_Color'});inv=node(mat,'OneMinus');connect(t,inv)
        mul=node(mat,'Multiply',{'constB':.65});connect(inv,mul,'A');add=node(mat,'Add',{'constB':.015});connect(mul,add,'A');output(add,'BaseColor')
    else:output(node(mat,'Constant3Vector',{'constant':{'r':c[0],'g':c[1],'b':c[2],'a':1}}),'BaseColor')
    output(node(mat,'Constant',{'r':metal}),'Metallic');output(node(mat,'Constant',{'r':rough}),'Roughness')
    call('material.MaterialTools','recompile',material_or_function=mat);save.append(mat['refPath']);print(kind,'material ready',flush=True)
slots=call('static_mesh.StaticMeshTools','get_material_slots',mesh=mesh)
for slot in slots:
    mat=materials.get(slot,materials['G915_Plastic']);assert call('static_mesh.StaticMeshTools','set_material',mesh=mesh,slot_name=slot,material=mat)
assert call('asset.AssetTools','save_assets',asset_paths=save)
(root/'OfficeWorld/Saved/keyboard-upgrade-import.json').write_text(json.dumps({'mesh':mesh,'slots':slots,'materials':materials,'bounds':call('static_mesh.StaticMeshTools','get_bounds',mesh=mesh),'saved':save},indent=2))
print('Keyboard imported and saved',flush=True)
