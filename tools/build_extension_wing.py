"""Measured original architecture/joinery; downloaded equipment remains separate."""
import bpy,math,pathlib,json
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1];out=root/'AssetSources/Realistic/ExtensionArchitecture';out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
palette={'Sage':(.25,.3,.22),'Sand':(.62,.59,.52),'Wood':(.34,.23,.13),'Black':(.025,.03,.032),'White':(.72,.74,.72),'Metal':(.3,.32,.33),'Glass':(.5,.65,.65),'Tile':(.38,.39,.36),'Rubber':(.035,.043,.039),'Floor':(.4,.3,.18),'Light':(1,.86,.6)}
mats={};groups={};group='Shell'
for n,c in palette.items():m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);mats[n]=m
def finish(o,name,mat,bevel=0):
 o.name=name;o.data.materials.append(mats[mat]);groups.setdefault(group,[]).append(o)
 if bevel:
  b=o.modifiers.new('Soft manufactured edges','BEVEL');b.width=bevel/100;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
 return o
def box(n,p,d,m,b=.3):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0]/100,-p[1]/100,p[2]/100));o=bpy.context.object;o.dimensions=Vector(d)/100;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,n,m,b)
def rod(n,a,b,r,m):
 av=Vector((a[0]/100,-a[1]/100,a[2]/100));bv=Vector((b[0]/100,-b[1]/100,b[2]/100));v=bv-av
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r/100,depth=v.length,location=(av+bv)/2);o=bpy.context.object;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();return finish(o,n,m,.15)
def sign(text,p):
 # Text faces west into the corridor.
 bpy.ops.object.text_add(location=(p[0]/100,-p[1]/100,p[2]/100),rotation=(math.pi/2,0,-math.pi/2));o=bpy.context.object;o.data.body=text;o.data.size=.13;o.data.extrude=.001;o.data.align_x='CENTER';bpy.ops.object.convert(target='MESH');finish(o,text,'White')
# Existing entrance stays at (400,455); no old architecture is replaced.
box('Connector floor',(450,550,-10),(300,200,20),'Floor')
box('Connector south wall west',(312,650,160),(24,12,320),'Sage')
box('Connector south wall east',(620,650,160),(360,12,320),'Sage')
box('Connector exterior entry lintel',(380,650,285),(112,12,70),'Sage')
box('Connector west return',(300,550,160),(12,200,320),'Sage')
box('Connector roof',(450,550,325),(300,200,10),'Sand')
box('Corridor floor',(700,-450,-10),(200,2000,20),'Floor')
box('Corridor return floor',(700,600,-10),(200,100,20),'Floor')
box('Corridor return roof',(700,600,325),(200,100,10),'Sand')
box('Corridor west wall',(600,-950,160),(12,1000,320),'Sage')
box('Corridor north wall',(700,-1450,160),(200,12,320),'Sage')
box('Corridor roof',(700,-450,325),(200,2000,10),'Sand')
rooms=[('01  BILLIARDS',-1200,'Floor'),('02  FITNESS',-700,'Rubber'),('03  MEETING',-200,'Floor'),('04  RESTROOM',300,'Tile')]
for label,cy,floor in rooms:
 box(label+' floor',(1100,cy,-10),(600,500,20),floor)
 box(label+' roof',(1100,cy,325),(600,500,10),'Sand')
 # Door is 120 cm clear, centered; threshold is flat.
 for y in [cy-155,cy+155]:box(label+' doorway wall',(800,y,160),(12,190,320),'Sage')
 box(label+' doorway header',(800,cy,285),(12,120,70),'Sage')
 for y in [cy-62,cy+62]:box('Door black jamb',(793,y,124),(16,3,248),'Black')
 box('Door header trim',(793,cy,248),(16,127,3),'Black')
 sign(label,(792,cy,268))
 # Full external facade glazing, high-level only at restroom for privacy.
 sill=155 if 'RESTROOM' in label else 50
 box(label+' window sill',(1400,cy,sill/2),(14,500,sill),'Sage')
 box(label+' window header',(1400,cy,305),(14,500,30),'Sand')
 for y in [cy-250,cy-125,cy,cy+125,cy+250]:box('Slim window mullion',(1398,y,(sill+290)/2),(9,5,290-sill),'Black')
 for z in [sill,290]:box('Window horizontal frame',(1398,cy,z),(9,500,5),'Black')
 group='Glazing'
 for y in [cy-187.5,cy-62.5,cy+62.5,cy+187.5]:box(label+' glazing',(1399,y,(sill+290)/2),(1,120,290-sill),'Glass',0)
 group='Shell'
 for y in [cy-244,cy+244]:box('Room skirting',(1100,y,6),(586,2,12),'White')
 for y in [cy-220,cy-165,cy-110,cy-55,cy,cy+55,cy+110,cy+165,cy+220]:box('Timber ceiling baffle',(1100,y,309),(570,6,15),'Wood')
 box('Pendant housing',(1100,cy,278),(160,8,7),'Black')
 box('Pendant diffuser',(1100,cy,274),(154,6,1),'Light')
 for x in [1040,1160]:rod('Suspension wire',(x,cy,282),(x,cy,320),.2,'Black')
 for y in [cy-230,cy+230]:box('Window ledge',(1375,y,80),(35,32,4),'Wood',.5)
