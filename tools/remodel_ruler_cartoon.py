"""Non-destructive remodel; source rig and animation library remain intact."""
import bpy, os, sys, shutil
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(ROOT,'tools'))
from ruler_cartoon_groom import build_all
from ruler_detail_eyes import refine_eyes
source=os.path.join(ROOT,'AssetSources/Characters/RulerMascot/detail-v2/ruler-detailed.blend')
out=os.path.join(ROOT,'AssetSources/Characters/RulerMascot/cartoon-fit-v4')
os.makedirs(out,exist_ok=True)
current=os.path.join(ROOT,'OfficeWeb/public/assets/characters/ruler.glb')
backup=os.path.join(out,'ruler-before.glb')
if not os.path.exists(backup): shutil.copy2(current,backup)
bpy.ops.wm.open_mainfile(filepath=source)
build_all()
# Existing eyes, hats and glasses remain intact.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'ruler-cartoon.blend'))
sys.argv=['export','--',current,'full']
export=os.path.join(ROOT,'Build/ruler/export_ruler.py')
exec(compile(open(export,encoding='utf-8-sig').read(),export,'exec'))
