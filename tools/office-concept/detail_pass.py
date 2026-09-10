import bpy,sys,math,json
from pathlib import Path
sys.path.insert(0,r'G:/C/wendang/ChatGPT/youxi/tools/office-concept')
from primitives import box
scene=bpy.context.scene
cream=bpy.data.materials['Ivory porcelain']
wood=bpy.data.materials['Pale natural oak']
dark=bpy.data.materials['Warm graphite']
# Preserve the current live project, including any user edits, before this detail pass.
bpy.ops.wm.save_as_mainfile(filepath=r'G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/Before_Detail_Pass.blend',copy=True)


def curved_piece(name,r1,r2,z1,z2):
    vertices=[]
    segments=36
    for z in [z1,z2]:
        for r in [r1,r2]:
            for i in range(segments+1):
                angle=math.radians(25+135*i/segments)
                vertices.append((-7.15+math.cos(angle)*r,1.2+math.sin(angle)*r*.78,z))
    n=segments+1
    faces=[]
    for i in range(segments):
        faces.extend([(i,i+1,n+i+1,n+i),
                      (2*n+i,3*n+i,3*n+i+1,2*n+i+1),
                      (i,2*n+i,2*n+i+1,i+1),
                      (n+i,n+i+1,3*n+i+1,3*n+i)])
    faces.extend([(0,n,3*n,2*n),(n-1,3*n-1,4*n-1,2*n-1)])
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    lounge=next(c for c in scene.collection.children if c.name.startswith('07 Lounge'))
    lounge.objects.link(obj);mesh.materials.append(cream)
    bevel=obj.modifiers.new('Upholstery roundover','BEVEL');bevel.width=.075;bevel.segments=3
    obj.modifiers.new('Sofa normals','WEIGHTED_NORMAL')
    return obj

if not bpy.data.objects.get('Lounge / continuous curved seat'):
    for obj in scene.objects:
        if obj.name.startswith(('Lounge / curved sofa cushion','Lounge / curved sofa back')):
            obj.hide_set(True);obj.hide_render=True
    curved_piece('Lounge / continuous curved seat',1.12,2.02,.30,.57)
    curved_piece('Lounge / continuous curved back',1.92,2.15,.34,1.06)

# One mesh per complete keycap set, rather than dozens of draw-call objects.
created=0
for keyboard in [o for o in scene.objects if o.name.endswith('keyboard')]:
    name=keyboard.name+' keycaps'
    if bpy.data.objects.get(name):continue
    vertices=[];faces=[]
    for row in range(4):
        for col in range(12):
            x=keyboard.location.x-.187+col*.034
            y=keyboard.location.y-.053+row*.032
            z=keyboard.location.z+.013
            k=len(vertices)
            vertices.extend([(x,y,z),(x+.025,y,z),(x+.025,y+.021,z),(x,y+.021,z),
                             (x,y,z+.008),(x+.025,y,z+.008),(x+.025,y+.021,z+.008),(x,y+.021,z+.008)])
            faces.extend([tuple(k+j for j in face) for face in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(cream)
    obj=bpy.data.objects.new(name,mesh)
    keyboard.users_collection[0].objects.link(obj)
    keyboard.data.materials.clear();keyboard.data.materials.append(dark)
    created+=1

# Coffee cabinets get functional divisions and small matching pulls.
coffee=next(c for c in scene.collection.children if c.name.startswith('06 Coffee'))
if not bpy.data.objects.get('Coffee / door panel 0'):
    for i in range(6):
        x=-3.87+i*.63
        for obj in [box('Coffee / door panel '+str(i),(x,5.508,.47),(.603,.022,.82),wood,.012),
                    box('Coffee / drawer pull '+str(i),(x,5.486,.77),(.18,.018,.018),dark,.006)]:
            coffee.objects.link(obj)
            for collection in list(obj.users_collection):
                if collection!=coffee:collection.objects.unlink(obj)

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'keyboard_sets':created,'shared_screens':len([o for o in scene.objects if o.get('role')=='shared_screen' and o.name.startswith('Island_')]),'light_powers':{o.name:o.data.energy for o in scene.objects if o.type=='LIGHT'}}))
