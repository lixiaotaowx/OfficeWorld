import bpy,json
s=bpy.context.scene
print('lights',json.dumps([{'name':o.name,'type':o.data.type,'energy':o.data.energy,'color':list(o.data.color),'loc':list(o.location),'rot':list(o.rotation_euler)} for o in s.objects if o.type=='LIGHT']))
print('world',[(n.name,n.type) for n in s.world.node_tree.nodes])
print('render',s.render.engine,s.view_settings.view_transform,s.view_settings.look,s.view_settings.exposure)
