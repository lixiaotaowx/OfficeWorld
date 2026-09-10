import bpy,math,sys
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import material,cylinder
s=bpy.context.scene
assert not s.get('warm_palette_space_v1')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Warm_Palette.blend'),copy=True)
sage=material('Chair upholstery - sage',(.22,.32,.23),.8)
cream=material('Chair frame - warm ivory',(.73,.73,.66),.48)
terra=material('Manager upholstery - muted clay',(.47,.23,.12),.8)
for o in s.objects:
 if 'approved chair' not in o.name:continue
 # Slot overrides keep linked meshes while separating manager upholstery.
 for slot in o.material_slots:
  old=slot.material.name
  slot.link='OBJECT'
  if old.startswith('Black'):slot.material=terra if o.name.startswith('Manager') else sage
  elif old.startswith('GreyMetal'):slot.material=cream
floor=bpy.data.objects['Architecture / ivory floor']
m=material('Floor - warm limestone 120cm',(.66,.58,.45),.55)
floor.data.materials.clear();floor.data.materials.append(m)
nodes=m.node_tree.nodes;links=m.node_tree.links
p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
geo=nodes.new('ShaderNodeNewGeometry')
brick=nodes.new('ShaderNodeTexBrick');brick.offset=0
brick.inputs['Color1'].default_value=(.67,.60,.49,1)
brick.inputs['Color2'].default_value=(.72,.65,.54,1)
brick.inputs['Mortar'].default_value=(.56,.51,.44,1)
brick.inputs['Scale'].default_value=1
brick.inputs['Brick Width'].default_value=1.2
brick.inputs['Row Height'].default_value=1.2
brick.inputs['Mortar Size'].default_value=.0025
links.new(geo.outputs['Position'],brick.inputs['Vector'])
links.new(brick.outputs['Color'],p.inputs['Base Color'])
col=bpy.data.collections.new('13 Space accents');s.collection.children.link(col)
def move_collection(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 col.objects.link(o)
def asset(name,label,pos,width,angle=0):
 path=next((root/'AssetSources/Decor/Kenney_Furniture/Models/Models/GLTF format').glob(name+'.glb'))
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path))
 imported=set(bpy.data.objects)-before
 meshes=[o for o in imported if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0]
 if len(meshes)>1:bpy.ops.object.join()
 o=bpy.context.object;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 pts=[v.co for v in o.data.vertices]
 lo=Vector([min(v[i] for v in pts) for i in range(3)])
 hi=Vector([max(v[i] for v in pts) for i in range(3)])
 mid=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for v in o.data.vertices:v.co-=mid
 o.name=label;o.rotation_mode='XYZ';o.rotation_euler=(0,0,angle)
 o.scale=(width/(hi.x-lo.x),)*3;o.location=pos;move_collection(o)
 o['source_asset']=str(path)
 return o
rugmat=material('Collaboration rug - woven sage',(.32,.39,.29),.93)
rug=cylinder('Collaboration zone rug',(7,-2,.012),1.9,.018,rugmat,64);move_collection(rug)
table=asset('tableRound','Collaboration round table',(7,-2,.025),1.35)
bpy.context.view_layer.update()
top=table.dimensions.z+.025
for i,angle in enumerate([0,math.tau/3,2*math.tau/3]):
 pos=(7+math.cos(angle)*1.12,-2+math.sin(angle)*1.12,.025)
 stool=asset('stoolBar','Collaboration stool '+str(i),pos,.44,angle)
 # Match seat to the imported table, preserving clear knee room.
 bpy.context.view_layer.update();stool.scale.z*=max(.42,top-.28)/stool.dimensions.z
asset('bookcaseOpenLow','Window low storage',(-3.6,7.65,.02),2.2)
asset('books','Window storage books',(-3.9,7.55,.86),.38)
src=bpy.data.objects['Island_A approved desk plant']
plant=src.copy();plant.data=src.data;plant.name='Collaboration table plant'
col.objects.link(plant);plant.location=(7,-2,top);plant.scale=src.scale*.75
# Keep the current user view and all light settings.
for img in bpy.data.images:
 if img.source=='FILE' and not img.packed_file:
  try:img.pack()
  except RuntimeError:pass
s['warm_palette_space_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Chair colors, warm tiled floor, round conversation zone and low storage saved.')
