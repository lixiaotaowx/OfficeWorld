"""Deterministic swept geometry for the ruler's fitted accessories."""
import math
import random
import bpy
from mathutils import Vector

rng = random.Random(928)

class Surface:
    def __init__(self):
        self.vertices, self.faces, self.colors = [], [], []

    def vertex(self, p, color):
        self.vertices.append(tuple(p))
        self.colors.append((*color, 1))
        return len(self.vertices) - 1

    def tube(self, points, radius, color, sides=4, taper=True):
        points = [Vector(p) for p in points]
        start = len(self.vertices)
        for i, p in enumerate(points):
            tangent = (points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
            axis = Vector((0,1,0))
            if abs(tangent.dot(axis)) > .95:
                axis = Vector((1,0,0))
            u = tangent.cross(axis).normalized()
            v = tangent.cross(u).normalized()
            t = i/(len(points)-1)
            r = radius * ((.8 + .2*math.sin(t*math.pi))*(1-t)**.65+.025 if taper else 1)
            for j in range(sides):
                a = j*2*math.pi/sides
                self.vertex(p+r*(u*math.cos(a)+v*math.sin(a)),color)
            if i:
                for j in range(sides):
                    a = start+(i-1)*sides+j
                    b = start+(i-1)*sides+(j+1)%sides
                    self.faces.append((a,b,b+sides,a+sides))
        self.faces.append(tuple(start+j for j in reversed(range(sides))))
        self.faces.append(tuple(start+(len(points)-1)*sides+j for j in range(sides)))

    def patch(self, fn, nu, nv, color):
        start = len(self.vertices)
        for i in range(nu+1):
            for j in range(nv+1):
                self.vertex(fn(i/nu,j/nv),color)
        for i in range(nu):
            for j in range(nv):
                a=start+i*(nv+1)+j
                self.faces.append((a,a+1,a+nv+2,a+nv+1))

    def ellipsoid(self, center, radii, color, nu=32, nv=16):
        self.patch(lambda u,v:(center[0]+radii[0]*math.sin(v*math.pi)*math.cos(u*2*math.pi),
            center[1]+radii[1]*math.sin(v*math.pi)*math.sin(u*2*math.pi),
            center[2]+radii[2]*math.cos(v*math.pi)),nu,nv,color)

    def finish(self, name, rough=.55, metal=0):
        old=bpy.data.objects.get(name)
        if old: bpy.data.objects.remove(old,do_unlink=True)
        mesh=bpy.data.meshes.new(name+'.detail')
        mesh.from_pydata(self.vertices,[],self.faces)
        mesh.update()
        attr=mesh.color_attributes.new(name='CraftColor',type='FLOAT_COLOR',domain='POINT')
        for i,c in enumerate(self.colors): attr.data[i].color=c
        material=bpy.data.materials.new(name+'_crafted')
        material.use_nodes=True
        bsdf=material.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Roughness'].default_value=rough
        bsdf.inputs['Metallic'].default_value=metal
        color=material.node_tree.nodes.new('ShaderNodeVertexColor')
        color.layer_name='CraftColor'
        material.node_tree.links.new(color.outputs['Color'],bsdf.inputs['Base Color'])
        mesh.materials.append(material)
        obj=bpy.data.objects.new(name,mesh)
        bpy.context.scene.collection.objects.link(obj)
        arm=bpy.data.objects['Armature']
        obj.parent=arm
        obj.matrix_parent_inverse=arm.matrix_world.inverted()
        group=obj.vertex_groups.new(name='mixamorig:Head')
        group.add(list(range(len(mesh.vertices))),1,'REPLACE')
        obj.modifiers.new('Head binding','ARMATURE').object=arm
        for face in mesh.polygons: face.use_smooth=True
        print('REMODELED',name,len(mesh.vertices),'vertices',flush=True)
        return obj

def shade(base, spread=.3):
    factor=1+rng.uniform(-spread,spread)
    return tuple(min(1,max(.002,c*factor)) for c in base)

def bezier(a,b,c,d,n=8):
    return [tuple((1-t)**3*a[k]+3*(1-t)**2*t*b[k]+3*(1-t)*t*t*c[k]+t**3*d[k]
        for k in range(3)) for t in [i/(n-1) for i in range(n)]]

