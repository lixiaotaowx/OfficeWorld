import bpy,math
s=bpy.context.scene
sun=bpy.data.objects.get('Afternoon sun - adjustable')
assert sun and sun.type=='LIGHT' and sun.data.type=='SUN'
print('Previous sun angle',math.degrees(sun.data.angle))
sun.data.angle=math.radians(7)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Sun angle saved: 7 degrees. Direction, energy and color preserved.')
