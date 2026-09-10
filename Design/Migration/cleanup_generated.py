from pathlib import Path
import hashlib,json,shutil,datetime
root=Path.cwd().resolve()
targets=['OfficeWorld/DerivedDataCache','OfficeWorld/Intermediate','OfficeWorld/Saved/Cooked','OfficeWorld/Saved/StagedBuilds','OfficeWorld/Saved/Shaders','OfficeWorld/Saved/ShaderDebugInfo','OfficeWorld/Saved/Temp','Builds/OfficeWorld']
keep=[root/'OfficeWorld/Content',root/'OfficeWorld/Config',root/'OfficeWorld/Build']
files=[p for d in keep for p in d.rglob('*') if p.is_file()]+list((root/'OfficeWorld').glob('*.uproject'))
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
manifest={str(p.relative_to(root)):{'bytes':p.stat().st_size,'sha256':digest(p)} for p in files}
out=root/'Design/Migration'
(out/'ue-preserved-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
report={'date':datetime.datetime.now().isoformat(),'deleted':[],'preserved_files':len(manifest)}
for rel in targets:
 p=(root/rel).resolve()
 assert root in p.parents and p!=root and rel in targets
 if not p.exists():continue
 assert not p.is_symlink()
 entries=list(p.rglob('*'))
 assert not any(x.is_symlink() or (hasattr(x,'is_junction') and x.is_junction()) for x in entries)
 size=sum(x.stat().st_size for x in entries if x.is_file())
 shutil.rmtree(p)
 report['deleted'].append({'path':rel,'bytes':size,'verified_absent':not p.exists()})
report['preserved_verified']=all(p.is_file() and digest(p)==manifest[str(p.relative_to(root))]['sha256'] for p in files)
report['bytes_freed']=sum(x['bytes'] for x in report['deleted'])
(out/'cleanup-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))

