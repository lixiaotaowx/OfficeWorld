import bpy,bmesh,json
m=bpy.data.objects['Island_A_Seat_1 approved chair'].data
bm=bmesh.new();bm.from_mesh(m);todo=set(bm.verts);out=[]
while todo:
 v=todo.pop();group={v};queue=[v]
 while queue:
  a=queue.pop()
  for e in a.link_edges:
   b=e.other_vert(a)
   if b in todo:todo.remove(b);group.add(b);queue.append(b)
 if max(v.co.z for v in group)>.9:
  out.append({'verts':len(group),'min':[min(v.co[i] for v in group) for i in range(3)],'max':[max(v.co[i] for v in group) for i in range(3)]})
print(json.dumps(out));bm.free()
