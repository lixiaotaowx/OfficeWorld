import bpy, math, sys, json
from pathlib import Path
from mathutils import Vector
ROOT = Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0, str(ROOT / 'tools/office-concept'))
from primitives import box, material
s = bpy.context.scene
assert not s.get('reference_details_v1')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'AssetSources/OfficeConcept/Before_Reference_Details.blend'), copy=True)
ivory = material('Detail trim - linen ivory', (.72,.70,.61))
oak = material('Detail frames - honey oak', (.48,.31,.15))
sage = material('Detail felt - soft sage', (.35,.42,.29), .91)
def uv_metric(o):
    uv = o.data.uv_layers.get('Office_Metric_UV') or o.data.uv_layers.new(name='Office_Metric_UV')
    for p in o.data.polygons:
        axis = max(range(3), key=lambda i:abs(p.normal[i]))
        axes = [(1,2),(0,2),(0,1)][axis]
        for li in p.loop_indices:
            co = o.data.vertices[o.data.loops[li].vertex_index].co
            uv.data[li].uv = (co[axes[0]], co[axes[1]])
for group in ['Island_A','Island_B']:
    x,y,_ = bpy.data.objects[group+' top'].location
    old = bpy.data.objects.get(group+' privacy divider')
    felt = old.material_slots[0].material if old else sage
    if old: bpy.data.objects.remove(old, do_unlink=True)
    for i,dx in enumerate([-.85,.85]):
        panel=box(group+' felt panel '+str(i), (x+dx,y,.986), (1.64,.026,.32),felt,.012)
        uv_metric(panel)
        for z in [.828,1.144]:
            box(group+' panel horizontal trim',(x+dx,y,z),(1.64,.031,.012),ivory,.004)
        for edge in [-.814,.814]:
            box(group+' panel vertical trim',(x+dx+edge,y,.986),(.012,.031,.32),ivory,.004)
        for clip in [-.53,.53]:
            box(group+' divider clip',(x+dx+clip,y,.825),(.055,.085,.055),ivory,.008)
    oldplant=bpy.data.objects.get(group+' approved desk plant')
    if oldplant: bpy.data.objects.remove(oldplant,do_unlink=True)
    pen=bpy.data.objects.get(group+' approved pen cup')
    if pen: pen.location.x=x+.2
    books=bpy.data.objects.get(group+' approved books')
    if books: books.location.y=y+.65

# Two semicircular ends joined by straight sides: actual capsule outline.
old=bpy.data.objects['Meeting / oval table']
loc=old.location.copy(); mats=[slot.material for slot in old.material_slots]
outline=[]
for cx,start in [(.925,-math.pi/2),(-.925,math.pi/2)]:
    for i in range(25):
        a=start+math.pi*i/24
        outline.append((cx+.625*math.cos(a),.625*math.sin(a)))
n=len(outline)
verts=[(x,y,z) for z in [-.045,.045] for x,y in outline]
faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh=bpy.data.meshes.new('Meeting capsule tabletop mesh');mesh.from_pydata(verts,[],faces);mesh.update()
bpy.data.objects.remove(old,do_unlink=True)
table=bpy.data.objects.new('Meeting / oval table',mesh);s.collection.objects.link(table);table.location=loc
for m in mats:
    if m: mesh.materials.append(m)
bev=table.modifiers.new('Soft tabletop rim','BEVEL');bev.width=.014;bev.segments=3
table.modifiers.new('Weighted normals','WEIGHTED_NORMAL');uv_metric(table)

# Finished CC0 plant meshes; preserve source UVs and texture materials.
base=ROOT/'AssetSources/Decor/TinyTreats_HousePlants/Models/Tiny_Treats_House_Plants_1.0_FREE/Assets/gltf'
templates=[]
for species in ['monstera','zzplant']:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(base/(species+'_plant_small_potted.gltf')))
    imported=set(bpy.data.objects)-before
    meshes=[o for o in imported if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
        world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
    bpy.context.view_layer.objects.active=meshes[0]
    if len(meshes)>1: bpy.ops.object.join()
    obj=bpy.context.object
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    lo=Vector([min(v.co[i] for v in obj.data.vertices) for i in range(3)])
    hi=Vector([max(v.co[i] for v in obj.data.vertices) for i in range(3)])
    center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    scale=.23/(hi.z-lo.z)
    for v in obj.data.vertices: v.co=(v.co-center)*scale
    obj.name='Desktop plant '+species
    obj.rotation_mode='XYZ'
    templates.append(obj)
    for o in imported:
        if o.name in bpy.data.objects and o.type!='MESH': bpy.data.objects.remove(o,do_unlink=True)
for gi,group in enumerate(['Island_A','Island_B']):
    x,y,_=bpy.data.objects[group+' top'].location
    for i,(dx,sign) in enumerate([(-.86,-1),(.86,-1),(-.86,1),(.86,1)]):
        src=templates[(i+gi)%2]
        obj=src.copy();obj.data=src.data;s.collection.objects.link(obj)
        obj.name=group+' desktop plant '+str(i+1)
        obj.location=(x+dx+.48,y+sign*.35,.802)
        obj.rotation_euler=(0,0,i*1.3)
for obj in templates: bpy.data.objects.remove(obj,do_unlink=True)

art=bpy.data.images.load(str(ROOT/'AssetSources/OfficeConcept/Textures/Office_Abstract_Prints.png'),check_existing=True);art.pack()
artmat=material('Original generated abstract art',(.7,.7,.6),.85)
nodes=artmat.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=art
bsdf=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
artmat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
def framed_print(name,center,w,h,half,angle=0):
    # Local XZ plane facing -Y, rotate as a complete frame assembly.
    parent=bpy.data.objects.new(name,None);s.collection.objects.link(parent)
    for dx,dz,dims in [(0,-h/2,(w+.06,.045,.03)),(0,h/2,(w+.06,.045,.03)),(-w/2,0,(.03,.045,h)),(w/2,0,(.03,.045,h))]:
        o=box(name+' frame',(dx,0,dz),dims,oak,.006);o.parent=parent
    mesh=bpy.data.meshes.new(name+' print mesh')
    mesh.from_pydata([(-w/2,-.009,-h/2),(w/2,-.009,-h/2),(w/2,-.009,h/2),(-w/2,-.009,h/2)],[],[(0,1,2,3)])
    mesh.materials.append(artmat);uv=mesh.uv_layers.new()
    for i,p in enumerate([(half*.5,0),(half*.5+.5,0),(half*.5+.5,1),(half*.5,1)]):uv.data[i].uv=p
    obj=bpy.data.objects.new(name+' print',mesh);s.collection.objects.link(obj);obj.parent=parent
    parent.location=center;parent.rotation_euler.z=angle
framed_print('Coffee abstract print',(-9.865,4.27,2.53),.64,.86,0,math.pi/2)
framed_print('Manager abstract print',(8.8,7.99,2.25),.78,1.04,1)
board=material('Blackboard - charcoal green',(.055,.09,.075),.95)
box('Front collaboration blackboard',(5.1,-6.28,1.19),(1.8,.045,.94),board,.012)
for z in [.71,1.67]:box('Blackboard timber horizontal frame',(5.1,-6.28,z),(1.86,.07,.035),oak,.006)
for x in [4.18,6.02]:box('Blackboard timber side frame',(x,-6.28,1.19),(.035,.07,.96),oak,.006)
box('Blackboard chalk ledge',(5.1,-6.20,.70),(1.84,.15,.035),oak,.007)
s['reference_details_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'plants':8,'panels':4,'meeting_table':'capsule','prints':2,'blackboard':True}))
