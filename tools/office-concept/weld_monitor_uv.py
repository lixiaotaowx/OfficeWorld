import bpy,bmesh,math
assert not bpy.app.driver_namespace.get('office_bake_running')
for o in bpy.context.scene.objects:
 if 'approved monitor' not in o.name:continue
 bm=bmesh.new();bm.from_mesh(o.data)
 before=len(bm.verts)
 bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
 bm.to_mesh(o.data);bm.free();o.data.update()
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.035,correct_aspect=True,scale_to_bounds=True)
 bpy.ops.object.mode_set(mode='OBJECT')
 print(o.name,before,'to',len(o.data.vertices))
