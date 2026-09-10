import bpy,json
for o in bpy.context.scene.objects:
 if any(x in o.name for x in ['Window low storage','Window storage books','approved monitor','approved keyboard','approved mug']):
  print(json.dumps({'name':o.name,'dims':list(o.dimensions),'loc':list(o.location),'rot':list(o.rotation_euler),'materials':[s.material.name if s.material else None for s in o.material_slots]}))
