import pathlib,json,urllib.request,hashlib,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished'
names=['potted_plant_04','calathea_orbifolia_01','decorative_book_set_01','ceramic_vase_01']
def read(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
def work(name):
 dest=root/name;dest.mkdir(exist_ok=True)
 data=json.loads(read('https://api.polyhaven.com/files/'+name));(dest/'files.json').write_text(json.dumps(data))
 meta=json.loads(read('https://api.polyhaven.com/info/'+name));(dest/'SOURCE.json').write_text(json.dumps({'source':'https://polyhaven.com/a/'+name,'license':'CC0','metadata':meta},indent=2))
 item=data['fbx']['2k']['fbx'];jobs=[(name+'_2k.fbx',item)]+list(item['include'].items())
 for channel in ['nor_dx','Rough','Metal','alpha']:
  m=data.get(channel,{}).get('2k',{}).get('png')
  if m:jobs.append(('textures/'+m['url'].rsplit('/',1)[-1],m))
 for filename,info in jobs:
  p=dest/filename;p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists() and p.stat().st_size==info['size']:continue
  b=read(info['url']);assert len(b)==info['size'] and hashlib.md5(b).hexdigest()==info['md5'];p.write_bytes(b)
 return name,len(jobs)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for r in pool.map(work,names):print(r,flush=True)
