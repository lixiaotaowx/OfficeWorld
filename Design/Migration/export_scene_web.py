import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(r'G:/C/wendang/ChatGPT/youxi/OfficeWeb')
fixed=0
for m in bpy.data.materials:
 if not m.use_nodes:continue
 for out in [n for n in m.node_tree.nodes if n.type=='OUTPUT_MATERIAL']:
  for link in list(out.inputs['Surface'].links):
   if link.from_node.type=='TEX_IMAGE':
    tex=link.from_node;m.node_tree.links.remove(link)
    emission=m.node_tree.nodes.new('ShaderNodeEmission');emission.inputs['Strength'].default_value=1
    m.node_tree.links.new(tex.outputs['Color'],emission.inputs['Color']);m.node_tree.links.new(emission.outputs[0],out.inputs['Surface']);fixed+=1
bpy.ops.export_scene.gltf(filepath=str(root/'public/assets/office.glb'),export_format='GLB',export_cameras=False,export_lights=False,export_animations=False)
pts=[o.matrix_world@Vector(v) for o in bpy.context.scene.objects if o.type=='MESH' and not o.hide_render for v in o.bound_box]
r={'adapted_materials':fixed,'bounds':{'min':[min(v[i] for v in pts) for i in range(3)],'max':[max(v[i] for v in pts) for i in range(3)]},'bytes':(root/'public/assets/office.glb').stat().st_size}
(root/'reference/scene-export.json').write_text(json.dumps(r,indent=2));print('EXPORTED',r)
