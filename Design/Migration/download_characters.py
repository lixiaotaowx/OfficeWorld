import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('Design/Migration/runtime').resolve()))
import gdown
root=Path('AssetSources/Characters/Quaternius');root.mkdir(parents=True,exist_ok=True)
for name,ident in [('UltimateModularMen','1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX'),('UltimateModularWomen','1720N9IGyQHXYvtvZJzazhxtTTlz-y2Vf')]:
 print('PACK',name,flush=True)
 try:
  result=gdown.download_folder(id=ident,output=str(root/name),quiet=True,remaining_ok=True,use_cookies=False)
  print('RESULT',name,result,flush=True)
 except Exception as e:print('ERROR',name,str(e),flush=True)

