import urllib.request,pathlib,re,json
p=pathlib.Path('AssetSources/Realistic/OfficePeople');p.mkdir(parents=True,exist_ok=True)
url='https://www.fab.com/listings/7e58d5c5-5666-4ab2-9c4e-011eeaba3c07'
b=urllib.request.urlopen(url).read().decode();(p/'fab-sneakers-page.html').write_text(b,encoding='utf-8')
print('\n'.join(re.findall(r'<script[^>]+src="([^"]+)',b)[-8:]));print('mhpkg',b.find('mhpkg'))
for term in ['assetFormats','downloadUrl','mhpkg','listingId']:
 i=b.find(term)
 if i>=0:print(term,b[max(0,i-150):i+300])
