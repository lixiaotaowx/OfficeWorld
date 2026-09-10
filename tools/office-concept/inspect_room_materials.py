import bpy,json
for m in bpy.data.materials:
 if m.name.startswith('Atlas') and any(k in m.name.lower() for k in ['rug','floor','sage','wall','plaster']):print(m.name)
for o in bpy.context.scene.objects:
 if 'wall' in o.name.lower() or 'rug' in o.name.lower():print(o.name,[slot.material.name if slot.material else '' for slot in o.material_slots])
