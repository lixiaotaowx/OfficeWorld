"""Original detailed office meshes, generated in Blender; metres, no external code."""
import bpy, math, os, random
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'AssetSources','Realistic','Generated');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
random.seed(16)
M={}
for name,color in {'Paint':(.72,.71,.66),'Oak':(.44,.29,.14),'Charcoal':(.028,.033,.035),'Metal':(.14,.16,.17),'Fabric':(.14,.19,.18),'White':(.8,.81,.8),'Screen':(.045,.10,.14),'Glass':(.66,.78,.78),'Light':(1,.92,.8),'Leaf':(.055,.16,.07),'Soil':(.055,.028,.014),'Carpet':(.16,.19,.18),'Paper':(.78,.77,.7)}.items():
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);M[name]=m
groups={};group='Architecture'
def finish(o,name,mat,bevel=0):
 o.name=name;o.data.materials.append(M[mat]);groups.setdefault(group,[]).append(o)
 if bevel:
  mod=o.modifiers.new('Manufactured edge radii','BEVEL');mod.width=bevel;mod.segments=3
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
  mod=o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
  try:bpy.ops.object.modifier_apply(modifier=mod.name)
  except:pass
 return o
def box(name,loc,dim,mat,bevel=.005):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=dim
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,mat,bevel)
def cyl(name,a,b,r,mat,r2=None):
 a,b=Vector(a),Vector(b);d=b-a
 bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=r,radius2=r if r2 is None else r2,depth=d.length,location=(a+b)/2)
 o=bpy.context.object;o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
 for f in o.data.polygons:f.use_smooth=True
 return finish(o,name,mat,.002)
def ball(name,loc,scale,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=loc);o=bpy.context.object;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for f in o.data.polygons:f.use_smooth=True
 return finish(o,name,mat)
def text(body,loc,size,mat,rot=(math.pi/2,0,0)):
 bpy.ops.object.text_add(location=loc,rotation=rot);o=bpy.context.object;o.data.body=body;o.data.size=size;o.data.extrude=.0005
 o.data.materials.append(M[mat]);bpy.ops.object.convert(target='MESH');groups.setdefault(group,[]).append(bpy.context.object)
# 12 x 9 m, real floor-ceiling height 3.05m. Separate glass and solid collision.
box('Structural floor',(0,0,-.10),(12,9,.20),'Oak',.005)
box('Rear plaster wall',(0,4.55,1.525),(12.2,.16,3.05),'Paint')
box('Right plaster wall',(6.04,0,1.525),(.16,9,3.05),'Paint')
box('Front plaster wall',(0,-4.55,1.525),(12.2,.16,3.05),'Paint')
box('Left sill',(-6,0,.24),(.16,9,.48),'Paint')
box('Left window header',(-6,0,2.94),(.18,9,.22),'Paint')
for y in [-4.5,-3,-1.5,0,1.5,3,4.5]:box('Window powdercoat mullion',(-5.98,y,1.7),(.08,.055,2.48),'Charcoal',.003)
for z in [.5,2.9]:box('Window rail',(-5.98,0,z),(.1,9,.055),'Charcoal')
for y in [-4.5,4.45]:box('Skirting',(0,y,.065),(12,.018,.13),'White',.003)
box('Skirting',(5.94,0,.065),(.018,9,.13),'White',.003)
box('Ceiling slab',(0,0,3.10),(12,9,.1),'Paint')
# Acoustic ceiling tiles / slim exposed T rails.
for x in range(-6,7):box('Ceiling T rail',(x,0,3.038),(.018,9,.018),'White',.001)
for i in range(16):box('Ceiling cross rail',(0,-4.5+i*.6,3.038),(12,.015,.018),'White',.001)
for x in [-3,0,3]:
 for y in [-2.4,1.8]:
  box('Recessed light trim',(x,y,3.018),(1.24,.34,.035),'Metal')
  box('Recessed diffuser',(x,y,2.996),(1.18,.28,.012),'Light')
for y in [-3.4,3.6]:
 box('Air return surround',(3.6,y,3.005),(1.2,.35,.035),'White')
 for i in range(12):box('Air return vane',(3.1+i*.09,y,2.98),(.024,.29,.02),'Charcoal',.001)
