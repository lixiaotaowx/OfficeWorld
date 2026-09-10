import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
s=bpy.context.scene
assert s.name=='Office_Concept_FinalLayout'
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Approved_Assets.blend'),copy=True)
library=bpy.data.collections.new('Asset Library - approved originals')
s.collection.children.link(library)
paths={}
for name in ['monitor','wireless_mouse','office_chair','lamp_architect','mug','pencil_holder','printer_desktop','keyboard_slim']:
 paths[name]=next((root/'AssetSources/Decor/MrEliptik_Office/Models').rglob(name+'.glb'))
for name in ['sansevieria_plant_small_potted','sansevieria_plant_large_potted','monstera_plant_medium_potted']:
 paths[name]=next((root/'AssetSources/Decor/TinyTreats_HousePlants/Models').rglob(name+'.gltf'))
paths['books']=next((root/'AssetSources/Decor/Kenney_Furniture/Models').rglob('books.glb'))
report=[]
for key,path in paths.items():
 before=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(path))
 imported=set(bpy.data.objects)-before
 meshes=[o for o in imported if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0]
 bpy.ops.object.join()
 obj=bpy.context.object
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 obj.name='LIB '+key
 for c in list(obj.users_collection):c.objects.unlink(obj)
 library.objects.link(obj)
 for o in imported:
  if o!=obj and o.name in bpy.data.objects and o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
 coords=[v.co for v in obj.data.vertices]
 lo=Vector([min(v[i] for v in coords) for i in range(3)])
 hi=Vector([max(v[i] for v in coords) for i in range(3)])
 offset=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for v in obj.data.vertices:v.co-=offset
 obj['source_asset']=str(path)
 obj.hide_render=True;obj.hide_set(True)
 report.append({'key':key,'bounds':list(hi-lo),'materials':[m.name for m in obj.data.materials]})
print(json.dumps(report))
