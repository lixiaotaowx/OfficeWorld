import bpy,pathlib,json,numpy as np
from mathutils import Vector
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/AssetSources/Realistic/OfficePeople/Fitting')
result={}
for label,path in [('body',root/'Office_F01_Body.fbx'),('blender_cloth',root/'Office_F01/Clothing.fbx'),('ue_cloth',root/'Office_F01/UE_Clothing.fbx'),('native_outfit',root/'Office_F01_DefaultOutfit.fbx')]:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(path))
 arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
 result[label]={'bones':{},'meshes':[]}
 for name in ['pelvis','spine_04','spine_05','neck_01','clavicle_l','upperarm_l','lowerarm_l','thigh_l','foot_l']:
  bone=arm.data.bones.get(name)
  if bone:
   mat=arm.matrix_world@bone.matrix_local
   result[label]['bones'][name]={'pos':list(mat.translation),'quat':list(mat.to_quaternion()),'scale':list(mat.to_scale())}
 for o in bpy.data.objects:
  if o.type=='MESH':
   points=np.array([o.matrix_world@v.co for v in o.data.vertices]);result[label]['meshes'].append({'name':o.name,'min':points.min(axis=0).tolist(),'max':points.max(axis=0).tolist()})
(root/'Office_F01/bind-diagnostic.json').write_text(json.dumps(result,indent=2))
