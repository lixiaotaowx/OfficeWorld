import bpy,pathlib
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.utils.materials import bake_tex,show_texture_in_mat,assign_material_to_object
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial')
s=fb_settings();h=s.heads[0]
FBLoader.save_fb_serial_and_image_pathes(0)
FBLoader.out_pinmode_without_save()
s.tex_width=2048;s.tex_height=2048
s.tex_fill_gaps=True
s.tex_equalize_brightness=True
s.tex_equalize_colour=True
result=bake_tex(0,h.preview_texture_name())
print('BAKE',result)
mat=show_texture_in_mat(h.preview_texture_name(),h.preview_material_name())
assign_material_to_object(h.headobj,mat)
img=bpy.data.images.get(h.preview_texture_name())
if img:
    img.filepath_raw=str(root/'Face_Projected.png');img.file_format='PNG';img.save();img.pack()
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.type='MATERIAL'
FBLoader.save_fb_serial_and_image_pathes(0)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'FaceBuilder_Refined_Textured.blend'))
