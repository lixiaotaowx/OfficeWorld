import pathlib,json,urllib.request,uuid,hashlib,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Extension'
choices=[('multigym','gym','13e21f4f-e42b-4d25-8455-6dd2d4d9893e'),('dumbbells','gym','d6514773-3d06-4cc6-852a-774c9ecc9841'),('pool_table','pool_table','84a78996-6ed0-4833-a110-b00c36c348a8'),('treadmill','treadmill','b61fd2c9-0981-46f9-999a-51449ea6ea89'),('cue_rack','pool_cue','b0f7ab8a-4576-4961-bdce-fc77c28a72ba'),('toilet','toilet','afc5eb25-f7aa-45b3-9328-c5427b605a6a')]
def download(choice):
 kind,query,base=choice;meta=next(x for x in json.loads((root/(query+'-search.json')).read_text())['results'] if x['assetBaseId']==base);assert meta['isFree'] and meta['license'] in ['royalty_free','cc_zero']
 dest=root/kind;dest.mkdir(exist_ok=True);(dest/'metadata.json').write_text(json.dumps(meta));f=next(x for x in meta['files'] if x['fileType']=='blend')
 response=json.load(urllib.request.urlopen(f['downloadUrl']+'?scene_uuid='+str(uuid.uuid4()),timeout=45));url=response['filePath'];target=dest/(kind+'.blend')
 if not target.exists():
  data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.blenderkit.com/'}),timeout=90).read();assert len(data)==f['fileUploadSize'];target.write_bytes(data)
 (dest/'SOURCE.json').write_text(json.dumps({'name':meta['name'],'author':meta['author']['fullName'],'source':'https://www.blenderkit.com/asset-gallery-detail/'+base+'/','license':meta['license'],'license_url':'https://www.blendkit.com/docs/licenses/','free':True,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()},indent=2));return kind,target.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for result in pool.map(download,choices):print(result,flush=True)

