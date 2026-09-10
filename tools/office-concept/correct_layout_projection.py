import bpy
from mathutils import Vector
s=bpy.context.scene
assert s.get('layout_correction_v1') and not s.get('layout_correction_v2')
for o in s.objects:
 if o.parent:continue
 n=o.name
 if n.startswith('Island_A'):o.location+=Vector((.4,-.9,0))
 elif n.startswith('Island_B'):o.location+=Vector((-1.4,1,0))
 elif n.startswith(('Meeting','Manager','Coffee','Window','Open top','Rear open','Architecture / rear room wall','Architecture / manager side wall','Architecture / room divider')):o.location.y+=.8
floor=bpy.data.objects['Architecture / ivory floor'];floor.location.y=.85;floor.dimensions.y=14.7
s['layout_correction_v2']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Desk islands now at (-2,-3.8) and (0.8,1.0); room frontage y=3.8.')
