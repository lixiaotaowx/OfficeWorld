import bpy,math,json
from mathutils import Vector
s=bpy.context.scene
assert not s.get('approved_assets_placed')
col=bpy.data.collections.new('12 Approved free props');s.collection.children.link(col)
def put(key,name,pos,scale=1,angle=0):
 src=bpy.data.objects['LIB '+key]
 obj=src.copy();obj.data=src.data;obj.name=name;col.objects.link(obj)
 obj.location=pos;obj.scale=(scale,scale,scale);obj.rotation_euler.z=angle
 obj.hide_render=False;obj.hide_set(False)
 return obj
def hide(obj):
 obj.hide_render=True;obj.hide_set(True)
def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.75
 return m
pot=material('Approved pots - warm stone',(.58,.60,.55))
leaf=material('Approved foliage - muted green',(.105,.235,.12))
for key in ['sansevieria_plant_small_potted','sansevieria_plant_large_potted','monstera_plant_medium_potted']:
 obj=bpy.data.objects['LIB '+key];obj.data=obj.data.copy()
 tex=next(n.image for n in obj.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE')
 pixels=list(tex.pixels);w,h=tex.size;uv=obj.data.uv_layers.active.data
 obj.data.materials.append(pot)
 for p in obj.data.polygons:
  u=sum(uv[i].uv.x for i in p.loop_indices)/len(p.loop_indices)
  v=sum(uv[i].uv.y for i in p.loop_indices)/len(p.loop_indices)
  idx=4*(min(h-1,int(v*h))*w+min(w-1,int(u*w)))
  r,g,b=pixels[idx:idx+3]
  if not (g>r*1.1 and g>b*1.05) and p.center.z < obj.dimensions.z*.32:
   p.material_index=1
 # Desaturate the original leaf atlas while keeping its gradients.
 m=obj.data.materials[0].copy();obj.data.materials[0]=m
 nodes=m.node_tree.nodes;links=m.node_tree.links
 shader=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
 socket=shader.inputs['Base Color']
 if socket.is_linked:
  source=socket.links[0].from_socket
  hue=nodes.new('ShaderNodeHueSaturation');hue.inputs['Saturation'].default_value=.65
  links.new(source,hue.inputs['Color']);links.new(hue.outputs['Color'],socket)
chair=bpy.data.objects['LIB office_chair'];chair.data=chair.data.copy()
for v in chair.data.vertices:
 v.co.x*=.68;v.co.y*=.68
 v.co.z=v.co.z*.96 if v.co.z<=.5 else .48+(v.co.z-.5)*.65
keyboard=bpy.data.objects['LIB keyboard_slim'];keyboard.data=keyboard.data.copy()
keyboard.hide_set(False);bpy.context.view_layer.objects.active=keyboard
mod=keyboard.modifiers.new('Simplify planar keyboard faces','DECIMATE')
mod.decimate_type='DISSOLVE';mod.angle_limit=math.radians(4)
bpy.ops.object.modifier_apply(modifier=mod.name)
keyboard.hide_set(True)
screens=[o for o in list(s.objects) if o.name.endswith(' DISPLAY') and o.get('role')=='shared_screen']
for face in screens:
 prefix=face.name[:-8]
 oldkey=bpy.data.objects[prefix+' keyboard']
 sign=1 if oldkey.location.y>face.location.y else -1
 angle=sign*math.pi/2
 loc=face.matrix_world.translation.copy()
 y=loc.y-sign*.031
 put('monitor',prefix+' approved monitor',(loc.x,y,.798),.66,angle)
 face.location=(loc.x,y+sign*.010,1.093)
 face.dimensions=(.60,.006,.355)
 for suffix in [' housing',' stand',' base',' mouse',' mug',' keyboard',' keyboard keycaps']:
  old=bpy.data.objects.get(prefix+suffix)
  if old:hide(old)
 for old in list(s.objects):
  if old.name.startswith(prefix+' placeholder card'):hide(old)
 put('keyboard_slim',prefix+' approved keyboard',(oldkey.location.x,oldkey.location.y,.8),.76,angle)
 oldmouse=bpy.data.objects.get(prefix+' mouse')
 if oldmouse:put('wireless_mouse',prefix+' approved mouse',(oldmouse.location.x,oldmouse.location.y,.8),.7,angle)
 put('mug',prefix+' approved mug',(loc.x-.42,oldkey.location.y,.80),1,angle)
 oldchair=bpy.data.objects.get(prefix+' chair')
 if oldchair:
  put('office_chair',prefix+' approved chair',oldchair.matrix_world.translation,1,angle)
  for child in oldchair.children_recursive:hide(child)
  hide(oldchair)
for group in ['Island_A','Island_B']:
 desk=bpy.data.objects[group+' top'];x,y,z=desk.location
 put('sansevieria_plant_small_potted',group+' approved desk plant',(x,y,.799),.29)
 put('lamp_architect',group+' approved task lamp',(x-1.4,y+.48,.799),.58,-math.pi/2)
 put('books',group+' approved books',(x+1.4,y+.52,.799),1.7)
 put('pencil_holder',group+' approved pen cup',(x+1.4,y-.52,.799),1.1)
put('monstera_plant_medium_potted','Approved floor plant - lounge',(-8.8,-2.5,.02),.57)
put('sansevieria_plant_large_potted','Approved floor plant - meeting',(5.8,4.45,.02),.40)
put('monstera_plant_medium_potted','Approved floor plant - manager',(10.1,7.25,.02),.55)
put('books','Manager approved books',(9.55,5.8,.80),1.8)
put('lamp_architect','Manager approved lamp',(7.85,5.75,.80),.65,-math.pi/2)
s['approved_assets_placed']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
keyboard.data.calc_loop_triangles()
print(json.dumps({'placed':len(col.objects),'keyboard_triangles':len(keyboard.data.loop_triangles),'file':bpy.data.filepath}))
