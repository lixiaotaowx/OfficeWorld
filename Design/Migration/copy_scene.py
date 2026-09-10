import bpy,shutil,hashlib,json
from pathlib import Path
src=Path(r'G:/my/ai/code/irulerdream/resources/blender/自己弄的.blend')
out=Path(r'G:/C/wendang/ChatGPT/youxi/AssetSources/UserOfficeScene');out.mkdir(parents=True,exist_ok=True)
shutil.copy2(src,out/'OfficeScene_Original.blend')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out/'OfficeScene_Packed.blend'))
r={'source':str(src),'original_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'copy_sha256':hashlib.sha256((out/'OfficeScene_Original.blend').read_bytes()).hexdigest(),'unpacked_files':[i.name for i in bpy.data.images if i.source=='FILE' and not i.packed_file]}
(out/'provenance.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf8');print('COPIED',r)
