"""Replace only the 12 equipment actors through native APIs; preserve all gameplay."""
from ue_mcp import UnrealMCP
import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1];client=UnrealMCP()
def call(group,name,**args):
    r=client.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'editor_toolset.toolsets.'+group,'tool_name':name,'arguments':args}})
    if r.get('isError'):raise RuntimeError(r)
    for c in r.get('content',[]):
        if c.get('type')=='text':v=json.loads(c['text']);return v.get('returnValue',v)
def props(obj,values):
    fields=json.loads(call('object.ObjectTools','list_properties',instance=obj));assert set(values)<=set(fields)
    assert call('object.ObjectTools','set_properties',instance=obj,values=json.dumps(values))
assert call('scene.SceneTools','get_current_level')=='/Game/Maps/OfficeNatural_A'
actors=call('scene.SceneTools','get_actors_in_folder',folder_path='NaturalOffice/WorkstationEquipment',recursive=True)
before=[]
for a in actors:
    label=call('actor.ActorTools','get_label',actor=a);comp=call('actor.ActorTools','get_root_component',actor=a)
    before.append({'actor':a,'label':label,'component':comp,'transform':call('actor.ActorTools','get_actor_transform',actor=a),'properties':json.loads(call('object.ObjectTools','get_properties',instance=comp,properties=['staticMesh','overrideMaterials','bodyInstance']))})
backup=root/'Backups/BeforeWorkstationUpgrade_20260908/equipment-actors.json'
if not backup.exists():backup.write_text(json.dumps(before,indent=2))
changes=[]
for item in before:
    label=item['label'];index=int(label.rsplit('_',1)[1])-1;x,y=[(-385,-220),(-55,-220),(-385,180),(-55,180)][index]
    if 'Monitor' in label:name='MonitorG8';pos=(x+30,y-32,75.6);yaw=0;scale=1.0
    elif 'Keyboard' in label:name='KeyboardG915';pos=(x+30,y+3,75.6);yaw=0;scale=42/36.742183566
    elif 'Mouse' in label:name='MouseMX4';pos=(x+60,y+3,75.6);yaw=0;scale=1.0
    else:continue
    mesh={'refPath':'/Game/WorkstationUpgrade/Meshes/SM_'+name+'.SM_'+name}
    props(item['component'],{'staticMesh':mesh,'overrideMaterials':[]})
    xform={'location':dict(zip(['x','y','z'],pos)),'rotation':{'pitch':0,'yaw':yaw,'roll':0},'scale':{'x':scale,'y':scale,'z':scale}}
    assert call('actor.ActorTools','set_actor_transform',actor=item['actor'],xform=xform,worldspace=True)
    changes.append({'label':label,'mesh':mesh,'transform':xform,'bounds':call('actor.ActorTools','get_actor_bounds',actor=item['actor'])})
assert len(changes)==12
assert call('asset.AssetTools','save_assets',asset_paths=['/Game/Maps/OfficeNatural_A'])
(root/'OfficeWorld/Saved/workstation-upgrade-placement.json').write_text(json.dumps({'saved':True,'actors':changes,'scope':'12 equipment only; original component collision and gameplay unchanged'},indent=2))
print('Saved 12 upgraded equipment actors',flush=True)
