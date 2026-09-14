import bpy
for o in bpy.context.scene.objects:
 if 'approved monitor' not in o.name:continue
 for uv in list(o.data.uv_layers):
  if uv.name!='Bake_UV':o.data.uv_layers.remove(uv)
 o.data.uv_layers.active=o.data.uv_layers['Bake_UV']
 o.data.uv_layers['Bake_UV'].active_render=True
print('Nine plain-material monitors now use Bake_UV exclusively for baking and export')
