import bpy
from keentools.addon_config import fb_settings
s=fb_settings()
print('CURRENT',s.current_headnum,s.current_camnum,'PINMODE',s.pinmode)
for i,h in enumerate(s.heads):
    print('HEAD',i,h.headobj.name,[(j,c.cam_image.filepath if c.cam_image else None,c.get_keyframe()) for j,c in enumerate(h.cameras)])
