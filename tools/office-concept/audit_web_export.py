import bpy,json
s=bpy.context.scene
print([(o.name,o.get('seat_id'),list(o.location)) for o in s.objects if o.get('role')=='shared_screen'])
print('camera',[(o.name,list(o.location)) for o in s.objects if o.type=='CAMERA'])
