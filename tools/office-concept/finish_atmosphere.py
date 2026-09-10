import bpy,sys,math
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi');sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import area
s=bpy.context.scene
sun=bpy.data.objects['Afternoon sun - adjustable'];sun.data.angle=math.radians(2.2)
s.view_settings.exposure=.15
area('Atmosphere manager soft fill',(8.5,5.5,3.15),(8.8,5.9,.8),125,2.5,(1,.87,.68))
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Manager fill and final exposure saved.')
