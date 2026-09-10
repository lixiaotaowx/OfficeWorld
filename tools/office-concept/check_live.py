import bpy,json
s=bpy.context.scene
r={'file':bpy.data.filepath,'scene':s.name,'objects':len(s.objects),'lights':[{'name':o.name,'power':o.data.energy,'location':list(o.location)} for o in s.objects if o.type=='LIGHT'],'selected':[o.name for o in bpy.context.selected_objects],'screens':[o.name for o in s.objects if o.get('role')=='shared_screen']}
print(json.dumps(r))
