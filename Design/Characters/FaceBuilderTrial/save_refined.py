import bpy,json,pathlib
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial')
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder()
FBLoader.save_fb_serial_and_image_pathes(0)
for c in h.cameras:
    if c.cam_image and not c.cam_image.packed_file:c.cam_image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(root/'FaceBuilder_Refined_Textured.blend'))
report={'vertices':len(h.headobj.data.vertices),'pins':[fb.pins_count(c.get_keyframe()) for c in h.cameras],'texture':list(bpy.data.images[h.preview_texture_name()].size),'stage':'manually specified pin refinement and two-view texture projection; hair and collar are projected colors only'}
(root/'refined_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(report)
