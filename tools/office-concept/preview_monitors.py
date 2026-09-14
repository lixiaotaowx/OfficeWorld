import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
assert not bpy.app.driver_namespace.get('office_bake_running')
def run():
 s=bpy.context.scene;o=bpy.data.objects['Island_A_Seat_1 approved monitor']
 corners=[o.matrix_world@Vector(c) for c in o.bound_box]
 center=sum(corners,Vector())/8
 camera=bpy.data.objects.new('Monitor check camera',bpy.data.cameras.new('Monitor check camera'))
 s.collection.objects.link(camera)
 camera.location=center+Vector((.85,-1.35,.65))
 camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
 camera.data.lens=55
 old=(s.camera,s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples)
 s.camera=camera;s.render.resolution_x=1000;s.render.resolution_y=900;s.render.resolution_percentage=100
 s.render.filepath=str(root/'Design/OfficeConcept/Monitor_Rebake_Check.png');s.cycles.samples=128;s.cycles.use_denoising=True
 originals=[]
 for slot in o.material_slots:
  originals.append((slot,slot.material))
  mat=slot.material.copy();slot.material=mat
  nodes=mat.node_tree.nodes;links=mat.node_tree.links
  target=nodes.get('BAKE_OUTPUT_UNCONNECTED')
  uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Bake_UV';links.new(uv.outputs['UV'],target.inputs['Vector'])
  emission=nodes.new('ShaderNodeEmission');links.new(target.outputs['Color'],emission.inputs['Color'])
  output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL')
  links.new(emission.outputs[0],output.inputs['Surface'])
 try:bpy.ops.render.render(write_still=True)
 finally:
  for slot,mat in originals:
   temp=slot.material;slot.material=mat;bpy.data.materials.remove(temp)
  s.camera,s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples=old
  data=camera.data;bpy.data.objects.remove(camera,do_unlink=True);bpy.data.cameras.remove(data)
 return None
bpy.app.timers.register(run,first_interval=1)
print('Queued actual monitor close-up')
