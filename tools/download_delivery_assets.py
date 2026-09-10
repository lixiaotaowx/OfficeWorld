import json,pathlib,urllib.request,concurrent.futures,hashlib
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
catalog=json.loads((root/'polyhaven-models.json').read_text())
assets=['tree_small_02','modular_street_seating']
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OfficeWorld Asset Importer'}),timeout=45).read()
def asset_download(asset):
 directory=root/asset;directory.mkdir(parents=True,exist_ok=True)
 meta=json.loads(get('https://api.polyhaven.com/files/'+asset));(directory/'files.json').write_text(json.dumps(meta,indent=2));item=meta['fbx']['2k']['fbx']
 jobs=[(asset+'_2k.fbx',item)]+list(item.get('include',{}).items())
 for name,entry in jobs:
  p=directory/name;p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists() and p.stat().st_size==entry['size'] and hashlib.md5(p.read_bytes()).hexdigest()==entry['md5']:continue
  data=get(entry['url']);assert len(data)==entry['size'] and hashlib.md5(data).hexdigest()==entry['md5'],name;p.write_bytes(data)
 (directory/'SOURCE.json').write_text(json.dumps({'authors':catalog[asset]['authors'],'url':'https://polyhaven.com/a/'+asset,'license':'CC0','verification':'source MD5 and byte size','modifications':'flatten hierarchy, retain original PBR textures, adapt placement'},indent=2));return asset
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for a in pool.map(asset_download,assets):print(a,flush=True)
