import bpy,json
from pathlib import Path
rows=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 rows.append({'name':o.name,'dimensions':list(o.dimensions),'hidden':o.hide_render,'materials':[s.material.name if s.material else '' for s in o.material_slots]})
Path('G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/Bakes_20260912/objects.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print(bpy.data.filepath,len(rows))
