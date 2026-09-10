import bpy,pathlib
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'FaceBuilder_Trial.blend'))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
print('MESH',obj.name,len(obj.data.vertices),obj.dimensions[:],flush=True)
for p in obj.data.polygons:p.use_smooth=True
points=[obj.matrix_world@Vector(p) for p in obj.bound_box]
center=sum(points,Vector())/8
span=max(obj.dimensions)
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='STUDIO'
scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(0.65,0.65,0.65)
scene.display.shading.show_shadows=True
scene.display.shading.show_cavity=True
scene.display.shading.background_type='WORLD'
scene.world.color=(0.08,0.08,0.08)
data=bpy.data.cameras.new('PreviewCamera')
cam=bpy.data.objects.new('PreviewCamera',data)
scene.collection.objects.link(cam)
scene.camera=cam
data.type='ORTHO';data.ortho_scale=span*1.2
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
for name,direction in [('Front',(0,-1,0)),('Quarter',(0.6,-1,0)),('Side',(1,0,0))]:
    cam.location=center+Vector(direction).normalized()*span*3
    cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(root/('Fit_'+name+'.png'))
    bpy.ops.render.render(write_still=True)
