import bpy

def make_denoiser():
 scene=bpy.data.scenes.new('Bake texture denoising')
 scene.render.engine='CYCLES';scene.cycles.samples=128
 scene.cycles.device='GPU'
 scene.cycles.use_denoising=True
 scene.render.resolution_percentage=100
 scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
 scene.view_settings.exposure=0;scene.view_settings.gamma=1
 scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
 scene.render.image_settings.color_depth='8'
 camera=bpy.data.objects.new('Texture processing camera',bpy.data.cameras.new('Texture processing camera'))
 scene.collection.objects.link(camera);scene.camera=camera
 group=bpy.data.node_groups.new('Guided baked texture denoising','CompositorNodeTree')
 group.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
 scene.compositing_node_group=group
 nodes=group.nodes;links=group.links
 color=nodes.new('CompositorNodeImage');albedo=nodes.new('CompositorNodeImage');normal=nodes.new('CompositorNodeImage')
 denoise=nodes.new('CompositorNodeDenoise');denoise.inputs['Quality'].default_value='High'
 denoise.inputs['Prefilter'].default_value='Accurate';denoise.inputs['HDR'].default_value=True
 output=nodes.new('NodeGroupOutput')
 links.new(color.outputs['Image'],denoise.inputs['Image'])
 links.new(albedo.outputs['Image'],denoise.inputs['Albedo'])
 links.new(normal.outputs['Image'],denoise.inputs['Normal'])
 links.new(denoise.outputs['Image'],output.inputs['Image'])
 return scene,group,camera,(color,albedo,normal)

def denoise_image(processor,images,path,size):
 scene,group,camera,nodes=processor
 for node,image in zip(nodes,images):node.image=image
 scene.render.resolution_x=size;scene.render.resolution_y=size
 scene.render.filepath=str(path)
 bpy.ops.render.render(scene=scene.name,write_still=True)
 for node in nodes:node.image=None

def remove_denoiser(processor):
 scene,group,camera,nodes=processor
 camera_data=camera.data
 bpy.data.scenes.remove(scene);bpy.data.objects.remove(camera,do_unlink=True)
 bpy.data.cameras.remove(camera_data);bpy.data.node_groups.remove(group)
