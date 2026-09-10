from pathlib import Path
import zipfile,json,shutil,hashlib
src=Path(r'G:/my/ai/光隙第二集/下载/h');root=Path('AssetSources/Characters/Quaternius').resolve();report=[]
for fn,name in [('drive-download-20260909T060828Z-1-001.zip','UltimateModularWomen'),('drive-download-20260909T060915Z-1-001.zip','UltimateModularMen')]:
 p=src/fn;archive=root/(name+'.zip');shutil.copy2(p,archive);dest=root/name;dest.mkdir(exist_ok=True)
 with zipfile.ZipFile(archive) as z:
  for entry in z.infolist():
   target=(dest/entry.filename).resolve();assert dest in target.parents or target==dest
   z.extract(entry,dest)
  assert all((dest/e.filename).stat().st_size==e.file_size for e in z.infolist() if not e.is_dir())
 print(name,(dest/'License.txt').read_text(errors='replace'))
 models=[]
 for f in (dest/'Individual Characters/glTF').glob('*.gltf'):
  d=json.loads(f.read_text());models.append({'name':f.stem,'animations':[a.get('name') for a in d.get('animations',[])],'bytes':f.stat().st_size})
 report.append({'pack':name,'source':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'verified':True,'files':len(z.infolist()),'models':models})
(root/'verified-user-downloads.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps([{'pack':r['pack'],'files':r['files'],'models':[m['name'] for m in r['models']],'animations':r['models'][0]['animations'] if r['models'] else []} for r in report],ensure_ascii=False))
