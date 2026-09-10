import json,pathlib,urllib.request,concurrent.futures,hashlib
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Plant'
r=json.loads((root/'files.json').read_text());item=r['fbx']['2k']['fbx'];files=[('potted_plant_01_2k.fbx',item)]+list(item['include'].items())
def download(entry):
 name,meta=entry;p=root/name;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() and p.stat().st_size==meta['size']:return name
 req=urllib.request.Request(meta['url'],headers={'User-Agent':'OfficeWorld asset importer'})
 data=urllib.request.urlopen(req,timeout=60).read();assert len(data)==meta['size'];assert hashlib.md5(data).hexdigest()==meta['md5'];p.write_bytes(data);return name
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for n in pool.map(download,files):print(n,flush=True)
(root/'SOURCE.txt').write_text('Potted Plant 01 by Rico Cilliers\nhttps://polyhaven.com/a/potted_plant_01\nCC0\n2K model and original PBR textures.\n')
