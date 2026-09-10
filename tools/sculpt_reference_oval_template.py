import bpy,pathlib,json,math
from mathutils import Vector
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/ReferenceWomanTrial/Conform')
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(root/'Face_R07.fbx'))
r={'objects':[],'method':'Oval correction: no cheek widening; taper lower jaw 16%, round chin by a smooth 6mm central extension; same source topology.'}
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
   p.x*=1-.16*influence*(1-smooth(1.545,1.60,z))
   p.z-=.006*math.exp(-(p.x/.032)**2-((z-1.54)/.022)**2)*influence
  v.co=inv@p
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.fbx(filepath=str(root/'Face_Oval_B.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=False,mesh_smooth_type='FACE',axis_forward='-Y',axis_up='Z')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Face_Oval_B.blend'));(root/'oval-template.json').write_text(json.dumps(r,indent=2))
