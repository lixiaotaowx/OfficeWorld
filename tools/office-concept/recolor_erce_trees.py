import bpy
s=bpy.context.scene
for name,color in [('T_Leaf',(.29,.37,.12,1)),('T_Trunk',(.28,.17,.085,1))]:
 m=bpy.data.materials[name];nodes=m.node_tree.nodes;links=m.node_tree.links
 p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
 for socket in ['Base Color','Normal','Roughness']:
  for link in list(p.inputs[socket].links):links.remove(link)
 p.inputs['Base Color'].default_value=color;p.inputs['Roughness'].default_value=.83
 m.diffuse_color=color
 if name=='T_Leaf':
  p.inputs['Subsurface Weight'].default_value=.06
  # Keep only the alpha silhouette from the original leaf card texture.
  for n in list(nodes):
   if n.type=='HUE_SAT':nodes.remove(n)
 else:
  for n in list(nodes):
   if n.type=='TEX_IMAGE':nodes.remove(n)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Exterior tree color textures disconnected; warm olive leaves and brown bark. Leaf alpha retained for silhouette.')
