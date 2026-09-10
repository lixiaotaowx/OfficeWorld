import bpy,pathlib,json
from mathutils import Vector
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/ReferenceWomanTrial/Conform')
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(root/'Face_R07.fbx'))
r={'objects':[],'method':'Smooth lower-face vertical compression 20%, fading to zero at neck; topology, UVs and skin groups preserved.'}
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
for obj in bpy.data.objects:
 if obj.type!='MESH':continue
 matrix=obj.matrix_world.copy();inv=matrix.inverted();zs=[(matrix@v.co).z for v in obj.data.vertices];r['objects'].append({'name':obj.name,'vertices':len(zs),'z_bounds_m':[min(zs),max(zs)]})
 assert max(zs)<2.5 and max(zs)>1.4,'Unexpected mesh units; do not export'
 for v in obj.data.vertices:
  p=matrix@v.co;z=p.z
  if z<1.63:
   influence=smooth(1.445,1.525,z)
   p.z+=(1.63-z)*.20*influence
   p.x*=1+.035*influence*(1-smooth(1.58,1.63,z))
  v.co=inv@p
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.fbx(filepath=str(root/'Face_Compact_A.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=False,mesh_smooth_type='FACE',axis_forward='-Y',axis_up='Z')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Face_Compact_A.blend'));(root/'compact-template.json').write_text(json.dumps(r,indent=2))
