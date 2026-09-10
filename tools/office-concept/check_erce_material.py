import bpy,json
for name in ['T_Leaf','T_Trunk']:
 m=bpy.data.materials.get(name)
 print(name,[(n.type,n.image.filepath if n.type=='TEX_IMAGE' and n.image else '') for n in m.node_tree.nodes])
 print('links',[(l.from_node.type,l.from_socket.name,l.to_node.type,l.to_socket.name) for l in m.node_tree.links])
