import urllib.request
url='https://api.polyhaven.com/files/tree_small_02'
r=urllib.request.Request(url,headers={'User-Agent':'OfficeWorld asset downloader (personal project)','Referer':'https://polyhaven.com/'})
try:
 data=urllib.request.urlopen(r,timeout=15).read();open('Design/OfficeConcept/tree-files.json','wb').write(data);print(data[:2000])
except Exception as e:print(e)
