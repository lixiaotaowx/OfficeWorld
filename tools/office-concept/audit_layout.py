import bpy,json
from pathlib import Path
from mathutils import Vector
s=bpy.context.scene
names=['Island_A top','Island_B top','Meeting room open glass door','Manager office open glass door']
r={'scene':s.name,'file':bpy.data.filepath,'items':[],'chairs':[]}
for o in s.objects:
 if o.name in names or (o.type=='EMPTY' and 'chair' in o.name.lower()):
  item={'name':o.name,'location':list(o.location)}
  if o.type=='MESH':
   pts=[o.matrix_world@Vector(v) for v in o.bound_box]
   item['min']=[min(p[i] for p in pts) for i in range(3)]
   item['max']=[max(p[i] for p in pts) for i in range(3)]
  r['items'].append(item)
r['workstation_screens']=len([o for o in s.objects if o.get('role')=='shared_screen' and o.name.startswith('Island_')])
r['lights']={o.name:o.data.energy for o in s.objects if o.type=='LIGHT'}
Path(r'G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/layout-audit-live.json').write_text(json.dumps(r,indent=2))
print(json.dumps(r))
