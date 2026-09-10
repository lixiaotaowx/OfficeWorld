import pathlib,json,urllib.request,hashlib,uuid
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/WorkstationUpgrade'
choices=[('monitor','ae1a4d88-b999-41d5-971b-2e54e38a2494'),('keyboard','1db0380b-c09a-43e6-94e7-fc85cd580b79'),('mouse','9701990b-0eac-4d85-abdf-811034e11450')]
scene_file=root/'download-scene-id.txt'
if not scene_file.exists():scene_file.write_text(str(uuid.uuid4()))
for kind,base in choices:
    meta=next(x for x in json.loads((root/(kind+'-search.json')).read_text())['results'] if x['assetBaseId']==base)
    assert meta['isFree'] and meta['license'] in ['royalty_free','cc_zero']
    dest=root/kind;dest.mkdir(exist_ok=True)
    (dest/'metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    file=next(x for x in meta['files'] if x['fileType']=='blend')
    try:
        response=json.load(urllib.request.urlopen(file['downloadUrl']+'?scene_uuid='+scene_file.read_text().strip(),timeout=30))
        url=response.get('filePath') or response.get('url')
        if not url:print(kind,'download response',response);continue
        target=dest/(kind+'.blend')
        if not target.exists():
            request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.blenderkit.com/'})
            data=urllib.request.urlopen(request,timeout=60).read();assert len(data)==file['fileUploadSize'];target.write_bytes(data)
        (dest/'SOURCE.json').write_text(json.dumps({'name':meta['name'],'author':meta['author']['fullName'],'source':'https://www.blenderkit.com/asset-gallery-detail/'+base+'/','license':meta['license'],'license_url':'https://www.blendkit.com/docs/licenses/','free':True,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'download_api':file['downloadUrl'],'bytes':target.stat().st_size},indent=2),encoding='utf-8')
        print(kind,'downloaded',target.stat().st_size,flush=True)
    except Exception as e:print(kind,type(e).__name__,str(e),flush=True)
