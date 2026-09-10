import bpy,pathlib,sys
from mathutils import Vector
identity=sys.argv[sys.argv.index('--')+1];out=pathlib.Path('G:/C/wendang/ChatGPT/youxi/AssetSources/Realistic/OfficePeople/Fitting')/identity
bpy.ops.wm.open_mainfile(filepath=str(out/'Clothing.blend'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20
with_body='body' in sys.argv
if with_body:
 mat=bpy.data.materials.new('Fitting skin');mat.diffuse_color=(.45,.3,.2,1)
 for obj in bpy.data.objects:
  if obj.type=='MESH' and not obj.name.startswith('SK_'+identity+'_'):
   obj.hide_render=False;obj.hide_set(False);obj.data.materials.clear();obj.data.materials.append(mat)
scene.render.resolution_x=720;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('PreviewWorld');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.18,.18,.18,1)
for location,power,size in [((1,-3,3),450,3),((-2,0,2),300,2)]:
 bpy.ops.object.light_add(type='AREA',location=location);lamp=bpy.context.object;lamp.data.energy=power;lamp.data.shape='DISK';lamp.data.size=size;lamp.rotation_euler=(Vector((0,0,.8))-lamp.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1.6,-4,1.7));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.78))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.85;scene.camera=cam
scene.render.filepath=str(out/('Body_fit_preview.png' if with_body else 'Clothing_preview.png'));bpy.ops.render.render(write_still=True)
