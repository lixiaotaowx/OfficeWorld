import bpy,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
report={}
bpy.ops.wm.open_mainfile(filepath=str(root/'office_desk_03.blend'),load_ui=False,use_scripts=False)
report['desk']={'meshes':[{'name':o.name,'dimensions':list(o.dimensions),'location':list(o.location),'vertices':len(o.data.vertices),'materials':[s.name for s in o.data.materials]} for o in bpy.data.objects if o.type=='MESH'],'images':[{'name':i.name,'path':i.filepath,'packed':bool(i.packed_file)} for i in bpy.data.images], 'materials':{m.name:[{'name':n.name,'type':n.type} for n in m.node_tree.nodes] for m in bpy.data.materials if m.use_nodes}}
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'OrthopedicChair/source/Chair.fbx'))
report['chair']={'meshes':[{'name':o.name,'dimensions':list(o.dimensions),'location':list(o.location),'vertices':len(o.data.vertices),'materials':[s.name for s in o.data.materials]} for o in bpy.data.objects if o.type=='MESH'],'materials':{m.name:[{'name':n.name,'type':n.type,'image':n.image.name if n.type=='TEX_IMAGE' and n.image else None} for n in m.node_tree.nodes] for m in bpy.data.materials if m.use_nodes}}
(root/'asset_inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Finished assets inspected')
