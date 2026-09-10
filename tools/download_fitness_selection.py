import pathlib,json,urllib.request,uuid,hashlib,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Extension'
choices=[('bench_press','weight_bench','eb1a5394-a02f-4cb0-a5ed-fe8be786f3df'),('pool_balls','pool_balls','8de0c94d-e5ea-4471-9994-ad6a98a4c6c1')]
def download(choice):
 kind,query,base=choice;meta=next(x for x in json.loads((root/(query+'-search.json')).read_text())['results'] if x['assetBaseId']==base);assert meta['isFree'] and meta['license'] in ['royalty_free','cc_zero']
 dest=root/kind;dest.mkdir(exist_ok=True);(dest/'metadata.json').write_text(json.dumps(meta));f=next(x for x in meta['files'] if x['fileType']=='blend')
 response=json.load(urllib.request.urlopen(f['downloadUrl']+'?scene_uuid='+str(uuid.uuid4()),timeout=45));url=response['filePath'];target=dest/(kind+'.blend')
 if not target.exists():
  data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.blenderkit.com/'}),timeout=90).read();assert len(data)==f['fileUploadSize'];target.write_bytes(data)
 (dest/'SOURCE.json').write_text(json.dumps({'name':meta['name'],'author':meta['author']['fullName'],'source':'https://www.blenderkit.com/asset-gallery-detail/'+base+'/','license':meta['license'],'license_url':'https://www.blendkit.com/docs/licenses/','free':True,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()},indent=2));return kind,target.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for result in pool.map(download,choices):print(result,flush=True)


