"""Restore only absent generated Common assets from their latest autosave."""
from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1];base=root/'OfficeWorld/Saved/Autosaves/Game/MetaHumans/Common';dest=root/'OfficeWorld/Content/MetaHumans/Common';result=[]
for source in sorted(base.rglob('*.uasset'),key=lambda p:p.stat().st_mtime,reverse=True):
 parts=source.stem.rsplit('_Auto',1)
 if len(parts)!=2 or not parts[1].isdigit():continue
 target=(dest/source.relative_to(base).parent/(parts[0]+source.suffix)).resolve();assert dest.resolve() in target.parents
 row={'source':str(source),'target':str(target),'existed':target.exists()}
 if not target.exists():
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(str(source),str(target));row['restored']=True
 result.append(row)
(root/'OfficeWorld/Saved/character-autosave-restore.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
