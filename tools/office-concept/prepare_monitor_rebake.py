import bpy,json,math
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
assert Path(bpy.data.filepath).name=='备份_独立UV烘焙_20260912.blend'
assert not bpy.app.driver_namespace.get('office_bake_running')
backup=root/'AssetSources/OfficeConcept/备份_显示器重烘焙前_20260913.blend'
assert not backup.exists(),'Backup already exists; inspect before rerunning'
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
for obj in list(bpy.context.scene.objects):
 if 'approved monitor' not in obj.name:continue
 for slot in obj.material_slots:
  old=slot.material
  target=old.node_tree.nodes.get('BAKE_OUTPUT_UNCONNECTED')
  image=target.image if target else None
  mat=bpy.data.materials.new(obj.name+' / simple ivory');mat.use_nodes=True
  nodes=mat.node_tree.nodes;bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
  bsdf.inputs['Base Color'].default_value=(.72,.70,.65,1)
  bsdf.inputs['Roughness'].default_value=.55
  bsdf.inputs['Metallic'].default_value=0
  node=nodes.new('ShaderNodeTexImage');node.name='BAKE_OUTPUT_UNCONNECTED';node.image=image
  node.location=(-300,-300);node.label='Baked output only - not connected'
  nodes.active=node;slot.material=mat
 bpy.ops.object.select_all(action='DESELECT');obj.hide_set(False);obj.select_set(True)
 bpy.context.view_layer.objects.active=obj
 if not obj.data.uv_layers.get('Bake_UV'):obj.data.uv_layers.new(name='Bake_UV')
 obj.data.uv_layers.active=obj.data.uv_layers['Bake_UV']
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.025,correct_aspect=True,scale_to_bounds=True)
 bpy.ops.object.mode_set(mode='OBJECT')
print('Prepared nine monitors; backed up current user scene; original geometry preserved')
