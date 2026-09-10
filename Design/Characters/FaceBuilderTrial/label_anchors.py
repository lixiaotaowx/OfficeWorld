import bpy,blf,json,pathlib,numpy as np
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import get_camera_border
def draw_anchor_ids():
    area=bpy.context.area
    if not area or area.type!='VIEW_3D':return
    s=fb_settings();fb=FBLoader.get_builder();h=s.heads[0];c=h.cameras[s.current_camnum]
    x1,y1,x2,y2=get_camera_border(area)
    blf.size(0,13);blf.color(0,1,0.85,0.1,1)
    for i,p in enumerate(fb.projected_pins(c.get_keyframe())):
        x,y=p.img_pos
        blf.position(0,x1+x/1254*(x2-x1)+8,y1+y/1254*(y2-y1)+7,0)
        blf.draw(0,str(i))
old=bpy.app.driver_namespace.pop('anchor_label_handler',None)
if old:bpy.types.SpaceView3D.draw_handler_remove(old,'WINDOW')
bpy.app.driver_namespace['anchor_label_handler']=bpy.types.SpaceView3D.draw_handler_add(draw_anchor_ids,(),'WINDOW','POST_PIXEL')
s=fb_settings();fb=FBLoader.get_builder();report=[]
for c in s.heads[0].cameras:
    rows=[]
    for i,p in enumerate(fb.projected_pins(c.get_keyframe())):
        a=np.array(p.img_pos);b=np.array(p.surface_point)
        rows.append({'id':i,'image_target':[float(a[0]),float(1254-a[1])],'mesh_projection':[float(b[0]),float(1254-b[1])],'residual_px':float(np.linalg.norm(a-b))})
    report.append(rows)
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/anchor_after.json').write_text(json.dumps(report,indent=2))
print('RESIDUALS',[[r['residual_px'] for r in rows] for rows in report])
