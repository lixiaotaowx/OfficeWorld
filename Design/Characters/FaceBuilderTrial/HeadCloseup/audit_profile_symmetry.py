import bpy,json,pathlib,numpy as np
from mathutils.kdtree import KDTree
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.blender_independent_packages.pykeentools_loader import module
s=fb_settings();h=s.heads[s.current_headnum];fb=FBLoader.get_builder()
neutral=module().FaceBuilder(FBLoader._camera_input)
neutral.select_model(fb.selected_model())
a=np.asarray(neutral.applied_args_vertices());b=np.asarray(fb.applied_args_vertices())
print('SHAPES',a.shape,b.shape)
tree=KDTree(len(a))
for i,v in enumerate(a):tree.insert(v,i)
tree.balance();dist=[]
for i,v in enumerate(a):
    mirror=v.copy();mirror[0]*=-1
    _,j,d=tree.find(mirror)
    if d<1e-5:
        q=b[j].copy();q[0]*=-1
        dist.append(float(np.linalg.norm(b[i]-q)))
width=float(np.ptp(b[:,0]));print('SYMMETRY',len(dist),'pairs','max_fraction_width',max(dist)/width if dist else None,'mean_fraction_width',np.mean(dist)/width if dist else None)
rows=[]
for ci,c in enumerate(h.cameras):
    hh=c.get_image_size()[1];r=[]
    for i,p in enumerate(fb.projected_pins(c.get_keyframe())):
        r.append({'id':i,'target':[float(p.img_pos[0]),float(hh-p.img_pos[1])],'error':float(np.linalg.norm(np.array(p.img_pos)-np.array(p.surface_point)))})
    rows.append(r)
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
(root/'profile_audit.json').write_text(json.dumps({'views':rows,'symmetry_max_fraction':max(dist)/width if dist else None,'symmetry_mean_fraction':float(np.mean(dist)/width) if dist else None},indent=2))
print('WORST_SIDE',sorted(rows[1],key=lambda r:r['error'],reverse=True)[:8])
