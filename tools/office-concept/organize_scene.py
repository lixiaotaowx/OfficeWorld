import bpy,json
from pathlib import Path
scene=bpy.context.scene
categories={}
for obj in list(scene.objects):
 name=obj.name
 if name.startswith(('Architecture','Window','Open top','Rear open','Front','Entry')):group='01 Architecture - open roof'
 elif name.startswith('Island_A'):group='02 Workstations A - 4 seats'
 elif name.startswith('Island_B'):group='03 Workstations B - 4 seats'
 elif name.startswith('Meeting'):group='04 Glass meeting room'
 elif name.startswith('Manager'):group='05 Manager office'
 elif name.startswith('Coffee'):group='06 Coffee bar'
 elif name.startswith('Lounge'):group='07 Lounge'
 elif name.startswith('Exterior'):group='08 Park placeholder geometry'
 elif obj.type=='LIGHT':group='09 Lighting - editable'
 elif obj.type=='CAMERA':group='10 Cameras'
 else:group='11 Other'
 if group not in categories:
  col=bpy.data.collections.new(group);scene.collection.children.link(col);categories[group]=col
 target=categories[group]
 if obj.name not in target.objects:target.objects.link(obj)
 for col in list(obj.users_collection):
  if col!=target:col.objects.unlink(obj)
shared=[o for o in scene.objects if o.get('role')=='shared_screen' and o.name.startswith('Island_')]
assert len(shared)==8,len(shared)
report={'scene':scene.name,'objects':len(scene.objects),'shared_workstations':len(shared),'screen_objects':[o.name for o in shared],'roof_slabs':0,'status':'Editable original blockout, not final concept matching; lighting and bake unverified.'}
Path(r'G:/C/wendang/ChatGPT/youxi/Design/OfficeConcept/model-checkpoint.json').write_text(json.dumps(report,indent=2),encoding='utf8')
scene['design_reference']='Concept_With_Manager_Approved.png'
scene['workstation_count']=8
scene['status']='Editable first layout; needs proportion/material/detail and lighting review'
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(report)
