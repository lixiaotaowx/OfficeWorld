import bpy,json
for o in bpy.context.scene.objects:
 if 'approved monitor' in o.name:
  print(o.name,[(m.name,m.type) for m in o.modifiers],[(u.name,u.active_render) for u in o.data.uv_layers],o.data.users,len(o.data.polygons))
