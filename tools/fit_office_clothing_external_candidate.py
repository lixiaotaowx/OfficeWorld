"""Adapt CC0 finished garments to an exported MetaHuman rest skeleton.

Produces candidates for UE motion/fit review, not automatic acceptance.
"""
import bpy,json,pathlib,sys,numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/AssetSources/Realistic/OfficePeople')
args=sys.argv[sys.argv.index('--')+1:];identity,garment,shoes=args[:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'Fitting'/(identity+'_Body.fbx')))
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
bones={b.name:np.array(arm.matrix_world@b.head_local) for b in arm.data.bones}
body_mesh=next(o for o in bpy.data.objects if o.type=='MESH')
body_bvh=BVHTree.FromPolygons([body_mesh.matrix_world@v.co for v in body_mesh.data.vertices],[list(p.vertices) for p in body_mesh.data.polygons])
face_file=root/'Fitting'/(identity+'_Face.fbx')
if face_file.exists():bpy.ops.import_scene.fbx(filepath=str(face_file))
before=set(bpy.data.objects);native_file=root/'Fitting'/(identity+'_DefaultOutfit.fbx')
if native_file.exists():bpy.ops.import_scene.fbx(filepath=str(native_file))
native_mesh=next((o for o in bpy.data.objects if o not in before and o.type=='MESH'),None)
native_top_height=max((native_mesh.matrix_world@v.co).z for v in native_mesh.data.vertices) if native_mesh else None
skin_points=[];skin_weights=[]
for skin in [o for o in bpy.data.objects if o.type=='MESH']:
 for vertex in skin.data.vertices:
  weights={skin.vertex_groups[g.group].name:g.weight for g in vertex.groups if skin.vertex_groups[g.group].name in bones and g.weight>1e-6}
  total=sum(weights.values())
  if total>.05:
   skin_points.append(skin.matrix_world@vertex.co);skin_weights.append({n:w/total for n,w in weights.items()})
skin_tree=KDTree(len(skin_points))
for index,point in enumerate(skin_points):skin_tree.insert(point,index)
skin_tree.balance();transfer_counts={}
verts=[];groups={};current=''
for line in (root/'Fitting/MakeHuman_base.obj').read_text().splitlines():
 if line.startswith('v '):
  x,y,z=map(float,line.split()[1:4]);verts.append([x*.1,-z*.1,y*.1])
 elif line.startswith('g '):current=line.split()[1]
 elif line.startswith('f ') and current.startswith('joint-'):
  groups.setdefault(current,set()).update(int(x.split('/')[0])-1 for x in line.split()[1:])
verts=np.array(verts);joints={g:verts[list(ids)].mean(axis=0) for g,ids in groups.items()}
mapping={'joint-pelvis':'pelvis','joint-neck':'neck_01'}
for side in ['l','r']:
 for src,dst in [('shoulder','upperarm'),('elbow','lowerarm'),('hand','hand'),('upper-leg','thigh'),('knee','calf'),('ankle','foot'),('foot-1','ball')]:mapping['joint-'+side+'-'+src]=dst+'_'+side
src=np.array([joints[g] for g in mapping]);dst=np.array([bones[b] for b in mapping.values()])
# A smooth radial warp matches skeleton landmarks while retaining garment topology and UVs.
d=np.linalg.norm(src[:,None]-src[None,:],axis=2)
P=np.column_stack([np.ones(len(src)),src]);K=np.block([[d**3+np.eye(len(src))*1e-7,P],[P.T,np.zeros((4,4))]])
coef=np.linalg.solve(K,np.vstack([dst,np.zeros((4,3))]))
def warp(points):
 d=np.linalg.norm(points[:,None]-src[None,:],axis=2)
 return np.column_stack([d**3,np.ones(len(points)),points])@coef
segments=[]
for b in arm.data.bones:
 if b.name.startswith(('spine_','upperarm_','lowerarm_','thigh_','calf_')) and 'corrective' not in b.name and b.name in bones:
  if b.name not in ['spine_01','spine_02','spine_03','spine_04','spine_05','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','thigh_l','thigh_r','calf_l','calf_r']:continue
  children=[x for x in b.children if x.name in ['spine_02','spine_03','spine_04','spine_05','neck_01','lowerarm_l','lowerarm_r','hand_l','hand_r','calf_l','calf_r','foot_l','foot_r']]
  if children:segments.append((b.name,bones[b.name],bones[children[0].name]))
