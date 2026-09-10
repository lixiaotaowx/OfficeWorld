import bpy
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.facebuilder_config import FBConfig
s=fb_settings();s.current_headnum=0
FBLoader.load_model(0)
fb=FBLoader.get_builder()
for c in s.heads[0].cameras:
    k=c.get_keyframe()
    print('VIEW',k,c.get_image_size())
    for i in range(fb.pins_count(k)):
        p=fb.pin(k,i)
        print('PIN',i,'pos',p.img_pos,'fields',dir(p) if i==0 else '')
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
region=next(r for r in area.regions if r.type=='WINDOW')
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):
    print('PINMODE',getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=0,camnum=0))
