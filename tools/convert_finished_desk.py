import bpy,pathlib,json,math
from mathutils import Vector,Matrix
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished';out=root/'Converted';out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(root/'office_desk_03.blend'),load_ui=False,use_scripts=False)
objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in objs:
 o.hide_set(False);o.hide_viewport=False;o.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
for o in objs:
 bpy.context.view_layer.objects.active=o
 for mod in list(o.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=mod.name)
  except RuntimeError:pass
bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();obj=bpy.context.object
rotation=Matrix.Rotation(math.pi/2,4,'Z');obj.matrix_world=rotation@obj.matrix_world
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
pts=[obj.matrix_world@Vector(v) for v in obj.bound_box]
lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
obj.location-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
bpy.ops.object.transform_apply(location=True,rotation=False,scale=False)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True;scene.render.bake.margin=8
for kind,bake in [('BaseColor','DIFFUSE'),('Roughness','ROUGHNESS')]:
 image=bpy.data.images.new('D1_'+kind,2048,2048,alpha=False)
 if kind!='BaseColor':image.colorspace_settings.name='Non-Color'
 for mat in obj.data.materials:
  if not mat:continue
  mat.use_nodes=True;n=mat.node_tree.nodes.new('ShaderNodeTexImage');n.image=image;mat.node_tree.nodes.active=n
 bpy.ops.object.bake(type=bake)
 image.filepath_raw=str(out/('D1_'+kind+'.png'));image.file_format='PNG';image.save()
bpy.ops.export_scene.fbx(filepath=str(out/'D1_OfficeDesk.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False,path_mode='STRIP')
(out/'desk-conversion.json').write_text(json.dumps({'source':'office_desk_03.blend','source_parts':len(objs),'dimensions_m':list(obj.dimensions),'textures':['D1_BaseColor.png','D1_Roughness.png'],'geometry':'original mesh with source modifiers applied'},indent=2))
print('D1 baked and converted',flush=True)
