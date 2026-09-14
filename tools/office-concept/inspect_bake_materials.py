import bpy,json
for name in ['Architecture / ivory floor','Island_A top','Island_A_Seat_1 approved monitor','Window continuous glass']:
 o=bpy.data.objects[name]
 print(name)
 for slot in o.material_slots:
  m=slot.material
  print(m.name,[(n.type,n.name) for n in m.node_tree.nodes if n.type not in {'TEX_IMAGE','UVMAP'}])
  print([(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links if l.to_node.type=='OUTPUT_MATERIAL'])
print('CAMERA',bpy.context.scene.camera.name if bpy.context.scene.camera else None)
