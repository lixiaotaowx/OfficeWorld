import bpy,json
from pathlib import Path
s=bpy.context.scene
base=Path('G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept')
backup=base/'备份_烘焙前_20260912.blend'
assert not backup.exists(),'Backup already exists; choose another name'
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
work=base/'备份_独立UV烘焙_20260912.blend'
assert not work.exists(),'Working copy already exists'
bpy.ops.wm.save_as_mainfile(filepath=str(work))
print('Saved immutable pre-bake copy and working copy')
print('mesh count',sum(o.type=='MESH' for o in s.objects))
print('bake',bpy.ops.object.bake.get_rna_type().properties['pass_filter'].enum_items.keys())
print('device',s.cycles.device)
