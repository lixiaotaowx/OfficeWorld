import bpy,json,pathlib,collections
p=pathlib.Path('G:/C/wendang/ChatGPT/youxi');bpy.ops.import_scene.fbx(filepath=str(p/'AssetSources/Realistic/Finished/tree_small_02/tree_small_02_UE.fbx'))
r=[]
for o in bpy.context.scene.objects:
 if o.type=='MESH':r.append({'name':o.name,'polygons':len(o.data.polygons),'materials':[m.name for m in o.data.materials],'material_polygons':dict(collections.Counter(f.material_index for f in o.data.polygons))})
(p/'OfficeWorld/Saved/tree-geometry-audit.json').write_text(json.dumps(r,indent=2))
