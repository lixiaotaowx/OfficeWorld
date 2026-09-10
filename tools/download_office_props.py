import json,pathlib,urllib.request,concurrent.futures,hashlib,time
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished';catalog=json.loads((root/'polyhaven-models.json').read_text());assets=['desk_lamp_arm_01','binder_notebook','stationery_supplies','potted_plant_02']
jobs=[]
for asset in assets:
 r=json.loads((root/asset/'files.json').read_text());item=r['fbx']['2k']['fbx']
 for name,meta in [(asset+'_2k.fbx',item)]+list(item['include'].items()):jobs.append((asset,name,meta))
 for kind in ['nor_dx','Rough','Metal']:
  meta=r.get(kind,{}).get('2k',{}).get('png')
  if meta:jobs.append((asset,'textures/'+meta['url'].rsplit('/',1)[-1],meta))
def download(job):
 asset,name,meta=job;p=root/asset/name;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() and p.stat().st_size==meta['size']:return name
 for attempt in range(3):
  try:
   req=urllib.request.Request(meta['url'],headers={'User-Agent':'OfficeWorld asset importer'});data=urllib.request.urlopen(req,timeout=50).read();assert len(data)==meta['size'];assert hashlib.md5(data).hexdigest()==meta['md5'];p.write_bytes(data);return name
  except Exception:
   if attempt==2:raise
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for n in pool.map(download,jobs):print(n,flush=True)
for asset in assets:(root/asset/'SOURCE.json').write_text(json.dumps({'asset':asset,'authors':catalog[asset]['authors'],'url':'https://polyhaven.com/a/'+asset,'license':'CC0','files_verified':'MD5 and file size'},indent=2))
