import bpy,pathlib,json
from mathutils import Vector,Quaternion
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.materials import bake_tex,show_texture_in_mat,assign_material_to_object
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
s=fb_settings();n=next(i for i,h in enumerate(s.heads) if h.headobj.name=='Head_Closeup_Fit');h=s.heads[n]
FBLoader.save_fb_serial_and_image_pathes(n)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Closeup_Anchors.blend'))
s.tex_width=4096;s.tex_height=4096;s.tex_fill_gaps=True
print('BAKE',bake_tex(n,h.preview_texture_name()))
mat=show_texture_in_mat(h.preview_texture_name(),h.preview_material_name());assign_material_to_object(h.headobj,mat)
img=bpy.data.images[h.preview_texture_name()]
img.filepath_raw=str(root/'Face_Projected_4096.png');img.file_format='PNG';img.save();img.pack()
for c in h.cameras:
    if c.cam_image and not c.cam_image.packed_file:c.cam_image.pack()
FBLoader.out_pinmode_without_save()
obj=h.headobj;obj.hide_set(False);obj.hide_viewport=False
bpy.context.view_layer.objects.active=obj
center=sum((obj.matrix_world@Vector(v) for v in obj.bound_box),Vector())/8
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        sp=area.spaces.active
        if sp.local_view:obj.local_view_set(sp,True)
        sp.region_3d.view_location=center
        sp.region_3d.view_distance=max(obj.dimensions)*1.45
        sp.region_3d.view_rotation=Quaternion((1,0,0),1.57079632679)
        sp.region_3d.view_perspective='ORTHO'
        sp.shading.type='MATERIAL';sp.shading.use_scene_world=False;sp.shading.use_scene_lights=False
        sp.overlay.show_overlays=False
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Closeup_Textured.blend'))
print('RESULT',obj.name,list(img.size),len(h.cameras))
