import bpy, pathlib, json
from mathutils import Vector,Matrix
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
out=root/'Converted';out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(root/'OrthopedicChair/source/Chair.fbx'))
objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
pts=[o.matrix_world@Vector(v) for o in objs for v in o.bound_box]
lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));factor=1.2/(hi.z-lo.z)
snapshots=[(o,o.matrix_world.copy(),bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()))) for o in objs]
for o,world,mesh in snapshots:
 o.animation_data_clear();o.parent=None
 for con in list(o.constraints):o.constraints.remove(con)
 for mod in list(o.modifiers):o.modifiers.remove(mod)
 o.data=mesh;mesh.transform(Matrix.Scale(factor,4)@Matrix.Translation(-center)@world);o.matrix_world=Matrix.Identity(4)
bpy.context.view_layer.update()
for im in bpy.data.images:
 candidate=root/'OrthopedicChair/textures'/pathlib.Path(im.filepath.replace('\\','/')).name
 if candidate.exists():im.filepath=str(candidate)
bpy.ops.object.select_all(action='DESELECT')
for o in objs:
 o.hide_set(False);o.hide_viewport=False;o.hide_render=False;o.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.object.join()
bpy.context.object.name='C1_OrthopedicChair'
bpy.context.view_layer.update()
print('JOINED',len(bpy.context.object.data.vertices),list(bpy.context.object.dimensions),flush=True)
bpy.ops.export_scene.fbx(filepath=str(out/'C1_OrthopedicChair.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',add_leaf_bones=False,bake_anim=False,path_mode='STRIP')
(out/'chair-conversion.json').write_text(json.dumps({'source_bounds':[list(lo),list(hi)],'uniform_scale':factor,'height_m':1.2,'parts':len(objs),'materials':[m.name for m in bpy.data.materials if m.users]},indent=2))
print('C1 original geometry converted:',out/'C1_OrthopedicChair.fbx')
