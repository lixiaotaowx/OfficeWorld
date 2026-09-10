import bpy
from keentools.facebuilder_config import FBConfig
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
region=next(r for r in area.regions if r.type=='WINDOW')
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):
    print(getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=0,camnum=0))
area.spaces.active.region_3d.view_camera_zoom=95
area.spaces.active.region_3d.view_camera_offset=(0,0.32)

