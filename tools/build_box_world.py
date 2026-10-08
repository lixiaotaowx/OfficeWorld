"""Editable Blender library matching the web's exact un-beveled box meshes."""
import bpy
import json
import os
import sys
import math
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'AssetSources', 'BoxWorld')
with open(os.path.join(DEST, 'BoxParts.json'), encoding='utf-8') as file:
    assets = json.load(file)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
materials = {}

def material(hex_color, glow=False):
    key = (hex_color, glow)
    if key not in materials:
        rgb = [int(hex_color[i:i+2], 16) / 255 for i in (1, 3, 5)]
        linear = [v / 12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
        mat = bpy.data.materials.new('Pure ' + hex_color)
        mat.diffuse_color = (*linear, 1)
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = (*linear, 1)
        shader.inputs['Roughness'].default_value = .85
        if glow:
            shader.inputs['Emission Color'].default_value = (*linear, 1)
            shader.inputs['Emission Strength'].default_value = .65
        materials[key] = mat
    return materials[key]

for index, asset in enumerate(assets):
    collection = bpy.data.collections.new(asset['id'] + ' · ' + asset['label'])
    bpy.context.scene.collection.children.link(collection)
    origin = bpy.data.objects.new(asset['id'], None)
    collection.objects.link(origin)
    origin.location = ((index % 5) * 5, -(index // 5) * 5, 0)
    origin['kind'] = asset['id']
    origin['label'] = asset['label']
    origin['web_size_xyz'] = asset['size']
    origin['geometry_rule'] = 'Square outer arch with semicircular opening' if asset['id'] == 'arch' else 'Box only; no bevel or subdivision'
    for number, row in enumerate(asset['boxes']):
        if 'vertices' in row:
            coords = row['vertices']
            vertices = [(coords[i], -coords[i+2], coords[i+1]) for i in range(0, len(coords), 3)]
            indices = row['indices']
            faces = [tuple(indices[i:i+3]) for i in range(0, len(indices), 3)]
            mesh = bpy.data.meshes.new(asset['id'] + '_curved_opening')
            mesh.from_pydata(vertices, [], faces)
            mesh.update()
            cube = bpy.data.objects.new(asset['id'] + '_arch', mesh)
        else:
            bpy.ops.mesh.primitive_cube_add(size=1)
            cube = bpy.context.object
        cube.name = asset['id'] + '_box_' + str(number + 1)
        for previous in list(cube.users_collection):
            previous.objects.unlink(cube)
        collection.objects.link(cube)
        cube.parent = origin
        x, y, z = row['position']
        sx, sy, sz = row['size']
        cube.location = (x, -z, y)
        cube.scale = (sx, sz, sy)
        cube.data.materials.append(material(row['color'], row.get('glow', False)))
        if row.get('arrowNudge'):
            for frame in range(1, 66):
                phase = (frame-1)/64
                cube.location.y = -z-.08*math.sin(math.pi*phase)**4
                cube.keyframe_insert(data_path='location',frame=frame)
            bpy.context.scene.frame_set(1)
        if 'flagPanel' in row:
            # Same travelling wave as the web, baked for editable Blender playback.
            panel = row['flagPanel']
            for frame in range(1, 66, 4):
                phase = (frame-1) / 64 * math.tau
                a = math.sin(phase-panel*.65)*.1*panel/8
                b = math.sin(phase-(panel+1)*.65)*.1*(panel+1)/8
                cube.location.y = -(a+b)/2
                cube.rotation_euler.z = -math.atan2(b-a,.1)
                cube.scale.x = math.hypot(.1,b-a)
                cube.keyframe_insert(data_path='location',frame=frame)
                cube.keyframe_insert(data_path='rotation_euler',frame=frame)
                cube.keyframe_insert(data_path='scale',frame=frame)
            bpy.context.scene.frame_set(1)
        for face in cube.data.polygons:
            face.use_smooth = False
    origin.asset_mark()
    # A reusable, metre-scale model at the origin in addition to the editable library.
    bpy.ops.object.select_all(action='DESELECT')
    for obj in collection.objects:
        obj.select_set(True)
    location = origin.location.copy()
    origin.location = (0, 0, 0)
    bpy.context.view_layer.update()
    os.makedirs(os.path.join(DEST, 'Models'), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(DEST, 'Models', asset['id'] + '.glb'),
                              export_format='GLB', use_selection=True)
    origin.location = location

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 65
scene.render.fps = 30
scene.world.color = (.25, .3, .4)
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.render.resolution_x = 1500
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
bpy.ops.object.light_add(type='AREA', location=(4, -5, 18))
light = bpy.context.object
light.name = 'Library softbox'
light.data.energy = 2200
light.data.shape = 'DISK'
light.data.size = 14
bpy.ops.object.camera_add(location=(29, -36, 29))
camera = bpy.context.object
camera.rotation_euler = (Vector((10, -8, 0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 32
scene.camera = camera
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(DEST, 'BoxWorld_Parts.blend'))
print('BOX_LIBRARY_OK', len(assets), 'assets; no bevel modifiers')
