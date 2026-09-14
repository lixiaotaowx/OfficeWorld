import bpy,json
print('file',bpy.data.filepath,'unsaved',bpy.data.is_dirty)
for o in bpy.context.scene.objects:
 if o.type=='MESH' and 'approved chair' in o.name:
  print(json.dumps({'name':o.name,'vertices':len(o.data.vertices),'bounds':list(o.dimensions),'location':list(o.location),'rotation':list(o.rotation_euler),'materials':[s.material.name for s in o.material_slots]},ensure_ascii=False))
