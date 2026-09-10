import urllib.request,json
for name in ['tree_small_02','jacaranda_tree']:
 try:
  d=json.load(urllib.request.urlopen('https://api.polyhaven.com/files/'+name))
  print(name, list(d))
  print(json.dumps(d.get('gltf',{}))[:6000])
 except Exception as e:print(str(e))
