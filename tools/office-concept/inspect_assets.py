import bpy,json
for key in ['monitor','office_chair','keyboard_slim']:
 o=bpy.data.objects['LIB '+key]
 polys=sorted(o.data.polygons,key=lambda p:p.area,reverse=True)[:8]
 print(key,[(round(p.area,3),list(p.center),list(p.normal)) for p in polys])
print('anchors',json.dumps([{'name':o.name,'loc':list(o.matrix_world.translation),'rotation':list(o.rotation_euler),'dims':list(o.dimensions)} for o in bpy.context.scene.objects if o.name.endswith((' DISPLAY',' keyboard',' mug')) or o.name.startswith('Coffee /')]))
