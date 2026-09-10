import bpy,json,pathlib
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
root=pathlib.Path(__file__).resolve().parents[1]
bpy.ops.import_scene.fbx(filepath=str(root/'AssetSources/Realistic/Finished/Converted/D1_OfficeDesk.fbx'))
dep=bpy.context.evaluated_depsgraph_get();out={}
for x in [0,.15,.30,.45,.60]:
 out[str(x)]={}
 for ue_y in [0,.20,.30,.40,.50,.55,.60,.70,.80]:
  hit,loc,normal,idx,obj,mat=bpy.context.scene.ray_cast(dep,Vector((x,-ue_y,2)),Vector((0,0,-1)))
  out[str(x)][str(ue_y)]=round(loc.z,3) if hit else None
(root/'OfficeWorld/Saved/desk-surface.json').write_text(json.dumps(out,indent=2))
