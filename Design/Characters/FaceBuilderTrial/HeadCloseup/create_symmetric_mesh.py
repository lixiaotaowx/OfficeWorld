import bpy,pathlib,json,numpy as np
from mathutils import Vector,Quaternion
from mathutils.kdtree import KDTree
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
from keentools.blender_independent_packages.pykeentools_loader import module
s=fb_settings();n=s.current_headnum;h=s.heads[n];fb=FBLoader.get_builder()
FBLoader.save_fb_serial_and_image_pathes(n)
source=h.headobj
neutral=module().FaceBuilder(FBLoader._camera_input);neutral.select_model(fb.selected_model())
a=np.asarray(neutral.applied_args_vertices());tree=KDTree(len(a))
for i,v in enumerate(a):tree.insert(v,i)
tree.balance();pairs=[]
for v in a:
    q=v.copy();q[0]*=-1
    _,j,d=tree.find(q)
    if d>1e-5:raise RuntimeError('Missing symmetric neutral vertex')
    pairs.append(j)
coords=np.array([v.co[:] for v in source.data.vertices]);mirrored=coords[pairs].copy();mirrored[:,0]*=-1
sym=(coords+mirrored)*0.5
obj=source.copy();obj.data=source.data.copy();obj.name='Head_Symmetric_Review'
if obj.data.shape_keys:obj.shape_key_clear()
bpy.context.scene.collection.objects.link(obj)
for key in list(obj.keys()):del obj[key]
obj.data.vertices.foreach_set('co',sym.ravel());obj.data.update()
for p in obj.data.polygons:p.use_smooth=True
obj['note']='Symmetric mesh review copy. FaceBuilder source retained separately; this copy is not live FaceBuilder-controlled. Texture must be rebaked after shape approval.'
FBLoader.out_pinmode_without_save()
obj.hide_set(False);obj.hide_viewport=False
source.hide_set(True)
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D');sp=area.spaces.active
if sp.local_view:obj.local_view_set(sp,True)
bpy.context.view_layer.objects.active=obj;obj.select_set(True)
center=sum((obj.matrix_world@Vector(v) for v in obj.bound_box),Vector())/8
sp.region_3d.view_location=center;sp.region_3d.view_distance=max(obj.dimensions)*1.6
sp.region_3d.view_rotation=Quaternion((1,0,0),1.57079632679);sp.region_3d.view_perspective='ORTHO'
sp.shading.type='SOLID';sp.overlay.show_overlays=False
test=sym[pairs].copy();test[:,0]*=-1
error=float(np.max(np.abs(sym-test)))
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/HeadCloseup')
(root/'symmetry_check.json').write_text(json.dumps({'vertices':len(sym),'max_mirror_coordinate_error':error,'object':obj.name,'source':source.name},indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Profile_And_Symmetric_Review.blend'))
print('SYMMETRY_MAX_ERROR',error)
