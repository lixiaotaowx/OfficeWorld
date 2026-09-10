import bpy
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
s=bpy.context.scene
selected=list(bpy.context.selected_objects);active=bpy.context.view_layer.objects.active
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type=='MESH' and o.visible_get() and not o.hide_render and not o.name.startswith(('Erce exterior','Exterior','Park city')):
  o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(root/'OfficeWeb/public/assets/office-white.glb'),export_format='GLB',use_selection=True,export_materials='NONE',export_extras=True,export_apply=True)
bpy.ops.object.select_all(action='DESELECT')
for o in selected:o.select_set(True)
bpy.context.view_layer.objects.active=active
print('White interior geometry exported; original Blender materials unchanged.')
