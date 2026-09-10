import bpy,pathlib,json,sys
from mathutils import Vector,Matrix
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
for asset in ['tree_small_02','modular_street_seating']:
 directory=root/asset
 if not (directory/'SOURCE.json').exists():continue
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.fbx(filepath=str(directory/(asset+'_2k.fbx')))
 objs=[o for o in bpy.context.scene.objects if o.type=='MESH'];deps=bpy.context.evaluated_depsgraph_get();snap=[(o,o.matrix_world.copy(),bpy.data.meshes.new_from_object(o.evaluated_get(deps))) for o in objs]
 for o,world,mesh in snap:
  o.parent=None;o.animation_data_clear();o.data=mesh;mesh.transform(world);o.matrix_world=Matrix.Identity(4);o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object;bpy.context.view_layer.update()
 pts=[Vector(v) for v in o.bound_box];lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
 o.data.transform(Matrix.Translation(Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z))));o.name=asset
 bpy.ops.export_scene.fbx(filepath=str(directory/(asset+'_UE.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False,path_mode='STRIP')
 (directory/'conversion.json').write_text(json.dumps({'dimensions_m':list(o.dimensions),'materials':[m.name if m else 'Unassigned' for m in o.data.materials],'vertices':len(o.data.vertices)},indent=2))
 print(asset,'converted',flush=True)
