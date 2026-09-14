import bpy,json,time,traceback
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/Bakes_20260912')
previous=json.loads((root/'progress.json').read_text(encoding='utf8'))
assert previous['finished'] and not previous['errors']
assert not bpy.app.driver_namespace.get('office_bake_running')
s=bpy.context.scene
table_names={'Collaboration round table','Meeting / oval table','Manager / desk','Island_A top','Island_B top','Coffee / countertop','Coffee / peninsula','Lounge / coffee tabletop'}
def resolution(o):
 n=o.name.lower(); dims=sorted(o.dimensions)
 if o.hide_render:return 0
 if any(k in n for k in ['glass','glazing','display','plant','erce exterior','diffuser','machine panel']):return 0
 if o.name in table_names or n in ['architecture / ivory floor','meeting floor tone']:return 2048
 if any(k in n for k in ['trim','clip','caster','stem','arm support','chair base','chair arm','stool leg','drawer pull','mullion','rail','frame','upright','slat','cable','door handle','mouse','mug','pen cup','coffee cup']):return 0
 if dims[1]<.15:return 0
 if any(k in n for k in ['wall','rug','color panel','curved','cabinets']):return 1024
 if dims[2]>=1:return 1024
 if dims[1]<.28:return 256
 return 512
entries=[]
for row in previous['done']:
 o=bpy.data.objects[row['object']]
 row['previous_size']=row['size'];row['size']=resolution(o)
 row['mode']='baked' if row['size'] else 'source_material'
 entries.append(row)
state={'total':len(entries),'entries':entries,'done':[],'errors':[],'finished':False,'current':''}
queue=[r for r in entries if r['size']]
s.cycles.samples=96
s.render.bake.margin=12
s.render.bake.use_clear=True
bpy.app.driver_namespace['office_bake_running']=True
bpy.app.driver_namespace['office_refine_state']=state
def save_progress():
 (root/'selective_progress.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf8')
def step():
 if not queue:
  state['finished']=True;bpy.app.driver_namespace['office_bake_running']=False
  save_progress();bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
  return None
 row=queue.pop(0);o=bpy.data.objects[row['object']];state['current']=o.name
 hidden=o.hide_get()
 try:
  bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True)
  bpy.context.view_layer.objects.active=o
  image=None
  for slot in o.material_slots:
   node=slot.material.node_tree.nodes.get('BAKE_OUTPUT_UNCONNECTED')
   assert node and not node.outputs['Color'].is_linked
   slot.material.node_tree.nodes.active=node;image=node.image
  image.scale(row['size'],row['size'])
  bpy.ops.object.bake(type='COMBINED',pass_filter={'DIRECT','INDIRECT','DIFFUSE','EMIT'},uv_layer='Bake_UV')
  image.save();state['done'].append(o.name)
 except Exception as e:
  state['errors'].append({'object':o.name,'error':str(e)});traceback.print_exc()
 finally:o.hide_set(hidden)
 save_progress()
 return .2
bpy.app.driver_namespace['office_refine_callback']=step
save_progress();bpy.app.timers.register(step,first_interval=1)
print(json.dumps({'baked':len(queue),'source_only':len(entries)-len(queue),'sizes':{str(i):sum(r['size']==i for r in entries) for i in [0,256,512,1024,2048]}}))
