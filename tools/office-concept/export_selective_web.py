import bpy,json,shutil
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
folder=root/'AssetSources/OfficeConcept/Bakes_20260912'
state=json.loads((folder/'selective_progress.json').read_text(encoding='utf8'))
assert state['finished'] and not state['errors']
web=folder/'Web';web.mkdir(exist_ok=True)
target=root/'OfficeWeb/public/assets/office-baked.glb'
backup=folder/'office-baked-before.glb'
if target.exists() and not backup.exists():shutil.copy2(target,backup)
s=bpy.context.scene
settings=s.render.image_settings
old_format=settings.file_format;old_quality=settings.quality;old_mode=settings.color_mode
settings.file_format='JPEG';settings.quality=85;settings.color_mode='RGB'
saved=[];temporary=[]
selection=list(bpy.context.selected_objects);active=bpy.context.view_layer.objects.active
try:
 bpy.ops.object.select_all(action='DESELECT')
 for row in state['entries']:
  o=bpy.data.objects[row['object']]
  if o.hide_render or not o.visible_get():continue
  # Evaluated geometry includes modifiers that can replace material slots.
  # Export a disposable copy so those modifiers cannot override baked maps.
  mesh=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()),preserve_all_data_layers=True,depsgraph=bpy.context.evaluated_depsgraph_get())
  name=o.name;saved.append((o,name));o.name='EXPORT_SOURCE_'+name
  duplicate=bpy.data.objects.new(name,mesh);s.collection.objects.link(duplicate)
  duplicate.matrix_world=o.matrix_world.copy()
  for key in o.keys():duplicate[key]=o[key]
  temporary.append(duplicate);duplicate.select_set(True)
  if not row['size']:continue
  duplicate['bake_samples']=row.get('samples',state.get('samples',96))
  duplicate['bake_denoised']=bool(row.get('denoised',False))
  duplicate['bake_resolution']=row['size']
  node=o.material_slots[0].material.node_tree.nodes.get('BAKE_OUTPUT_UNCONNECTED')
  output=web/(Path(row['file']).stem+'.jpg')
  node.image.save_render(str(output),scene=s)
  im=bpy.data.images.load(str(output),check_existing=False)
  mat=bpy.data.materials.new('Baked surface / '+name);mat.use_nodes=True
  nodes=mat.node_tree.nodes;links=mat.node_tree.links
  bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
  texture=nodes.new('ShaderNodeTexImage');texture.image=im
  links.new(texture.outputs['Color'],bsdf.inputs['Base Color'])
  bsdf.inputs['Roughness'].default_value=1
  for uv in list(mesh.uv_layers):
   if uv.name!='Bake_UV':mesh.uv_layers.remove(uv)
  mesh.uv_layers.active=mesh.uv_layers['Bake_UV'];mesh.uv_layers.active.active_render=True
  mesh.materials.clear();mesh.materials.append(mat)
  for polygon in mesh.polygons:polygon.material_index=0
 bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_cameras=False,export_lights=False,export_image_format='AUTO',export_materials='EXPORT',export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
finally:
 for duplicate in temporary:
  mesh=duplicate.data;bpy.data.objects.remove(duplicate,do_unlink=True)
  if mesh.users==0:bpy.data.meshes.remove(mesh)
 for o,name in saved:o.name=name
 bpy.ops.object.select_all(action='DESELECT')
 for o in selection:o.select_set(True)
 bpy.context.view_layer.objects.active=active
 settings.file_format=old_format;settings.quality=old_quality;settings.color_mode=old_mode
print('Exported bytes:',target.stat().st_size)
