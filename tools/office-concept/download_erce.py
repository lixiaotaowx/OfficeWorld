import http.cookiejar
import urllib.request
import urllib.parse
import re
import json
import zipfile
import hashlib
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--office', action='store_true')
args = parser.parse_args()
pack = 'Erce_Trees'
author = 'erces'
root = Path('AssetSources/Decor') / pack
root.mkdir(parents=True, exist_ok=True)
client = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
base = 'https://erces.itch.io/free-stylized-3d-tree-pack'
page = client.open(base + '/purchase', timeout=30).read().decode()
token = re.search(r'name="csrf_token" value="([^"]+)"', page).group(1)
req = urllib.request.Request(base + '/download_url',
    data=urllib.parse.urlencode({'csrf_token': token}).encode(),
    headers={'Referer': base + '/purchase'})
result = json.load(client.open(req, timeout=30))
download_page = client.open(result['url'], timeout=30).read().decode()
token = re.search(r'name="csrf_token" value="([^"]+)"', download_page).group(1)
upload = re.search(r'data-upload_id="(\d+)"', download_page).group(1)
req = urllib.request.Request(base + '/file/' + upload,
    data=urllib.parse.urlencode({'csrf_token': token}).encode(),
    headers={'Referer': result['url']})
info = json.load(client.open(req, timeout=30))
archive = root / (pack + '_Free.zip')
assert not archive.exists(), 'Archive already exists; do not redownload.'
with client.open(info['url'], timeout=60) as response:
    archive.write_bytes(response.read())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for member in z.infolist():
        dest = (root / 'Models' / member.filename).resolve()
        assert str(dest).startswith(str((root / 'Models').resolve()) + '\\')
    z.extractall(root / 'Models')
    names = z.namelist()
report = {'source': base, 'author': author, 'license': 'Author grants free use in projects on source page; inspect archive terms',
          'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
          'files': names, 'modifications': 'None; original free package extracted.'}
(root / 'provenance.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps({'bytes': report['bytes'], 'files': len(names),
                  'license_files': [n for n in names if 'license' in n.lower()]}))
