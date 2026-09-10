import bpy,sys,math
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi');sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import material
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Desk_Palette_Refinement.blend'),copy=True)
ivory=material('Device shells - warm ivory',(.68,.70,.65),.42)
keylight=material('Keyboard keys - pearl',(.74,.76,.70),.63)
keyedge=material('Keyboard recesses - soft grey',(.32,.37,.34),.7)
ceramic=material('Cups - warm porcelain',(.80,.72,.60),.3)
accent=material('Desk accents - soft sage',(.32,.40,.30),.65)
letters=material('Keyboard lettering - grey',(.25,.29,.27),.8)
for o in s.objects:
 if 'approved monitor' in o.name or 'approved mouse' in o.name:
  for slot in o.material_slots:slot.link='OBJECT';slot.material=ivory
 elif 'approved keyboard' in o.name:
  for slot in o.material_slots:
   old=slot.material.name if slot.material else ''
   slot.link='OBJECT'
   slot.material=letters if 'White' in old else keylight if 'GreyLight' in old else keyedge if 'Black' in old else ivory
 elif 'approved mug' in o.name:
  for slot in o.material_slots:slot.link='OBJECT';slot.material=ceramic
 elif 'approved pen cup' in o.name or 'approved task lamp' in o.name or 'Manager approved lamp' in o.name:
  for slot in o.material_slots:
   if slot.material and 'bulb' not in slot.material.name.lower():slot.link='OBJECT';slot.material=ivory
 if o.get('role')=='shared_screen':
  m=material('Screen - soft daylight '+o.name,(.53,.67,.70),.36)
  shader=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
  shader.inputs['Emission Color'].default_value=(.50,.67,.71,1);shader.inputs['Emission Strength'].default_value=.24
  o.material_slots[0].link='OBJECT';o.material_slots[0].material=m
shelf=bpy.data.objects['Window low storage'];shelf.rotation_euler=(0,0,0);shelf.dimensions=(2.2,.42,.82);shelf.location=(-4.4,7.72,.02)
books=bpy.data.objects['Window storage books'];books.rotation_euler=(0,0,math.pi);books.location=(-4.4,7.62,.845)
for slot in books.material_slots:
 slot.link='OBJECT';slot.material=ceramic if slot.material and 'White' in slot.material.name else accent
# Smaller staggered groups rest on the shelf top, not in mid-air.
for i,x in enumerate([-5.12,-3.77]):
 name='Window shelf book group '+str(i)
 old=bpy.data.objects.get(name)
 if old:bpy.data.objects.remove(old,do_unlink=True)
 o=books.copy();o.data=books.data;shelf.users_collection[0].objects.link(o);o.name=name
 o.location=(x,7.62,.845);o.scale*=.8 if i else 1.1
sun=bpy.data.objects['Afternoon sun - adjustable'];sun.data.energy=2.8;sun.data.color=(1,.84,.66);sun.data.angle=math.radians(4)
sun.rotation_euler=(math.radians(42),math.radians(-28),math.radians(-38))
bpy.data.objects['Daylight - adjustable'].data.energy=950
fill=bpy.data.objects['Soft front fill'];fill.data.energy=550;fill.data.color=(1,.94,.84)
s.cycles.preview_samples=64
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Light desk palette, shelf orientation/books and warm directional light saved.')
