import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
s=bpy.context.scene
assert not s.get('material_atlas_v1')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Material_Atlas.blend'),copy=True)
image=bpy.data.images.load(str(root/'AssetSources/OfficeConcept/Textures/Office_Materials_Atlas.png'),check_existing=True)
image.pack()
cache={};mapped=[];meshes=set()
def category(o,m):
 n=(o.name+' '+m.name).lower()
 if any(k in n for k in ['glaz','glass','display','screen','bulb','foliage','plant','leaf','pot','mug','keyboard','mouse']):return None
 if 'rug' in n or 'carpet' in n:return 'rug'
 if any(k in n for k in ['upholstery','cushion','continuous curved','armchair']):return 'fabric'
 if 'approved chair' in o.name and 'sage' in m.name.lower():return 'fabric'
 if any(k in n for k in ['wood','oak','timber','desk',' top','shelf','storage','coffee backing']):return 'wood' if 'backing' not in n else 'stone'
 if any(k in n for k in ['floor','wall','plaster','ivory','cream','divider','frame']):return 'stone'
 return None
def mapped_material(old,kind):
 key=(old.name,kind)
 if key in cache:return cache[key]
 m=old.copy();m.name='Atlas '+kind+' / '+old.name
 m.use_nodes=True;ns=m.node_tree.nodes;ls=m.node_tree.links
 p=next((n for n in ns if n.type=='BSDF_PRINCIPLED'),None)
 if p is None:return old
 uv=ns.new('ShaderNodeUVMap');uv.uv_map='Office_Metric_UV'
 scale=ns.new('ShaderNodeVectorMath');scale.operation='SCALE'
 # meters of surface represented by one quadrant, based on visible weave.
 repeat={'wood':1.2,'fabric':.16,'stone':1.2,'rug':.35}[kind]
 scale.inputs[3].default_value=1/repeat;ls.new(uv.outputs['UV'],scale.inputs[0])
 frac=ns.new('ShaderNodeVectorMath');frac.operation='FRACTION';ls.new(scale.outputs[0],frac.inputs[0])
 fit=ns.new('ShaderNodeVectorMath');fit.operation='SCALE';fit.inputs[3].default_value=.492
 ls.new(frac.outputs[0],fit.inputs[0])
 offset=ns.new('ShaderNodeVectorMath');offset.operation='ADD'
 origin={'wood':(.004,.504,0),'fabric':(.504,.504,0),'stone':(.004,.004,0),'rug':(.504,.004,0)}[kind]
 offset.inputs[1].default_value=origin;ls.new(fit.outputs[0],offset.inputs[0])
 tex=ns.new('ShaderNodeTexImage');tex.image=image;tex.interpolation='Linear';ls.new(offset.outputs[0],tex.inputs['Vector'])
 base=p.inputs['Base Color'];color=tuple(base.default_value)
 for link in list(base.links):ls.remove(link)
 mix=ns.new('ShaderNodeMixRGB');mix.blend_type='MIX'
 mix.inputs[0].default_value={'wood':.8,'fabric':.52,'stone':.22,'rug':.65}[kind]
 mix.inputs[1].default_value=color;ls.new(tex.outputs['Color'],mix.inputs[2]);ls.new(mix.outputs[0],base)
 p.inputs['Roughness'].default_value={'wood':.5,'fabric':.86,'stone':.63,'rug':.95}[kind]
 m['atlas_repeat_meters']=repeat;m['atlas_category']=kind
 cache[key]=m;return m
for o in list(s.objects):
 if o.type!='MESH' or o.hide_render:continue
 choices=[(i,slot.material,category(o,slot.material)) for i,slot in enumerate(o.material_slots) if slot.material]
 if not any(k for i,m,k in choices):continue
 # Per-face box unfolding in physical meters, independent of unapplied scale.
 # Dominant-plane UV preserves architectural dimensions and avoids stretching.
 if o.data.name not in meshes:
  uv=o.data.uv_layers.get('Office_Metric_UV') or o.data.uv_layers.new(name='Office_Metric_UV')
  for face in o.data.polygons:
   normal=face.normal;axis=max(range(3),key=lambda i:abs(normal[i]))
   axes=[i for i in range(3) if i!=axis]
   for loop in face.loop_indices:
    co=o.data.vertices[o.data.loops[loop].vertex_index].co
    uv.data[loop].uv=(co[axes[0]]*abs(o.scale[axes[0]]),co[axes[1]]*abs(o.scale[axes[1]]))
  meshes.add(o.data.name)
 for i,m,kind in choices:
  if kind:
   o.material_slots[i].link='OBJECT';o.material_slots[i].material=mapped_material(m,kind)
 mapped.append(o.name)
s['material_atlas_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
report={'image_size':list(image.size),'mapped_objects':len(mapped),'materials':len(cache),'uv_meshes':len(meshes),'objects':mapped,'method':'Metric box UV unfolding; quadrant repeat shaders. Export requires baking or equivalent shader.'}
(root/'Design/OfficeConcept/material-atlas-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='objects'}))
