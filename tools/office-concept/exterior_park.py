import bpy,math,sys
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi');sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import material
s=bpy.context.scene
assert not s.get('exterior_park_v1')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Exterior_Park.blend'),copy=True)
col=bpy.data.collections.new('Exterior park and panorama');s.collection.children.link(col)
image=bpy.data.images.load(str(root/'AssetSources/OfficeConcept/Textures/Park_City_Panorama.png'),check_existing=True);image.pack()
m=bpy.data.materials.new('Park panorama - camera backdrop');m.use_nodes=True
n=m.node_tree.nodes;n.clear();links=m.node_tree.links
out=n.new('ShaderNodeOutputMaterial');tex=n.new('ShaderNodeTexImage');tex.image=image
em=n.new('ShaderNodeEmission');em.inputs['Strength'].default_value=.8;links.new(tex.outputs['Color'],em.inputs['Color'])
transparent=n.new('ShaderNodeBsdfTransparent');geo=n.new('ShaderNodeNewGeometry');mix=n.new('ShaderNodeMixShader')
links.new(geo.outputs['Backfacing'],mix.inputs[0]);links.new(em.outputs[0],mix.inputs[1]);links.new(transparent.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],out.inputs[0])
verts=[];faces=[];count=128
for i in range(count+1):
 a=2*math.pi*i/count
 for z in [-20,28]:verts.append((.5+45*math.cos(a),.85+45*math.sin(a),z))
for i in range(count):faces.append((2*i,2*i+1,2*i+3,2*i+2))
mesh=bpy.data.meshes.new('Panorama ring mesh');mesh.from_pydata(verts,[],faces);mesh.materials.append(m)
uv=mesh.uv_layers.new()
for i,p in enumerate(mesh.polygons):
 for li,coord in zip(p.loop_indices,[(i/count,0),(i/count,1),((i+1)/count,1),((i+1)/count,0)]):uv.data[li].uv=coord
obj=bpy.data.objects.new('Park city panorama ring',mesh);col.objects.link(obj)
obj.visible_shadow=False;obj.visible_diffuse=False;obj.visible_glossy=False;obj.visible_transmission=True
# Tree trunks sit outside the office footprint; linked duplicates stay lightweight.
base=root/'AssetSources/Decor/Kenney_Nature/Models/Models/GLTF format'
templates=[]
for species in ['tree_oak','tree_detailed']:
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(base/(species+'.glb')))
 imported=set(bpy.data.objects)-before;meshes=[o for o in imported if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes:
  o.select_set(True);world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
 bpy.context.view_layer.objects.active=meshes[0]
 if len(meshes)>1:bpy.ops.object.join()
 o=bpy.context.object;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 lo=Vector([min(v.co[i] for v in o.data.vertices) for i in range(3)]);hi=Vector([max(v.co[i] for v in o.data.vertices) for i in range(3)])
 center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for v in o.data.vertices:v.co=(v.co-center)/(hi.z-lo.z)
 o.rotation_mode='XYZ';templates.append(o)
 for empty in imported:
  if empty.name in bpy.data.objects and empty.type!='MESH':bpy.data.objects.remove(empty,do_unlink=True)
for i,(x,y,h) in enumerate([(-13,-2,5.3),(-14,5,6.2),(-8,12,5.8),(-1,13,6.5),(7,13,5.5),(14,8,6)]):
 src=templates[i%2];o=src.copy();o.data=src.data;col.objects.link(o);o.name='Exterior tree '+str(i+1)
 o.location=(x,y,-.35);o.scale=(h,h,h);o.rotation_euler.z=i*1.7
for o in templates:bpy.data.objects.remove(o,do_unlink=True)
# A simple matte ground skirt connects near trees to the distant park.
ground=material('Exterior grass - quiet olive',(.19,.25,.105),1)
bpy.ops.mesh.primitive_circle_add(vertices=128,radius=44,fill_type='NGON',location=(.5,.85,-.38))
o=bpy.context.object;o.name='Exterior park ground';o.data.materials.append(ground)
for c in list(o.users_collection):c.objects.unlink(o)
col.objects.link(o)
s['exterior_park_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Six downloaded trees and panorama ring saved. Image dimensions',list(image.size))
