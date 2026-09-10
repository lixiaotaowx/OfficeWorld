from pathlib import Path
import zipfile,json
root=Path(r'G:/my/ai/光隙第二集/下载/h')
for name in ['drive-download-20260909T060828Z-1-001.zip','drive-download-20260909T060915Z-1-001.zip']:
 p=root/name
 with zipfile.ZipFile(p) as z:
  names=z.namelist();print(json.dumps({'name':name,'bytes':p.stat().st_size,'files':len(names),'sample':names[:16],'licenses':[n for n in names if 'license' in n.lower()],'bad_file':z.testzip()},ensure_ascii=False))
