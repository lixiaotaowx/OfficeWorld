import bpy,json
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
folder=root/'AssetSources/OfficeConcept/Bakes_20260912'
state=json.loads((folder/'selective_progress.json').read_text(encoding='utf8'))
assert state['finished'] and not state['errors']
assert len(state['done'])==sum(bool(r['size']) for r in state['entries'])
report={'applied':[],'source_only':[]}
for row in state['entries']:
 o=bpy.data.objects[row['object']]
 o['web_bake_mode']=row['mode']
 for slot in o.material_slots:
  m=slot.material;nodes=m.node_tree.nodes;links=m.node_tree.links
  image_node=nodes.get('BAKE_OUTPUT_UNCONNECTED')
  if not row['size']:
   if image_node:nodes.remove(image_node)
   continue
  assert image_node and image_node.image.size[0]==row['size']
  output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
  assert not nodes.get('BAKED_CAMERA_SURFACE')
  original=output.inputs['Surface'].links[0].from_socket
  uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Bake_UV';uv.location=(400,-700)
  links.new(uv.outputs['UV'],image_node.inputs['Vector'])
  emission=nodes.new('ShaderNodeEmission');emission.name='BAKED_CAMERA_SURFACE';emission.location=(900,-500)
  links.new(image_node.outputs['Color'],emission.inputs['Color'])
  path=nodes.new('ShaderNodeLightPath');path.location=(650,-900)
  mix=nodes.new('ShaderNodeMixShader');mix.name='BAKED_PREVIEW_SOURCE_BOUNCE';mix.location=(1150,0)
  links.new(path.outputs['Is Camera Ray'],mix.inputs[0])
  links.new(original,mix.inputs[1]);links.new(emission.outputs[0],mix.inputs[2])
  links.new(mix.outputs[0],output.inputs['Surface'])
  image_node.label='Independent baked lighting — camera preview'
 report['applied' if row['size'] else 'source_only'].append(o.name)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
(folder/'applied.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
def render_preview():
 s=bpy.context.scene
 old=(s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples)
 s.render.resolution_x=1400;s.render.resolution_y=900;s.render.resolution_percentage=100
 s.render.filepath=str(root/'Design/OfficeConcept/Selective_Bake_Preview.png');s.cycles.samples=32
 s.cycles.use_denoising=True
 try:bpy.ops.render.render(write_still=True)
 finally:
  s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples=old
 return None
bpy.app.timers.register(render_preview,first_interval=1)
print('Applied',len(report['applied']),'preserved source',len(report['source_only']),'preview queued')
