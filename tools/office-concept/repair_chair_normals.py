import bpy,bmesh,json
seen=set()
for obj in bpy.context.scene.objects:
 if 'approved chair' not in obj.name or obj.data.name in seen:continue
 mesh=obj.data;seen.add(mesh.name)
 bm=bmesh.new();bm.from_mesh(mesh)
 bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
 bm.to_mesh(mesh);bm.free()
 # Imported custom split normals no longer match the reshaped chair.
 if mesh.has_custom_normals:
  mesh.normals_split_custom_set([(0,0,0)]*len(mesh.loops))
 for poly in mesh.polygons:poly.use_smooth=False
 mesh.update()
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'chair_meshes_repaired':len(seen)}))