# Glass meeting room right side, 1.1m open entrance at front.
for y in [.45,1.75,3.1,4.45]:box('Partition upright',(1.85,y,1.48),(.045,.045,2.96),'Charcoal',.002)
for z in [.025,2.96]:box('Partition head base',(1.85,2.45,z),(.06,4.05,.05),'Charcoal')
for x in [3,4.45,5.94]:box('Partition upright',(x,.45,1.48),(.045,.045,2.96),'Charcoal',.002)
box('Door head',(2.42,.45,2.94),(1.15,.06,.06),'Charcoal')
for z in [.025,2.96]:box('Cross partition rail',(4.48,.45,z),(2.95,.055,.05),'Charcoal')
group='Glazing'
for y in [1.1,2.425,3.775]:box('Clear meeting glass',(1.85,y,1.49),(.01,1.25,2.88),'Glass',0)
for x in [3.72,5.20]:box('Clear meeting glass',(x,.45,1.49),(1.40,.01,2.88),'Glass',0)
for y in [-3.75,-2.25,-.75,.75,2.25,3.75]:box('Exterior glazing',(-5.97,y,1.7),(.01,1.43,2.34),'Glass',0)
group='Furniture'
def desk(cx,cy,flip):
 def p(x,y,z):return (cx+flip*x,cy+flip*y,z)
 top=box('Oak edge desk',p(0,0,.735),(1.6,.75,.03),'Oak',.009)
 for x in [-.70,.70]:
  for y in [-.275,.275]:box('Steel leg',p(x,y,.365),(.035,.035,.70),'White',.003)
  box('Underdesk beam',p(x,0,.68),(.04,.58,.055),'White')
 box('Underdesk longitudinal',p(0,.25,.66),(1.42,.035,.065),'White')
 box('Cable tray',p(0,.20,.59),(.8,.12,.045),'Charcoal')
 box('Cable grommet',p(.58,.25,.755),(.16,.065,.007),'Charcoal')
 # 27 inch monitor body / glass / adjustable stand
 box('Monitor plinth',p(0,.15,.765),(.25,.20,.018),'Charcoal',.014)
 cyl('Monitor riser',p(0,.20,.77),p(0,.20,.98),.021,'Metal')
 box('Monitor casing',p(0,.19,1.10),(.61,.036,.355),'Charcoal',.010)
 box('LCD panel',p(0,.169,1.10),(.584,.003,.324),'Screen',.002)
 # Screen UI made as geometry; no screenshots of third party products.
 for j in range(5):box('Screen rows',p(-.11,.166,1.18-j*.035),(.25,.001,.006),'White',0)
 box('Screen sidebar',p(-.24,.166,1.10),(.06,.001,.30),'Fabric',0)
 box('Screen chart',p(.17,.166,1.06),(.12,.001,.09),'Fabric',0)
 box('Keyboard base',p(-.06,-.19,.765),(.44,.15,.019),'Charcoal',.006)
 for r in range(5):
  for c in range(15):box('Keycap',p(-.257+c*.028,-.245+r*.027,.779),(.023,.021,.009),'Metal',.002)
 box('Spacebar',p(-.05,-.251,.784),(.16,.02,.006),'Metal',.002)
 box('Mouse mat',p(.38,-.19,.753),(.22,.22,.004),'Fabric')
 ball('Mouse',p(.38,-.18,.77),(.03,.052,.019),'Charcoal')
 cyl('Coffee mug',p(-.57,-.15,.75),p(-.57,-.15,.85),.039,'White')
 cyl('Coffee surface',p(-.57,-.15,.851),p(-.57,-.15,.852),.033,'Soil')
 box('Notebook',p(.59,-.1,.76),(.16,.23,.016),'Paper')
 cyl('Pen',p(.64,-.20,.776),p(.64,-.02,.776),.003,'Metal')
 # Underdesk pedestal with seams and handles.
 box('Pedestal',p(-.54,.035,.295),(.34,.46,.57),'White',.012)
 for z in [.19,.40,.53]:
  box('Drawer seam',p(-.54,-.198,z),(.31,.003,.004),'Metal',0)
  box('Drawer pull',p(-.54,-.21,z+.065),(.14,.014,.012),'Metal')
