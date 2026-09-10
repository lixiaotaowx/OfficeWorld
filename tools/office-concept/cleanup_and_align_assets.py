import bpy,math,json
from pathlib import Path
s=bpy.context.scene
col=bpy.data.collections['12 Approved free props']
for o in col.objects:
 o.rotation_mode='XYZ'
 if any(part in o.name for part in ['approved monitor','approved keyboard','approved mouse','approved chair','approved mug']):
  prefix=o.name.split(' approved')[0]
  if prefix.startswith('Island_'):
   number=int(prefix.rsplit('_',1)[1]);sign=-1 if number%2 else 1
  else:sign=1
  o.rotation_euler=(0,0,sign*math.pi/2)
 elif 'approved lamp' in o.name or 'approved task lamp' in o.name:
  o.rotation_euler=(0,0,-math.pi/2)
# Remove only agent-created hidden placeholders and replaced objects.
known_prefixes=('Island_','Manager','Lounge /','Coffee','Exterior','Park','Wall art','Meeting')
removed=[]
for o in list(s.objects):
 if o.name.startswith('LIB ') or (o.hide_render and o.name.startswith(known_prefixes)):
  removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
library=bpy.data.collections.get('Asset Library - approved originals')
if library and not library.objects:bpy.data.collections.remove(library)
# Purge only zero-user datablocks; in-use linked meshes stay intact.
for pool in [bpy.data.meshes,bpy.data.materials,bpy.data.images]:
 for block in list(pool):
  if block.users==0:pool.remove(block)
for image in bpy.data.images:
 if image.source=='FILE' and not image.packed_file:
  try:image.pack()
  except RuntimeError:pass
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
report={'removed_count':len(removed),'removed':removed,'props':len(col.objects),'objects_remaining':len(s.objects),'lights':{o.name:o.data.energy for o in s.objects if o.type=='LIGHT'}}
Path('G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/approved-assets-cleanup.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='removed'}))
