import bpy,json,math,shutil
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
backup=root/'AssetSources/OfficeConcept/备份_键盘简化前_20260913.blend'
if not backup.exists():bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
texture=root/'AssetSources/OfficeConcept/Keyboard_Top_Generated.png'
shutil.copy2('C:/Users/Administrator/.codex/generated_images/01a07c69-d1ed-7f11-83be-efd6580ef0db/exec-e5b7c628-de92-4053-95c5-09f95dbdfeef.png',texture)
image=bpy.data.images.load(str(texture),check_existing=True)
side=bpy.data.materials.new('Keyboard / ivory enclosure');side.diffuse_color=(.72,.70,.64,1)
side.use_nodes=True;next(n for n in side.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value=(.72,.70,.64,1)
top=bpy.data.materials.new('Keyboard / generated top');top.use_nodes=True
nodes=top.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Roughness'].default_value=.8
top.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
objects=[o for o in bpy.context.scene.objects if 'approved keyboard' in o.name]
for o in objects:
 corners=[o.matrix_world@Vector(c) for c in o.bound_box]
 center=sum(corners,Vector())/8;bottom=min(c.z for c in corners)
 # Keep authored locations; conventional top texture faces the chair.
 face_north=o.name.startswith('Manager') or any(f'Seat_{i} ' in o.name for i in [2,4])
 bpy.ops.mesh.primitive_cube_add(size=1,location=(center.x,center.y,bottom+.009))
 cube=bpy.context.object;cube.dimensions=(.45,.15,.018)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 cube.data.materials.append(side);cube.data.materials.append(top)
 uv=cube.data.uv_layers.active
 for poly in cube.data.polygons:
  poly.material_index=1 if poly.normal.z>.9 else 0
  if poly.material_index:
   for loop in poly.loop_indices:
    v=cube.data.vertices[cube.data.loops[loop].vertex_index].co
    u=v.x/.45+.5;t=v.y/.15+.5
    if face_north:u=1-u;t=1-t
    uv.data[loop].uv=(u,t)
 old=o.data;o.modifiers.clear();o.data=cube.data
 o.matrix_world=cube.matrix_world.copy()
 for slot in o.material_slots:slot.link='DATA'
 bpy.data.objects.remove(cube,do_unlink=True)
 if old.users==0:bpy.data.meshes.remove(old)
 o['keyboard_simple']=True
manifest=root/'AssetSources/OfficeConcept/Bakes_20260912/selective_progress.json'
if not manifest.with_suffix('.before-keyboards.json').exists():shutil.copy2(manifest,manifest.with_suffix('.before-keyboards.json'))
state=json.loads(manifest.read_text(encoding='utf8'))
for row in state['entries']:
 if 'approved keyboard' in row['object']:
  row.update(size=0,mode='source_only',denoised=False,file='')
manifest.write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf8')
# This authored duplicate is A3; its mesh remains exactly as edited by the user.
chair=bpy.data.objects.get('Island_A_Seat_1 approved chair.001')
if chair:chair['seat_index']=2
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Simplified',len(objects),'keyboards, 12 triangles each, one shared texture')
