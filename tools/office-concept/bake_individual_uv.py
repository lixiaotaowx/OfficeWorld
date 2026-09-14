import bpy,math,json,time,traceback
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept')
out=root/'Bakes_20260912';out.mkdir(exist_ok=True)
s=bpy.context.scene
assert '独立UV烘焙' in bpy.data.filepath
assert not bpy.app.driver_namespace.get('office_bake_running')
objects=[o for o in s.objects if o.type=='MESH' and len(o.data.polygons)]
# Smaller initial object makes the first bake easy to inspect.
objects.sort(key=lambda o:(0 if o.name=='Collaboration round table' else 1,o.name))
state={'total':len(objects),'done':[],'errors':[],'started':time.time(),'current':'','finished':False}
queue=list(objects)
bpy.app.driver_namespace['office_bake_state']=state
bpy.app.driver_namespace['office_bake_running']=True
s.render.engine='CYCLES';s.cycles.samples=24
s.render.bake.use_selected_to_active=False;s.render.bake.use_clear=True
s.render.bake.margin=8
s.render.image_settings.file_format='PNG'
def progress():
 (out/'progress.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf8')
def step():
 if not queue:
  bpy.app.driver_namespace['office_bake_running']=False
  state['finished']=True;progress();bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
  return None
 obj=queue.pop(0);state['current']=obj.name;progress()
 try:
  if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
  bpy.ops.object.select_all(action='DESELECT')
  hidden=obj.hide_get();obj.hide_set(False)
  obj.select_set(True);bpy.context.view_layer.objects.active=obj
  # Linked copies must each own their independent UV layout.
  obj.data=obj.data.copy();mesh=obj.data
  old=mesh.uv_layers.active
  source_uv=old.name if old else None
  uv=mesh.uv_layers.get('Bake_UV') or mesh.uv_layers.new(name='Bake_UV')
  mesh.uv_layers.active=uv
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
  bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.025,area_weight=0,correct_aspect=True,scale_to_bounds=True)
  bpy.ops.object.mode_set(mode='OBJECT')
  if source_uv:mesh.uv_layers[source_uv].active_render=True
  else:uv.active_render=True
  dims=obj.dimensions
  area=max(.01,2*(dims.x*dims.y+dims.x*dims.z+dims.y*dims.z))
  resolution=min(2048,max(128,2**math.ceil(math.log2(math.sqrt(area)*128))))
  if max(dims)>12 and area>150:resolution=4096
  idx=len(state['done'])+len(state['errors'])+1
  image=bpy.data.images.new(f'BAKE_{idx:03d}_{obj.name}',width=resolution,height=resolution,alpha=True)
  image.filepath_raw=str(out/f'{idx:03d}.png');image.file_format='PNG'
  if not obj.material_slots:
   mat=bpy.data.materials.new('Bake source neutral');mat.use_nodes=True;mesh.materials.append(mat)
  for slot in obj.material_slots:
   mat=slot.material.copy() if slot.material else bpy.data.materials.new('Bake source neutral')
   mat.use_nodes=True;slot.link='OBJECT';slot.material=mat
   nodes=mat.node_tree.nodes;links=mat.node_tree.links
   if source_uv:
    source=nodes.new('ShaderNodeUVMap');source.uv_map=source_uv;source.label='Original shading UV — preserved';source.location=(-1200,-400)
    for node in list(nodes):
     if node.type=='TEX_IMAGE' and not node.inputs['Vector'].is_linked:
      links.new(source.outputs['UV'],node.inputs['Vector'])
     elif node.type=='TEX_COORD':
      for link in list(node.outputs['UV'].links):links.new(source.outputs['UV'],link.to_socket)
   for node in nodes:node.select=False
   target=nodes.new('ShaderNodeTexImage');target.name='BAKE_OUTPUT_UNCONNECTED';target.label='Baked output — deliberately unconnected';target.image=image
   target.location=(max((n.location.x for n in nodes),default=0)+400,-650)
   target.select=True;nodes.active=target
  bpy.ops.object.bake(type='COMBINED',pass_filter={'DIRECT','INDIRECT','DIFFUSE','EMIT'},uv_layer='Bake_UV')
  image.save()
  obj.hide_set(hidden)
  state['done'].append({'object':obj.name,'file':image.filepath_raw,'size':resolution,'uv':'Bake_UV','source_uv':source_uv})
 except Exception as e:
  state['errors'].append({'object':obj.name,'error':str(e)})
  traceback.print_exc()
 progress()
 if len(state['done'])%20==0:bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
 return .2
bpy.app.timers.register(step,first_interval=1)
print('Started per-object smart-project and unconnected image bake queue:',len(queue))
