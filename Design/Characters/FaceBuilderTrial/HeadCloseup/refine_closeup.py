import bpy,json,pathlib,numpy as np
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.utils.coords import update_head_mesh_non_neutral
s=fb_settings();n=s.current_headnum;h=s.heads[n];fb=FBLoader.get_builder();k=h.cameras[0].get_keyframe()
changes=[]
for i,(x,y) in {2:(430,785),3:(618,785),4:(350,706),5:(692,706),6:(350,794),7:(692,794)}.items():
    old=fb.pin(k,i).img_pos
    changes.append({'pin':i,'old':[float(old[0]),float(1448-old[1])],'new':[x,y]})
    fb.move_pin(k,i,(x,1448-y))
FBLoader.solve(n,0);update_head_mesh_non_neutral(fb,h)
FBLoader.place_camera(n,0);FBLoader.load_pins_into_viewport(n,0)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
FBLoader.update_fb_viewport_shaders(area=area,headnum=n,camnum=0,wireframe=True,pins_and_residuals=True,camera_pos=True)
FBLoader.save_fb_serial_and_image_pathes(n)
rows=[{'id':i,'residual_px':float(np.linalg.norm(np.array(p.img_pos)-np.array(p.surface_point)))} for i,p in enumerate(fb.projected_pins(k))]
pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup/eye_alignment.json').write_text(json.dumps({'changes':changes,'residuals':rows},indent=2))
print('MAX_RESIDUAL',max(r['residual_px'] for r in rows))
