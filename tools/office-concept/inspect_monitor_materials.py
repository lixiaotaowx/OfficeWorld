import bpy,json
from pathlib import Path
rows=[]
for o in bpy.context.scene.objects:
 if 'monitor' not in o.name.lower():continue
 rows.append({'name':o.name,'materials':[{'name':s.material.name,'nodes':[{'name':n.name,'type':n.type} for n in s.material.node_tree.nodes]} for s in o.material_slots if s.material]})
result={'file':bpy.data.filepath,'running':bool(bpy.app.driver_namespace.get('office_bake_running')),'objects':rows}
Path('G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/Monitor_Material_Audit.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result))