segments.append(('pelvis',bones['pelvis']+np.array([0,0,-.04]),bones['spine_01']))
for side in ['l','r']:
 if 'clavicle_'+side in bones:segments.append(('clavicle_'+side,bones['clavicle_'+side],bones['upperarm_'+side]))
if 'neck_01' in bones and 'head' in bones:segments.append(('neck_01',bones['neck_01'],bones['head']))
for side in ['l','r']:segments.append(('foot_'+side,bones['foot_'+side],bones['ball_'+side]))
garments=[]
for name in [garment,shoes]:
 bpy.ops.wm.obj_import(filepath=str(root/'MakeHumanCC0/clothes'/name/(name+'.obj')))
 obj=bpy.context.object;obj.name='SK_'+identity+'_'+name
 points=np.array([obj.matrix_world@v.co for v in obj.data.vertices])*.1
 transformed=warp(points)
 if name==garment and identity!='Office_F01' and native_top_height:
  lift=max(0,native_top_height+.018-transformed[:,2].max())
  shoulder_width=max(abs(bones['upperarm_l'][0]),abs(bones['upperarm_r'][0]))
  for p in transformed:
   factor=np.clip((p[2]-bones['pelvis'][2])/.15,0,1)
   if abs(p[0])>shoulder_width*.8:
    hand=bones['hand_l' if p[0]>0 else 'hand_r'];shoulder=bones['upperarm_l' if p[0]>0 else 'upperarm_r'];factor=min(factor,np.clip((p[2]-hand[2])/(shoulder[2]-hand[2]),0,1))
   p[2]+=lift*factor
 if name==garment and 'elegantsuit' not in name:
  for p in transformed:
   if p[2]<bones['pelvis'][2]-.15:
    side='l' if p[0]>0 else 'r';a=bones['thigh_'+side] if p[2]>bones['calf_'+side][2] else bones['calf_'+side];b=bones['calf_'+side] if p[2]>bones['calf_'+side][2] else bones['foot_'+side]
    delta=b-a;t=np.clip(np.dot(p-a,delta)/np.dot(delta,delta),0,1);center=a+t*delta;radial=p-center;length=np.linalg.norm(radial)
    if length>.005:p+=radial/length*.018
 if name==shoes:
  for p in transformed:
   side='l' if p[0]>0 else 'r';ankle=bones['foot_'+side];forward=bones['ball_'+side]-ankle;forward[2]=0;forward/=np.linalg.norm(forward);projection=np.dot(p-ankle,forward)
   if projection>0:p+=forward*projection*.28
   lateral=np.array([-forward[1],forward[0],0]);p+=lateral*np.dot(p-ankle,lateral)*.12
 for i,p in enumerate(transformed):
  surface,normal,_,distance=body_bvh.find_nearest(Vector(p))
  if p[2]<bones['pelvis'][2]-.05 and surface is not None and distance<.06 and (Vector(p)-surface).dot(normal)<.004:
   transformed[i]=surface+normal*.007
 for v,p in zip(obj.data.vertices,transformed):v.co=p
 obj.matrix_world.identity()
 for n,_,_ in segments:obj.vertex_groups.new(name=n)
 for n in bones:
  if obj.vertex_groups.get(n) is None:obj.vertex_groups.new(name=n)
 transferred=0
 for i,p in enumerate(transformed):
  nearby=skin_tree.find_n(Vector(p),8)
  if nearby and nearby[0][2]<.10:
   weights={}
   for _,index,distance in nearby:
    influence=1/(distance+.008)**3
    for n,w in skin_weights[index].items():weights[n]=weights.get(n,0)+w*influence
   chosen=sorted(weights.items(),key=lambda x:-x[1])[:8];total=sum(w for _,w in chosen)
   if total>1e-8:
    for n,w in chosen:obj.vertex_groups[n].add([i],w/total,'REPLACE')
    transferred+=1;continue
  ds=[]
  for n,a,b in segments:
   delta=b-a;t=np.clip(np.dot(p-a,delta)/max(np.dot(delta,delta),1e-8),0,1);distance=np.linalg.norm(p-(a+t*delta))
   shoulder_width=max(abs(bones['upperarm_l'][0]),abs(bones['upperarm_r'][0]))
   if p[2]>bones['pelvis'][2] and abs(p[0])<shoulder_width+.035 and n.startswith(('upperarm','lowerarm','thigh','calf','foot')):distance=1000
   ds.append(distance)
  chosen=np.argsort(ds)[:3];w=1/(np.array(ds)[chosen]+.025)**5;w/=w.sum()
  for idx,weight in zip(chosen,w):obj.vertex_groups[segments[idx][0]].add([i],float(weight),'REPLACE')
 transfer_counts[name]=transferred
 mod=obj.modifiers.new('MetaHuman skin','ARMATURE');mod.object=arm;obj.parent=arm;obj.matrix_parent_inverse=arm.matrix_world.inverted()
 mat=bpy.data.materials.new(name);mat.use_nodes=True;nodes=mat.node_tree.nodes;bs=nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.72
 diffuse=root/'MakeHumanCC0/clothes'/name/(name+'_diffuse.png')
 if diffuse.exists():
  tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(diffuse));mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
 obj.data.materials.clear();obj.data.materials.append(mat)
 if identity=='Office_F01' and name==garment:
  # The source shirt and trousers are disconnected components. Keep original
  # denim and its UVs, but give the office shirt a restrained plain fabric color.
  parent=list(range(len(obj.data.vertices)))
  def find(i):
   while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
   return i
  for edge in obj.data.edges:
   a,b=edge.vertices;parent[find(a)]=find(b)
  maxima={}
  for v in obj.data.vertices:maxima[find(v.index)]=max(maxima.get(find(v.index),-1e9),v.co.z)
  top=mat.copy();top.name=name+'_Top';topbs=top.node_tree.nodes.get('Principled BSDF')
  for link in list(topbs.inputs['Base Color'].links):top.node_tree.links.remove(link)
  topbs.inputs['Base Color'].default_value=(.23,.37,.29,1);obj.data.materials.append(top)
  for face in obj.data.polygons:
   if maxima[find(face.vertices[0])]>bones['neck_01'][2]-.13:face.material_index=1
  if native_mesh:
   import bmesh
   bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.material_index==1],context='FACES');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(obj.data);bm.free()
 for p in obj.data.polygons:p.use_smooth=True
 if name==shoes:
  import bmesh
  bm=bmesh.new();bm.from_mesh(obj.data)
  sock_top=max(bones['foot_l'][2],bones['foot_r'][2])+.035
  bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z>sock_top],context='VERTS');bm.to_mesh(obj.data);bm.free()
 garments.append(obj)
