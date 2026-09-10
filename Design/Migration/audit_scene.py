import bpy,json,os
from pathlib import Path
r={'objects':len(bpy.data.objects),'meshes':[],'images':[],'materials':[]}
for o in bpy.data.objects:
 if o.type=='MESH':
  m=o.data;m.calc_loop_triangles();r['meshes'].append({'name':o.name,'triangles':len(m.loop_triangles),'uv_layers':[x.name for x in m.uv_layers],'materials':len(m.materials),'hidden':o.hide_render})
for i in bpy.data.images:
 p=bpy.path.abspath(i.filepath)
 r['images'].append({'name':i.name,'size':list(i.size),'source':i.source,'packed':bool(i.packed_file),'path':p,'exists':os.path.isfile(p)})
for m in bpy.data.materials:
 r['materials'].append({'name':m.name,'nodes':[{'type':n.type,'name':n.name,'image':n.image.name if n.type=='TEX_IMAGE' and n.image else None} for n in m.node_tree.nodes] if m.use_nodes else [],'links':[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links] if m.use_nodes else []})
r['triangles']=sum(x['triangles'] for x in r['meshes'])
Path(r'G:/C/wendang/ChatGPT/youxi/Design/Migration/scene-audit.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf8')
print('AUDIT_COMPLETE',r['objects'],len(r['meshes']),r['triangles'],len(r['images']),len(r['materials']))
