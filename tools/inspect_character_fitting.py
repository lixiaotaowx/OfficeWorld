import bpy,json,pathlib
from mathutils import Vector
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/AssetSources/Realistic/OfficePeople')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'Fitting/OfficePerson01_Body.fbx'))
def bounds(o):
 p=[o.matrix_world@Vector(x) for x in o.bound_box]
 return [[min(v[i] for v in p),max(v[i] for v in p)] for i in range(3)]
r={'objects':[{'name':o.name,'type':o.type,'bounds':bounds(o),'scale':list(o.scale)} for o in bpy.data.objects]}
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
r['bones']={b.name:list(arm.matrix_world@b.head_local) for b in arm.data.bones if b.name in ['root','pelvis','spine_01','spine_04','neck_01','upperarm_l','lowerarm_l','hand_l','thigh_l','calf_l','foot_l','ball_l','upperarm_r','foot_r']}
bpy.ops.wm.obj_import(filepath=str(root/'MakeHumanCC0/clothes/male_casualsuit01/male_casualsuit01.obj'))
r['garment']=[{'name':o.name,'bounds':bounds(o),'verts':len(o.data.vertices)} for o in bpy.context.selected_objects]
(root/'Fitting/inspect.json').write_text(json.dumps(r,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(root/'Fitting/fit_inspection.blend'))
