import bpy,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
report={}
for name in ['calathea_orbifolia_01','decorative_book_set_01']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.fbx(filepath=str(root/name/(name+'_2k.fbx')))
 report[name]=[{'name':o.name,'dimensions':list(o.dimensions),'location':list(o.location),'rotation':list(o.rotation_euler),'materials':[m.name for m in o.data.materials]} for o in bpy.context.scene.objects if o.type=='MESH']
(root/'Extension/decor-inspect.json').write_text(json.dumps(report,indent=2))
