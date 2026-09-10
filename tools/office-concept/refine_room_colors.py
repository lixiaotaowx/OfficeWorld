import bpy,sys
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi');sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import box
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Room_Color_Refinement.blend'),copy=True)
for m in bpy.data.materials:
 if m.name.startswith('Atlas rug'):
  m['atlas_repeat_meters']=.85
  for n in m.node_tree.nodes:
   if n.type=='VECT_MATH' and n.operation=='SCALE' and n.inputs[3].default_value>1:
    n.inputs[3].default_value=1/.85
floor=bpy.data.objects['Architecture / ivory floor'].material_slots[0].material
nodes=floor.node_tree.nodes;links=floor.node_tree.links
p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
texture=next(n for n in nodes if n.type=='TEX_IMAGE')
brick=next(n for n in nodes if n.type=='TEX_BRICK')
brick.inputs['Color1'].default_value=(.76,.66,.51,1)
brick.inputs['Color2'].default_value=(.68,.59,.46,1)
brick.inputs['Mortar'].default_value=(.44,.38,.29,1)
brick.inputs['Mortar Size'].default_value=.004
mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.32
links.new(brick.outputs['Color'],mix.inputs[1]);links.new(texture.outputs['Color'],mix.inputs[2]);links.new(mix.outputs[0],p.inputs['Base Color'])
def variant(name,color,kind='wall'):
 m=floor.copy();m.name=name
 p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 tex=next(n for n in m.node_tree.nodes if n.type=='TEX_IMAGE')
 blend=m.node_tree.nodes.new('ShaderNodeMixRGB');blend.blend_type='MULTIPLY';blend.inputs[0].default_value=.16
 blend.inputs[1].default_value=(*color,1);m.node_tree.links.new(tex.outputs['Color'],blend.inputs[2]);m.node_tree.links.new(blend.outputs[0],p.inputs['Base Color'])
 p.inputs['Roughness'].default_value=.8
 return m
def uv(o):
 layer=o.data.uv_layers.new(name='Office_Metric_UV')
 for p in o.data.polygons:
  axis=max(range(3),key=lambda i:abs(p.normal[i]));axes=[i for i in range(3) if i!=axis]
  for l in p.loop_indices:
   v=o.data.vertices[o.data.loops[l].vertex_index].co;layer.data[l].uv=(v[axes[0]],v[axes[1]])
def panel(name,loc,dims,mat):
 old=bpy.data.objects.get(name)
 if old:bpy.data.objects.remove(old,do_unlink=True)
 o=box(name,loc,dims,mat,.005);uv(o)
meeting=variant('Meeting olive plaster',(.30,.36,.21))
manager=variant('Manager deep sage plaster',(.20,.27,.17))
panel('Meeting interior color panel',(3.75,8.035,1.6),(5.35,.035,3.15),meeting)
panel('Manager interior color panel',(8.8,8.035,1.6),(4.1,.035,3.15),manager)
side=bpy.data.objects['Architecture / manager side wall'];side.material_slots[0].link='OBJECT';side.material_slots[0].material=manager
roomfloor=variant('Meeting floor warm beige',(.60,.52,.39))
panel('Meeting floor tone',(3.75,6.0,.012),(5.35,4.28,.012),roomfloor)
rug=bpy.data.objects['Manager / rug'];mat=rug.material_slots[0].material.copy();mat.name='Manager warm grey woven rug'
rug.material_slots[0].link='OBJECT';rug.material_slots[0].material=mat
mix=next(n for n in mat.node_tree.nodes if n.type=='MIX_RGB');mix.inputs[0].default_value=.4;mix.inputs[1].default_value=(.49,.45,.37,1)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Coarser carpet weave, visible warm floor tiles and differentiated room colors saved.')
