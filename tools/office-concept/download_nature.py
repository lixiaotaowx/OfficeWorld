import urllib.request,zipfile
from pathlib import Path
p=Path('AssetSources/Decor/Kenney_Nature');p.mkdir(exist_ok=True)
urllib.request.urlretrieve('https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip',p/'Nature.zip')
with zipfile.ZipFile(p/'Nature.zip') as z:
 assert z.testzip() is None
 for n in z.namelist():
  assert not Path(n).is_absolute() and '..' not in Path(n).parts
 z.extractall(p/'Models')
print([str(x) for x in p.rglob('*') if 'tree' in x.name.lower() and x.suffix in ['.glb','.gltf']][:45])

