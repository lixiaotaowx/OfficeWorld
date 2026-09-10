import bpy,pathlib,json
from mathutils import Vector,Matrix
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Plant'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(root/'potted_plant_01_2k.fbx'))
objs=[o for o in bpy.context.scene.objects if o.type=='MESH'];deps=bpy.context.evaluated_depsgraph_get()
snap=[(o,o.matrix_world.copy(),bpy.data.meshes.new_from_object(o.evaluated_get(deps))) for o in objs]
for o,world,mesh in snap:
 o.parent=None;o.animation_data_clear();o.data=mesh;mesh.transform(world);o.matrix_world=Matrix.Identity(4);o.hide_set(False);o.hide_viewport=False;o.select_set(True)
bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object;o.name='PottedPlant01';bpy.context.view_layer.update()
bpy.ops.export_scene.fbx(filepath=str(root/'PottedPlant01.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False,path_mode='STRIP')
(root/'conversion.json').write_text(json.dumps({'dimensions_m':list(o.dimensions),'materials':[m.name for m in o.data.materials],'vertices':len(o.data.vertices)},indent=2))
