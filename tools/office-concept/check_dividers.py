import bpy,json
for o in bpy.context.scene.objects:
 if o.name.endswith('privacy divider') or o.name.endswith(' top') and o.name.startswith('Island'):
  print(json.dumps({'name':o.name,'loc':list(o.location),'dims':list(o.dimensions),'mats':[m.name for m in o.data.materials]}))
