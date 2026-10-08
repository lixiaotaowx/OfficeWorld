"""Preserve the newly editable initial scene as a separate Blender source."""
import json
import math
import os
import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'AssetSources', 'BoxWorld', 'InitialScene')
os.makedirs(DEST, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
palette = {'#f3dfc5':'#ffe6c7', '#e9b8b5':'#f2aaa6', '#b9c9df':'#a5bced',
           '#b4c5a0':'#abc477', '#cabddd':'#c8b2e8', '#c69770':'#dfad82', '#596679':'#657797'}
materials = {}
count = 0
for name in ['scenery', 'desks', 'chairs']:
    source = os.path.join(ROOT, 'OfficeWeb', 'scene-' + name + '.json')
    with open(source, encoding='utf-8') as file:
        text = file.read()
    with open(os.path.join(DEST, 'scene-' + name + '.json'), 'w', encoding='utf-8') as file:
        file.write(text)
    for fixture in json.loads(text):
        count += 1
        group = bpy.data.objects.new('scene-' + fixture['id'], None)
        bpy.context.scene.collection.objects.link(group)
        x, y, z = fixture['origin']
        group.location = (x, -z, y)
        group['fixture'] = fixture['id']
        group['kind'] = fixture['kind']
        group['web_dimensions_xyz'] = fixture['dimensions']
        for i, row in enumerate(fixture['boxes']):
            size, position, color = row[:3]
            color = palette.get(color, color)
            if color not in materials:
                material = bpy.data.materials.new(color)
                rgb = [int(color[j:j+2], 16) / 255 for j in (1, 3, 5)]
                material.diffuse_color = (*rgb, 1)
                materials[color] = material
            bpy.ops.mesh.primitive_cube_add(size=1)
            cube = bpy.context.object
            cube.name = fixture['id'] + '-box-' + str(i)
            cube.parent = group
            cube.location = (position[0], -position[2], position[1])
            cube.scale = (size[0], size[2], size[1])
            cube.rotation_euler.z = row[3] if len(row) > 3 else 0
            cube.data.materials.append(materials[color])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(DEST, 'Editable_Initial_Scene.blend'))
print('EDITABLE_INITIAL_SCENE_OK', count)
