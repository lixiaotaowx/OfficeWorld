import sys,json,urllib.request,shutil,hashlib,concurrent.futures
from pathlib import Path
sys.path.insert(0,str(Path('Design/Migration/runtime').resolve()))
import gdown
root=Path('AssetSources/Characters/Quaternius'); report=[]
def fetch(f):
 p=Path(f.local_path);p.parent.mkdir(parents=True,exist_ok=True)
 for attempt in range(3):
  try:
   with urllib.request.urlopen('https://drive.google.com/uc?export=download&id='+f.id,timeout=60) as r:
    assert 'text/html' not in r.headers.get('Content-Type',''), 'HTML instead of asset'
    with p.with_suffix(p.suffix+'.part').open('wb') as w:shutil.copyfileobj(r,w)
   p.with_suffix(p.suffix+'.part').replace(p)
   return {'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
  except Exception as e:
   if attempt==2:return {'path':str(p),'error':str(e)}
for name,ident in [('UltimateModularMen','1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX'),('UltimateModularWomen','1720N9IGyQHXYvtvZJzazhxtTTlz-y2Vf')]:
 print('LISTING',name,flush=True)
 files=gdown.download_folder(id=ident,output=str(root/name),quiet=True,remaining_ok=False,use_cookies=False,skip_download=True)
 print('FILES',name,len(files),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for i,item in enumerate(pool.map(fetch,files)):
   report.append(item)
   if i%10==0:print('PROGRESS',name,i+1,flush=True)
 (root/'download-manifest.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print('DONE',len(report),'ERRORS',sum('error' in x for x in report),'BYTES',sum(x.get('bytes',0) for x in report),flush=True)
