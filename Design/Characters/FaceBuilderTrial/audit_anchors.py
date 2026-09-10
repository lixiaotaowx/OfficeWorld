import bpy,json,pathlib,numpy as np
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Before_Anchor_Audit.blend'))
s=fb_settings();s.current_headnum=0;FBLoader.load_model(0);fb=FBLoader.get_builder()
for c in s.heads[0].cameras:
    k=c.get_keyframe()
    print('VIEW',k,'projection',fb.projected_pins(k))
    p=fb.pin(k,0)
    print('SURFACE',p.surface_point,dir(p.surface_point))
    print('DOC',fb.add_pin.__doc__)
