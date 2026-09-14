import bpy,json,sys,traceback,shutil,time
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0,str(root/'tools/office-concept'))
from denoise_bake_images import make_denoiser,denoise_image,remove_denoiser
folder=root/'AssetSources/OfficeConcept/Bakes_20260912'
output=folder/'Monitors_20260913';output.mkdir(exist_ok=True)
manifest=folder/'selective_progress.json'
previous=json.loads(manifest.read_text(encoding='utf8'))
assert previous['finished'] and not previous['errors']
assert not bpy.app.driver_namespace.get('office_bake_running')
scene=bpy.context.scene
backup=folder.parent/'备份_降噪修复前_20260912.blend'
if not backup.exists():bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
if not (folder/'selective_before_denoise.json').exists():shutil.copy2(manifest,folder/'selective_before_denoise.json')
queue=[r.copy() for r in previous['entries'] if r['size'] and 'approved monitor' in r['object']]
for r in queue:r['size']=1024
queue.sort(key=lambda r:0 if r['object']=='Architecture / ivory floor' else 1)
state={'samples':256,'denoise':'Compositor Denoise High / Accurate with albedo and object-normal guides','total':len(queue),'done':[],'errors':[],'current':'','finished':False}
scene.render.engine='CYCLES';scene.render.bake.use_selected_to_active=False;scene.render.bake.margin=6
scene.cycles.samples=256;scene.cycles.use_denoising=True
scene.render.bake.normal_space='OBJECT'
processor=make_denoiser()
for row in [r for r in previous['entries'] if r['size']]:
 for slot in bpy.data.objects[row['object']].material_slots:
  mat=slot.material;nodes=mat.node_tree.nodes;links=mat.node_tree.links
  mix=nodes.get('BAKED_PREVIEW_SOURCE_BOUNCE')
  output_node=next(n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
  if mix:links.new(mix.inputs[1].links[0].from_socket,output_node.inputs['Surface'])
  target=nodes.get('BAKE_OUTPUT_UNCONNECTED')
  if target:
   for link in list(target.outputs['Color'].links):links.remove(link)
def progress():
 (output/'progress.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf8')
def restore():
 for row in previous['entries']:
  if not row['size']:continue
  for slot in bpy.data.objects[row['object']].material_slots:
   mat=slot.material;nodes=mat.node_tree.nodes;links=mat.node_tree.links
   target=nodes.get('BAKE_OUTPUT_UNCONNECTED');emission=nodes.get('BAKED_CAMERA_SURFACE');mix=nodes.get('BAKED_PREVIEW_SOURCE_BOUNCE')
   output_node=next(n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
   if target and emission:links.new(target.outputs['Color'],emission.inputs['Color'])
   if mix:links.new(mix.outputs[0],output_node.inputs['Surface'])
def step():
 if not queue:
  restore();remove_denoiser(processor)
  state['finished']=not state['errors'];progress()
  bpy.app.driver_namespace['office_bake_running']=False
  if not state['errors']:
   done={r['object']:r for r in state['done']}
   for row in previous['entries']:
    if row['object'] in done:row.update(done[row['object']])
   previous['samples']=256;previous['denoised']=True
   manifest.write_text(json.dumps(previous,ensure_ascii=False,indent=2),encoding='utf8')
   bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
  return None
 row=queue.pop(0);obj=bpy.data.objects[row['object']];state['current']=obj.name;progress()
 hidden=obj.hide_get();images=[];targets=[]
 try:
  bpy.ops.object.select_all(action='DESELECT');obj.hide_set(False);obj.select_set(True)
  bpy.context.view_layer.objects.active=obj
  for slot in obj.material_slots:
   node=slot.material.node_tree.nodes.get('BAKE_OUTPUT_UNCONNECTED')
   targets.append((node,node.image));slot.material.node_tree.nodes.active=node
  for label in ['Radiance','Albedo','Normal']:
   image=bpy.data.images.new('Denoise '+label,width=row['size'],height=row['size'],alpha=True,float_buffer=True)
   if label=='Normal':image.colorspace_settings.name='Non-Color'
   images.append(image)
   for node,old in targets:node.image=image
   if label=='Radiance':bpy.ops.object.bake(type='COMBINED',pass_filter={'DIRECT','INDIRECT','DIFFUSE','EMIT'},uv_layer='Bake_UV')
   elif label=='Albedo':bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR'},uv_layer='Bake_UV')
   else:bpy.ops.object.bake(type='NORMAL',uv_layer='Bake_UV')
  filename=output/Path(row['file']).name
  if obj.name=='Architecture / ivory floor':
   images[0].filepath_raw=str(output/'floor_raw_256.png');images[0].file_format='PNG';images[0].save()
  denoise_image(processor,images,filename,row['size'])
  result=bpy.data.images.load(str(filename),check_existing=False)
  result.name='DENOISED_256_'+obj.name
  for node,old in targets:node.image=result
  row['file']=str(filename);row['samples']=256;row['denoised']=True;state['done'].append(row)
 except Exception as e:
  for node,old in targets:node.image=old
  state['errors'].append({'object':obj.name,'error':str(e)});queue.clear();traceback.print_exc()
 finally:
  obj.hide_set(hidden)
  for image in images:
   if image.users==0:bpy.data.images.remove(image)
 progress();return .2
bpy.app.driver_namespace['office_bake_running']=True
bpy.app.driver_namespace['office_denoise_state']=state
bpy.app.driver_namespace['office_denoise_step']=step
progress();bpy.app.timers.register(step,first_interval=1)
print('Started',len(queue),'individual 256-sample bakes with guided output denoising')


