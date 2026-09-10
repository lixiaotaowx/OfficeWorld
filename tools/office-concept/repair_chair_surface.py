import bpy,bmesh,json
m=bpy.data.objects['Island_A_Seat_1 approved chair'].data
bm=bmesh.new();bm.from_mesh(m);todo=set(bm.verts)
while todo:
 v=todo.pop();group={v};queue=[v]
 while queue:
  a=queue.pop()
  for e in a.link_edges:
   b=e.other_vert(a)
   if b in todo:todo.remove(b);group.add(b);queue.append(b)
 if max(v.co.z for v in group)>1.1 and min(v.co.z for v in group)>.4:
  faces={f for v in group for f in v.link_faces}
  index=next(iter(faces)).material_index
  bmesh.ops.delete(bm,geom=list(faces),context='FACES_ONLY')
  result=bmesh.ops.convex_hull(bm,input=list(group),use_existing_faces=False)
  for f in result['geom']:
   if isinstance(f,bmesh.types.BMFace):f.material_index=index;f.smooth=True
  unused=[v for v in group if v.is_valid and not v.link_faces]
  if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(m);bm.free()
if m.has_custom_normals:m.normals_split_custom_set([(0,0,0)]*len(m.loops))
uv=m.uv_layers.get('Office_Metric_UV')
for p in m.polygons:
 axis=max(range(3),key=lambda i:abs(p.normal[i]));axes=[i for i in range(3) if i!=axis]
 for l in p.loop_indices:
  co=m.vertices[m.loops[l].vertex_index].co;uv.data[l].uv=(co[axes[0]],co[axes[1]])
m.update();bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Removed backrest concave tuft folds; shared chairs updated.')
