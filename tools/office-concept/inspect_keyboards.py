import bpy,json
from pathlib import Path
from mathutils import Vector
rows=[]
for o in bpy.context.scene.objects:
 if 'keyboard' in o.name.lower():
  corners=[o.matrix_world@Vector(c) for c in o.bound_box]
  rows.append({'name':o.name,'location':list(o.location),'rotation':list(o.rotation_euler),'dimensions':list(o.dimensions),'bounds':[[min(v[i] for v in corners) for i in range(3)],[max(v[i] for v in corners) for i in range(3)]]})
Path('G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/Keyboard_Audit.json').write_text(json.dumps({'file':bpy.data.filepath,'objects':rows},indent=2),encoding='utf8')
print('Inspected',len(rows),'keyboards',bpy.data.filepath)
