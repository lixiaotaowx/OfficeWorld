"""Original measured joinery/fixtures and connected shell; preserves original .blend."""
import bpy,math,pathlib,json
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1];source=root/'AssetSources/Realistic/NaturalArchitecture/NaturalArchitecture.blend';out=root/'AssetSources/Realistic/DeliveryArchitecture';out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source))
groups={'Architecture':[],'Glazing':[],'MeetingJoinery':[],'OfficeFacilities':[],'OfficeExterior':[]};group='Architecture'
for ob in list(bpy.context.scene.objects):
 if ob.name.startswith('Front plaster wall') or (ob.name.startswith('Skirting') and ob.location.y<-4):bpy.data.objects.remove(ob,do_unlink=True);continue
 if ob.type=='MESH':groups['Glazing' if any(m and m.name.startswith('Glass') for m in ob.data.materials) else 'Architecture'].append(ob)
def mat(n,c):
 m=bpy.data.materials.get(n) or bpy.data.materials.new(n);m.diffuse_color=(*c,1);return m
mats={n:mat(n,c) for n,c in {'SagePlaster':(.25,.30,.22),'SandPlaster':(.62,.59,.52),'NaturalWood':(.34,.23,.13),'Charcoal':(.025,.03,.032),'White':(.72,.74,.72),'Metal':(.22,.25,.25),'Glass':(.5,.65,.65),'Porcelain':(.80,.82,.80),'Stone':(.46,.46,.42),'Asphalt':(.09,.1,.105),'Grass':(.09,.16,.055),'RoadMarking':(.7,.7,.63),'Light':(1,.86,.6)}.items()}
def finish(o,name,material,bevel=0):
 o.name=name;o.data.materials.clear();o.data.materials.append(mats[material]);groups[group].append(o)
 if bevel:
  mod=o.modifiers.new('Edge radius','BEVEL');mod.width=bevel/100;mod.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o
def point(p):return (p[0]/100,-p[1]/100,p[2]/100)
def box(name,loc,dims,material,bevel=.3):
 bpy.ops.mesh.primitive_cube_add(size=1,location=point(loc));o=bpy.context.object;o.dimensions=Vector(dims)/100;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material,bevel)
def cylinder(name,loc,r,depth,material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r/100,depth=depth/100,location=point(loc));return finish(bpy.context.object,name,material,.15)
def rod(name,a,b,r,material):
 av,bv=Vector(point(a)),Vector(point(b));delta=bv-av;bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=r/100,depth=delta.length,location=(av+bv)/2);o=bpy.context.object;o.rotation_euler=delta.to_track_quat('Z','Y').to_euler();return finish(o,name,material,.1)
def oval_ring(name,loc,rx,ry,tube,material):
 bpy.ops.mesh.primitive_torus_add(major_radius=1,minor_radius=tube/rx,major_segments=64,minor_segments=16,location=point(loc));o=bpy.context.object;o.scale=(rx/100,ry/100,rx/100);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material)
