import bpy
from keentools.addon_config import fb_settings
from keentools.facebuilder_config import FBConfig
s=fb_settings();n=next(i for i,h in enumerate(s.heads) if h.headobj.name=='Head_Closeup_Fit')
s.current_headnum=n;s.current_camnum=0;s.force_out_pinmode=False
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D');region=next(r for r in area.regions if r.type=='WINDOW')
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):print(getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=n,camnum=0))
area.spaces.active.region_3d.view_camera_zoom=20
area.spaces.active.region_3d.view_camera_offset=(0,0)
