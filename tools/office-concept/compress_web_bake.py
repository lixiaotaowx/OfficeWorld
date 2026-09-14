"""Repack GLB image buffer views as WebP, keeping model/UV data unchanged."""
import io,json,struct
from pathlib import Path
from PIL import Image
root=Path('G:/C/wendang/ChatGPT/youxi')
path=root/'OfficeWeb/public/assets/office-baked.glb'
raw=path.read_bytes();length=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+length]);binary=raw[28+length:]
views=doc['bufferViews'];replacements={}
for image in doc.get('images',[]):
 index=image['bufferView'];view=views[index];start=view.get('byteOffset',0)
 im=Image.open(io.BytesIO(binary[start:start+view['byteLength']]))
 out=io.BytesIO();im.save(out,format='WEBP',quality=72,method=6)
 replacements[index]=out.getvalue();image['mimeType']='image/webp'
for texture in doc.get('textures',[]):
 if 'source' in texture:
  texture.setdefault('extensions',{})['EXT_texture_webp']={'source':texture.pop('source')}
for key in ['extensionsUsed','extensionsRequired']:
 doc.setdefault(key,[])
 if 'EXT_texture_webp' not in doc[key]:doc[key].append('EXT_texture_webp')
packed=bytearray()
for index,view in enumerate(views):
 start=view.get('byteOffset',0)
 data=replacements.get(index,binary[start:start+view['byteLength']])
 packed.extend(b'\0'*((-len(packed))%4));view['byteOffset']=len(packed);view['byteLength']=len(data)
 packed.extend(data)
doc['buffers'][0]['byteLength']=len(packed)
encoded=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode()
encoded+=b' '*((-len(encoded))%4);packed.extend(b'\0'*((-len(packed))%4))
result=struct.pack('<4sII',b'glTF',2,28+len(encoded)+len(packed))
result+=struct.pack('<I4s',len(encoded),b'JSON')+encoded
result+=struct.pack('<I4s',len(packed),b'BIN\0')+packed
path.write_bytes(result)
print(json.dumps({'before':len(raw),'after':len(result),'images':len(replacements)}))