def bowl(name,loc,rx,ry,profile,material):
 verts=[];faces=[];n=64
 for z,rad in profile:
  for j in range(n):
   a=2*math.pi*j/n;verts.append((loc[0]/100+rx/100*rad*math.cos(a),-loc[1]/100+ry/100*rad*math.sin(a),(loc[2]+z)/100))
 for i in range(len(profile)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
 for p in mesh.polygons:p.use_smooth=True
 return finish(o,name,material)
# 140 cm clear entrance, continuous floor and no invisible blocking wall.
box('Entry wall west',(-137.5,455,152.5),(935,16,305),'SagePlaster')
box('Entry wall east',(537.5,455,152.5),(135,16,305),'SagePlaster')
box('Entry lintel',(400,455,275),(140,16,60),'SagePlaster')
for x in [329,471]:box('Entry black jamb',(x,455,123),(4,20,246),'Charcoal')
box('Entry frame header',(400,455,246),(144,20,4),'Charcoal')
for x,width in [(-137.5,935),(537.5,135)]:box('Entry wall skirting',(x,446,6.5),(width,2,13),'White')
# Compact enclosed WC with 90 cm doorway and separate pantry.
box('WC divider',(520,278,137.5),(166,9,275),'SandPlaster')
box('WC side wall upper',(437,416,137.5),(9,62,275),'SandPlaster')
box('WC side wall lower',(437,288,137.5),(9,20,275),'SandPlaster')
box('WC doorway lintel',(437,341.5,247.5),(9,87,55),'SandPlaster')
group='MeetingJoinery'
box('Conference top',(390,-260,74.5),(110,200,4.5),'NaturalWood',3)
box('Conference shadow reveal',(390,-260,71.5),(98,185,1.5),'Charcoal',.6)
for y in [-327,-193]:
 box('Conference steel foot',(390,y,3),(87,12,4),'Charcoal',1)
 for x in [360,420]:rod('Conference tapered support',(x,y,5),(x,y,70),2.4,'Charcoal')
box('Table cable hatch',(390,-260,76.85),(13,29,.45),'Charcoal',1)
box('Presentation display',(583,-265,155),(5,155,88),'Charcoal',1)
box('Presentation glass',(579.9,-265,155),(.3,149,82),'Glass',.3)
box('Video conference bar',(578,-265,107),(5,45,5),'Charcoal',1)
group='OfficeFacilities'
box('WC floor tile',(520,362,.6),(154,160,1.2),'Stone',.05)
# Closed porcelain bowl surfaces with seat/lid hinges and tank.
bowl('Toilet porcelain body',(520,380,0),18,25,[(0,.62),(4,.7),(21,.65),(33,.98),(39,1),(40,.90),(36,.76),(27,.46),(22,.25)],'Porcelain')
oval_ring('Toilet seat',(520,380,42),18,25,2.1,'White')
box('Toilet tank',(520,411,61),(37,17,43),'Porcelain',3)
box('Toilet cistern lid',(520,411,83),(39,19,3),'Porcelain',1)
cylinder('Flush button',(520,411,84.8),2,1,'Metal')
for x in [511,529]:rod('Seat hinge',(x,400,42),(x,408,43),1.4,'Metal')
box('Vanity cabinet',(565,311,43),(50,50,84),'White',1)
box('Vanity toe kick',(565,311,5),(42,43,10),'Charcoal',.4)
box('Vanity upper surface',(565,311,86),(54,54,3),'Stone',1)
bowl('Wash basin',(565,311,87),20,17,[(0,.48),(2,.75),(9,1),(10,.96),(8,.85),(2,.35),(1,.1)],'Porcelain')
rod('Tap stem',(565,291,88),(565,291,108),1.3,'Metal');rod('Tap spout',(565,291,108),(565,301,108),1.3,'Metal')
box('Mirror backing',(565,283,150),(52,2,70),'Charcoal',1);box('Mirror glass',(565,281.8,150),(49,.3,67),'Glass')
rod('Towel bar',(592,341,101),(592,368,101),.8,'Metal')
# Three door pantry joinery, worktop, handles and compact coffee machine.
box('Pantry toe kick',(565,130,5),(48,196,10),'Charcoal')
for y in [65,130,195]:
 box('Pantry cabinet',(568,y,47),(57,63,84),'White',.7);box('Pantry door shadow',(538.8,y,47),(1,62,79),'Charcoal',.2);box('Pantry door',(538,y,47),(1.5,60.5,77.5),'White',.5);rod('Cabinet pull',(536,y-15,71),(536,y+15,71),.5,'Metal')
box('Pantry worktop',(565,130,91),(64,201,4),'Stone',1)
box('Pantry splashback',(594,130,112),(2,204,39),'SandPlaster',.1)
box('Coffee machine body',(566,70,114),(32,35,41),'Charcoal',2)
box('Coffee drip tray',(546,70,96),(10,31,3),'Metal',.5)
box('Coffee controls',(548.8,70,124),(.5,25,12),'Glass',.5)
for y in [61,79]:rod('Coffee spout',(546, y,111),(544,y,107),.7,'Metal');cylinder('Coffee cup',(544,y,100),3.8,7,'Porcelain')
box('Floating pantry shelf',(579,152,166),(32,133,3),'NaturalWood',.5)
for y in [107,126,145]:cylinder('Shelf cup',(575,y,171),3.8,7,'Porcelain')
group='OfficeExterior'
box('Front paved terrace',(0,660,-9),(1600,400,18),'Stone',1)
box('Road surface',(0,1140,-11),(3200,600,20),'Asphalt',.3)
box('Park sidewalk',(0,1560,-9),(3200,240,18),'Stone',1)
box('Park lawn',(-50,2190,-12),(1800,1020,20),'Grass',1)
box('Park longitudinal path',(400,2180,-8),(160,1000,14),'Stone',1)
box('Park cross path',(-50,2190,-8),(1800,150,14),'Stone',1)
for y in range(900,1400,75):box('Pedestrian crossing',(400,y,.15),(300,38,.3),'RoadMarking',.02)
for x in range(-1450,1550,180):
 if 210<x<590:continue
 box('Road center marking',(x,1140,.15),(95,8,.3),'RoadMarking',.02)
for y in [835,1445]:box('Road edge line',(0,y,.15),(3200,8,.3),'RoadMarking',.02)
# Consistent wood grain UV dimensions, aligned with each joinery part's long axis.
for group_name,objects in groups.items():
 for o in objects:
  if o.type!='MESH':continue
  if any(m and m.name=='NaturalWood' for m in o.data.materials):
   uv=o.data.uv_layers.active or o.data.uv_layers.new(name='UVMap');size=o.dimensions;axes=sorted(range(3),key=lambda i:size[i],reverse=True)
   for poly in o.data.polygons:
    normal=poly.normal;ax=sorted(range(3),key=lambda i:abs(normal[i]));a,b=ax[:2]
    if size[b]>size[a]:a,b=b,a
    for li in poly.loop_indices:
     v=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(v[a]/2,v[b]/.3)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 if not objects:continue
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.export_scene.fbx(filepath=str(out/(group_name+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,bake_anim=False,add_leaf_bones=False)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'OfficeDelivery.blend'))
(out/'SOURCE.json').write_text(json.dumps({'author':'Original OfficeWorld project geometry','license':'Original project work; no third-party asset license imposed','units':'metres','scope':'Accessible shell, measured conference joinery, pantry and sanitary fixtures, exterior hardscape; not claimed as downloaded third-party furniture'},indent=2))
print('DELIVERY_SHELL_READY', {k:len(v) for k,v in groups.items()})
