import bpy,json
p='G:/C/wendang/ChatGPT/youxi/AssetSources/Decor/Erce_Trees/Models/FreeStylizedTreePack_Erce/Tree_Pack_Erce.blend'
with bpy.data.libraries.load(p,link=False) as (src,dst):
 print('objects',src.objects)
 dst.objects=[n for n in src.objects if 'Tree' in n or 'tree' in n]
for o in dst.objects:
 if o and o.type=='MESH':
  o.data.calc_loop_triangles()
  print(json.dumps({'name':o.name,'loc':list(o.location),'dims':list(o.dimensions),'tris':len(o.data.loop_triangles),'mats':[m.name for m in o.data.materials if m]}))