for y in [-1450,-950,-450,50,550]:box('Shared room partition',(1100,y,160),(600,12,320),'Sage')
# Corridor light bands and wall details.
for y in range(-1325,551,250):
 box('Corridor ceiling light',(700,y,313),(9,120,4),'Black');box('Corridor diffuser',(700,y,310),(6,114,1),'Light')
# Office-side connector enclosure between existing building and corridor.
box('Connector east wall',(800,602,160),(12,96,320),'Sage')
group='Joinery'
box('Fitness dumbbell rack upper',(1010,-510,33),(155,35,4),'Black',1)
for x in [950,1070]:box('Fitness rack support',(x,-510,16),(5,32,32),'Black',.5)
box('Stretch mat',(1120,-620,1),(65,175,2),'Rubber',1)
# Crafted six-seat conference table, cable hatch, wall presentation surface.
box('Meeting table',(1100,-200,74),(105,240,5),'Wood',3)
for y in [-285,-115]:
 box('Meeting table base',(1100,y,3),(90,13,5),'Black',1)
 for x in [1070,1130]:rod('Table angled metal leg',(x,y,5),(x,y,71),2.5,'Black')
box('Cable management hatch',(1100,-200,76.8),(12,32,.4),'Black',.8)
box('Presentation display',(1100,-440,158),(160,5,92),'Black',1)
box('Display face',(1100,-436.9,158),(154,.5,86),'Glass',.3)
box('Meeting storage',(1210,20,45),(240,46,90),'White',1)
box('Meeting storage top',(1210,20,91),(244,48,3),'Wood',.7)
# WC vestibule blocks corridor view; two screened cubicles, open fixed doors.
box('Privacy screen',(945,315,125),(12,270,250),'Sand')
for y in [205,395]:box('Cubicle divider',(1220,y,120),(345,5,240),'Sand')
for lo,hi in [(205,395),(395,550)]:
 span=hi-lo-100
 box('Cubicle front wall',(1050,hi-span/2,120),(5,span,240),'Sand')
 # 95cm entrance gap near partition, leaf shown open parallel to approach.
 door=box('Open privacy door',(1098,lo+98,115),(96,4,230),'Wood',.5)
 rod('Door pull',(1100,lo+93,100),(1100,lo+93,122),.6,'Metal')
box('Vanity cabinet',(1140,88,43),(235,52,86),'White',1)
box('Vanity worktop',(1140,88,88),(239,56,4),'Tile',1)
for x in [1070,1200]:
 box('Vanity basin',(x,88,94),(50,37,11),'White',3)
 box('Basin inset',(x,88,99),(40,27,1),'Tile',3)
 rod('Tap',(x,68,90),(x,68,116),1.2,'Metal');rod('Spout',(x,68,116),(x,79,116),1.2,'Metal')
 box('Mirror',(x,57,160),(65,2,80),'Metal',.5)
box('Billiards side bench',(920,-1420,44),(150,45,8),'Wood',2)
for x in [865,975]:box('Bench foot',(x,-1420,22),(5,35,44),'Black',.5)
# Original project billiard ball dressing: standard diameter, no physics gameplay.
group='Balls'
ballcolors=[('BallYellow',(1,.65,.01)),('BallBlue',(.015,.08,.6)),('BallRed',(.65,.015,.02)),('BallPurple',(.24,.03,.45)),('BallOrange',(.95,.2,.01)),('BallGreen',(.02,.25,.08)),('BallMaroon',(.27,.01,.04)),('Black',(.025,.03,.032))]
for n,c in ballcolors:
 if n not in mats:
  m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);mats[n]=m
num=0
for row in range(5):
 for col in range(row+1):
  color=ballcolors[num%8][0];x=1135+row*4.98;y=-1200+(col-row/2)*5.75
  bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=.028575,location=(x/100,-y/100,.797));o=finish(bpy.context.object,'Billiard ball '+str(num+1),color)
  if num>=8:
   o.data.materials.append(mats['White'])
   for poly in o.data.polygons:
    if abs(poly.center.z)>.014:poly.material_index=1
  for poly in o.data.polygons:poly.use_smooth=True
  num+=1
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=.028575,location=(10.25,12,.797));finish(bpy.context.object,'Cue ball','White')
# Small coordinated terracotta planter for approved bare Calathea asset.
group='Planter'
bpy.ops.mesh.primitive_cone_add(vertices=64,radius1=.15,radius2=.20,depth=.34,location=(0,0,.17));finish(bpy.context.object,'Calathea ceramic planter','Sand',.8)
bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=.18,depth=.02,location=(0,0,.335));finish(bpy.context.object,'Soil surface','Rubber')
# UVs of authored wood retain a consistent measured scale; floors use world UV in UE.
for name,objects in groups.items():
 for o in objects:
  if o.type!='MESH':continue
  uv=o.data.uv_layers.active or o.data.uv_layers.new(name='UVMap')
  for poly in o.data.polygons:
   axes=sorted(range(3),key=lambda i:abs(poly.normal[i]))[:2]
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(v[axes[0]]/1.7,v[axes[1]]/1.7)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.export_scene.fbx(filepath=str(out/(name+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'ExtensionWing.blend'))
(out/'layout.json').write_text(json.dumps({'units':'cm','rooms':[{'name':n,'bounds':[800,y-250,1400,y+250],'door':[800,y],'window_x':1400} for n,y,f in rooms],'corridor_width':200,'room_door_width':120,'connection_to_existing':[400,455],'scope':'Original measured architecture and joinery; licensed equipment imported separately'},indent=2))
print('EXTENSION_READY',flush=True)
