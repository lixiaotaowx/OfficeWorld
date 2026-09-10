import bpy
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
base=root/'AssetSources/Decor/Erce_Trees/Models/FreeStylizedTreePack_Erce/Textures'
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Erce_Trees.blend'),copy=True)
for matname,filename in [('T_Leaf','T_Leaf_01.png'),('T_Trunk','T_Trunk.png')]:
 m=bpy.data.materials[matname]
 im=bpy.data.images.load(str(base/filename),check_existing=True);im.pack()
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE':n.image=im
 p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 p.inputs['Roughness'].default_value=.85
 if matname=='T_Leaf':
  tex=next(n for n in m.node_tree.nodes if n.type=='TEX_IMAGE')
  hue=m.node_tree.nodes.new('ShaderNodeHueSaturation');hue.inputs['Saturation'].default_value=.72
  m.node_tree.links.new(tex.outputs['Color'],hue.inputs['Color']);m.node_tree.links.new(hue.outputs['Color'],p.inputs['Base Color'])
col=bpy.data.collections['Exterior park and panorama']
for i in range(1,7):
 old=bpy.data.objects.get('Exterior tree '+str(i))
 if old:bpy.data.objects.remove(old,do_unlink=True)
for idx,(name,positions) in enumerate([
 ('SM_Tree_01',[(-13.1,-2,5.3),(-7,12,5.8),(8,12.5,5.5)]),
 ('SM_Tree_05',[(-13.1,5,5.1),(.2,12,5.4),(14,7.5,5.2)])]):
 src=bpy.data.objects[name];mesh=src.data.copy();mesh.transform(src.matrix_world)
 lo=Vector([min(v.co[j] for v in mesh.vertices) for j in range(3)]);hi=Vector([max(v.co[j] for v in mesh.vertices) for j in range(3)])
 center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for v in mesh.vertices:v.co=(v.co-center)/(hi.z-lo.z)
 for j,(x,y,h) in enumerate(positions):
  o=bpy.data.objects.new('Erce exterior '+('broad ' if idx==0 else 'slender ')+str(j+1),mesh);col.objects.link(o)
  o.location=(x,y,-.35);o.scale=(h,h,h);o.rotation_euler.z=j*1.5+idx*.4
for name in ['SM_Tree_01','SM_Tree_02','SM_Tree_03','SM_Tree_04','SM_Tree_05']:
 o=bpy.data.objects.get(name)
 if o and not o.users_collection:bpy.data.objects.remove(o,do_unlink=True)
s['erce_trees_selected']='01 and 05; 684 and 870 triangles; linked instances'
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Replaced six block trees with first and last Erce models; fixed and packed texture references.')
