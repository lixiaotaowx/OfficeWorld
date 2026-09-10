import bpy,json,pathlib,numpy as np
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
from keentools.utils.coords import update_head_mesh_non_neutral
from keentools.facebuilder_config import FBConfig
s=fb_settings();h=s.heads[0];fb=FBLoader.get_builder()
for c,keep in zip(h.cameras,[15,9]):
    k=c.get_keyframe()
    for i in reversed(range(keep,fb.pins_count(k))):fb.remove_pin(k,i)
for i in range(2):FBLoader.solve(0,i)
update_head_mesh_non_neutral(fb,h)
for i in range(2):FBLoader.update_camera_pins_count(0,i)
FBLoader.update_all_camera_positions(0);FBLoader.save_fb_serial_and_image_pathes(0)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D');region=next(r for r in area.regions if r.type=='WINDOW')
area.spaces.active.overlay.show_overlays=True
group,name=FBConfig.fb_pinmode_idname.split('.')
with bpy.context.temp_override(area=area,region=region):getattr(getattr(bpy.ops,group),name)('INVOKE_DEFAULT',headnum=0,camnum=0)
area.spaces.active.region_3d.view_camera_zoom=95
area.spaces.active.region_3d.view_camera_offset=(0,0.32)
s.wireframe_opacity=0.06
report=[]
for c in h.cameras:
    rows=[]
    for i,p in enumerate(fb.projected_pins(c.get_keyframe())):
        target=np.array(p.img_pos);actual=np.array(p.surface_point)
        rows.append({'id':i,'target_top':[float(target[0]),float(1254-target[1])],'mesh_top':[float(actual[0]),float(1254-actual[1])],'error_px':float(np.linalg.norm(target-actual))})
    report.append(rows)
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/anchor_before.json').write_text(json.dumps(report,indent=2))
print(report)