def chair(cx,cy,angle=0):
 before=len(groups[group])
 cyl('Gas lift',(cx,cy,.12),(cx,cy,.43),.025,'Metal')
 cyl('Lift sleeve',(cx,cy,.15),(cx,cy,.29),.042,'Charcoal')
 for i in range(5):
  a=i*math.tau/5;xx=cx+math.cos(a)*.30;yy=cy+math.sin(a)*.30
  cyl('Five star base',(cx,cy,.17),(xx,yy,.075),.023,'Metal')
  for dx in [-.016,.016]:cyl('Caster',(xx+dx,yy-.016,.04),(xx+dx,yy+.016,.04),.039,'Charcoal')
 box('Padded seat',(cx,cy,.47),(.49,.48,.10),'Fabric',.045)
 box('Seat pan',(cx,cy,.414),(.44,.42,.024),'Charcoal',.03)
 # Curved ergonomic upholstered back, sculpted grid with eased shoulder corners.
 verts=[];faces=[];nx=14;nz=18
 for j in range(nz+1):
  t=j/nz;z=.53+t*.56
  for i in range(nx+1):
   s=(i/nx-.5)*2;w=.24*(.90+.10*math.sin(t*math.pi));xx=s*w
   yy=.24+.055*math.sin(t*math.pi)+.06*s*s
   verts.append((cx+xx,cy+yy,z))
 for j in range(nz):
  for i in range(nx):
   k=j*(nx+1)+i;faces.append((k,k+1,k+nx+2,k+nx+1))
 mesh=bpy.data.meshes.new('Contoured chair back');mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new('Ergonomic back',mesh);bpy.context.collection.objects.link(o);finish(o,'Ergonomic back','Fabric')
 for f in mesh.polygons:f.use_smooth=True
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Upholstery thickness','SOLIDIFY');mod.thickness=.036;bpy.ops.object.modifier_apply(modifier=mod.name)
 for x in [-.285,.285]:
  cyl('Arm support',(cx+x,cy+.08,.43),(cx+x,cy+.08,.70),.014,'Charcoal')
  box('Arm rest',(cx+x,cy,.715),(.066,.28,.038),'Charcoal',.016)
 cyl('Back support',(cx,cy+.12,.40),(cx,cy+.30,.72),.024,'Charcoal')
 for ob in groups[group][before:]:
  # Rotate all geometry about the chair centre.
  from mathutils import Matrix
  transform=Matrix.Translation((cx,cy,0)) @ Matrix.Rotation(angle,4,'Z') @ Matrix.Translation((-cx,-cy,0))
  ob.matrix_world=transform@ob.matrix_world
for x in [-2.9,-1.25]:
 desk(x,-.38,1);desk(x,.38,-1)
 chair(x,-1.12,math.pi);chair(x,1.15,0)
 box('Fabric privacy screen',(x,0,.955),(1.54,.034,.39),'Fabric',.014)
 for xx in [-.6,.6]:box('Divider bracket',(x+xx,0,.80),(.035,.07,.16),'Metal')
# Meeting furnishings and acoustic feature wall.
box('Meeting rug',(3.94,2.7,.01),(3.7,3.15,.02),'Carpet',.012)
box('Meeting oak top',(3.98,2.7,.74),(1.12,2.15,.045),'Oak',.05)
for y in [2.0,3.4]:box('Meeting trestle',(3.98,y,.35),(.60,.065,.7),'Charcoal',.014)
for y in [2.15,3.20]:
 chair(3.0,y,-math.pi/2);chair(4.97,y,math.pi/2)
box('Display casing',(4.0,4.44,1.82),(1.42,.04,.82),'Charcoal',.012)
box('Display glass',(4.0,4.414,1.82),(1.37,.008,.77),'Screen')
text('COMMON GROUND',(3.49,4.403,1.92),.105,'White')
text('MEETING 01',(3.51,4.403,1.66),.078,'White')
for i in range(30):box('Oak acoustic slat',(-4.7+i*.075,4.435,1.56),(.035,.035,2.78),'Oak',.003)
text('COMMON',( -1.75,4.44,2.13),.28,'Charcoal')
text('GROUND',( -1.75,4.44,1.78),.28,'Charcoal')
text('WORKPLACE / 01',(-1.73,4.44,1.49),.09,'Metal')
box('Storage cabinet',(-.3,3.95,.41),(2.5,.6,.82),'White',.016)
box('Cabinet cap',(-.3,3.95,.84),(2.53,.62,.035),'Oak')
for x in [-1.4,-.85,-.30,.25,.8]:
 box('Cabinet panel joint',(x,3.644,.40),(.004,.002,.75),'Metal',0)
 box('Cabinet pull',(x+.08,3.63,.70),(.12,.025,.015),'Charcoal')
# Plants: slender stems + curved, non-spherical leaves.
group='Plants'
for px,py in [(-5.25,3.55),(5.32,-3.7)]:
 cyl('Ceramic pot',(px,py,.025),(px,py,.47),.20,'White',.25)
 cyl('Soil',(px,py,.47),(px,py,.475),.23,'Soil')
 for k in range(7):
  ang=k*2.4;height=1.15+random.random()*.70
  ex=px+math.cos(ang)*.22;ey=py+math.sin(ang)*.22
  cyl('Stem',(px,py,.45),(ex,ey,height),.008,'Leaf')
  for t in [.6,.8,1.0]:
   a=ang+t*3;z=.45+(height-.45)*t;lx=px+(ex-px)*t;ly=py+(ey-py)*t
   leaf=ball('Leaf',(lx+math.cos(a)*.15,ly+math.sin(a)*.15,z),(.22,.072,.012),'Leaf');leaf.rotation_euler=(.3,-.4,a)
# Export one mesh per coherent category and retain editable .blend source.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'OfficeSample.blend'))
for key,objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for ob in objects:ob.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.export_scene.fbx(filepath=os.path.join(OUT,key+'.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,bake_anim=False,add_leaf_bones=False)
print('OFFICE_MESHES_COMPLETE', {k:len(v) for k,v in groups.items()})
