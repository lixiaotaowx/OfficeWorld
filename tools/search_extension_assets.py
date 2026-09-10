import urllib.request,urllib.parse,json,pathlib,concurrent.futures
out=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Extension';out.mkdir(exist_ok=True)
def search(q):
 url='https://www.blenderkit.com/api/v1/search/?'+urllib.parse.urlencode({'query':q+' asset_type:model is_free:true','page_size':30})
 data=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45))
 (out/(q.replace(' ','_')+'-search.json')).write_text(json.dumps(data))
 return q,[{'name':x['name'],'id':x['assetBaseId'],'license':x['license'],'free':x['isFree'],'bytes':next((f['fileUploadSize'] for f in x['files'] if f['fileType']=='blend'),0)} for x in data['results']]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for q,items in pool.map(search,['pool table','treadmill','gym','toilet','pool cue']):print(q,json.dumps(items),flush=True)
