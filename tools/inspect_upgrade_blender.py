import bpy,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/WorkstationUpgrade'
report={}
for kind in ['monitor','keyboard','mouse']:
    bpy.ops.wm.open_mainfile(filepath=str(root/kind/(kind+'.blend')),load_ui=False,use_scripts=False)
    report[kind]={'objects':[],'materials':[],'images':[]}
    for o in bpy.context.scene.objects:
        if o.type=='MESH':report[kind]['objects'].append({'name':o.name,'dimensions':list(o.dimensions),'location':list(o.location),'rotation':list(o.rotation_euler),'vertices':len(o.data.vertices),'materials':[m.name if m else None for m in o.data.materials],'modifiers':[(m.name,m.type) for m in o.modifiers]})
    for m in bpy.data.materials:
        report[kind]['materials'].append({'name':m.name,'nodes':[(n.name,n.type) for n in m.node_tree.nodes] if m.use_nodes else [],'links':[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links] if m.use_nodes else []})
    for im in bpy.data.images:report[kind]['images'].append({'name':im.name,'size':list(im.size),'packed':bool(im.packed_file),'path':im.filepath})
(root/'inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Inspection complete')