if identity=='Office_F01' and native_mesh:
 import bmesh
 top=native_mesh.copy();top.data=native_mesh.data.copy();bpy.context.collection.objects.link(top);top.name='SK_'+identity+'_NativeTop'
 world_matrix=top.matrix_world.copy();top.parent=None;top.matrix_world.identity()
 for v in top.data.vertices:v.co=world_matrix@v.co
 bm=bmesh.new();bm.from_mesh(top.data)
 bmesh.ops.delete(bm,geom=[f for f in bm.faces if 'Shirt' not in top.data.materials[f.material_index].name],context='FACES');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(top.data);bm.free()
 assert len(top.data.polygons)>0,'Native shirt selection is empty'
 top.modifiers.clear();mod=top.modifiers.new('MetaHuman original skin','ARMATURE');mod.object=arm;top.parent=arm;top.matrix_parent_inverse=arm.matrix_world.inverted()
 mat=bpy.data.materials.new('NativeShirt');mat.diffuse_color=(.23,.37,.29,1);top.data.materials.clear();top.data.materials.append(mat)
 for f in top.data.polygons:f.material_index=0
 garments.append(top)
for obj in list(bpy.data.objects):
 if obj.type=='MESH' and obj not in garments:obj.hide_render=True;obj.hide_set(True)
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for obj in garments:obj.select_set(True)
bpy.context.view_layer.objects.active=arm
out=root/'Fitting'/identity;out.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.fbx(filepath=str(out/'Clothing.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=False,mesh_smooth_type='FACE',axis_forward='-Y',axis_up='Z')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Clothing.blend'))
(out/'fitting.json').write_text(json.dumps({'identity':identity,'garment':garment,'shoes':shoes,'landmarks':mapping,'skin_weights_transferred':transfer_counts,'status':'candidate; requires UE fit and motion review','vertices':{o.name:len(o.data.vertices) for o in garments}},indent=2))
