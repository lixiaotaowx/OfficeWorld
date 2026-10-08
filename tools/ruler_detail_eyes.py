"""Round the original flat, faceted eyes while retaining their material/rig IDs."""
import bpy
import bmesh
from ruler_detail_geometry import Surface

def refine_eyes():
    body=bpy.data.objects['RULER.001']
    bm=bmesh.new()
    bm.from_mesh(body.data)
    faces=[f for f in bm.faces if body.data.materials[f.material_index].name in ['材质.005','材质.006']]
    bmesh.ops.delete(bm,geom=faces,context='FACES')
    loose=[v for v in bm.verts if not v.link_faces]
    if loose: bmesh.ops.delete(bm,geom=loose,context='VERTS')
    bm.to_mesh(body.data)
    bm.free()
    pieces=[]
    for x in [-.13449,.13742]:
        for pupil in [False,True]:
            s=Surface()
            radius=.06165 if pupil else .08153
            s.ellipsoid((x-.002 if pupil else x,-.053 if pupil else -.030,1.48656),
                (radius,.011 if pupil else .024,radius),(.02,.02,.02),64,32)
            obj=s.finish('Eye detail '+str(x)+' '+str(pupil))
            obj.data.materials.clear()
            obj.data.materials.append(bpy.data.materials['材质.005' if pupil else '材质.006'])
            # Join in bind space; the body already owns the armature modifier.
            obj.modifiers.clear()
            pieces.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    body.hide_set(False)
    body.select_set(True)
    for obj in pieces: obj.select_set(True)
    bpy.context.view_layer.objects.active=body
    bpy.ops.object.join()
