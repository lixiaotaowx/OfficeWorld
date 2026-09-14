"""Render a front-view thumbnail for each OfficeWeb character GLB.

Usage:
  blender -b -P render_character_thumbnails.py -- <id>   # one character
  blender -b -P render_character_thumbnails.py           # all characters

Runs headless with EEVEE and writes 256x256 RGBA PNGs next to the GLBs.
"""
import bpy
import json
import math
import os
import sys
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAR_DIR = os.path.join(ROOT, "OfficeWeb", "public", "assets", "characters")
MANIFEST = os.path.join(CHAR_DIR, "characters.json")
THUMB_DIR = os.path.join(CHAR_DIR, "thumbnails")
SIZE = 256


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.film_transparent = True
    scene.render.resolution_x = SIZE
    scene.render.resolution_y = SIZE
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    return scene


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    # The Blender importer adds a stray material-less "Icosphere" placeholder
    # beside the skinned character meshes; hide it so it does not inflate the
    # framing bounds or appear in the render.
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH" and not any(
            m.type == "ARMATURE" for m in obj.modifiers
        ):
            obj.hide_render = True
            obj.hide_viewport = True


def is_character_mesh(obj):
    return obj.type == "MESH" and any(
        m.type == "ARMATURE" for m in obj.modifiers
    )


def mesh_bounds():
    """World-space bounds from the *deformed* meshes (skinned meshes report a
    stale -1..1 placeholder from `bound_box`, so evaluate the armature first)."""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    minv = Vector((1e9, 1e9, 1e9))
    maxv = Vector((-1e9, -1e9, -1e9))
    found = False
    for obj in bpy.context.scene.objects:
        if not is_character_mesh(obj):
            continue
        found = True
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        try:
            for vertex in mesh.vertices:
                w = obj.matrix_world @ vertex.co
                minv.x = min(minv.x, w.x)
                minv.y = min(minv.y, w.y)
                minv.z = min(minv.z, w.z)
                maxv.x = max(maxv.x, w.x)
                maxv.y = max(maxv.y, w.y)
                maxv.z = max(maxv.z, w.z)
        finally:
            evaluated.to_mesh_clear()
    if not found:
        raise RuntimeError("no meshes imported")
    return minv, maxv


def add_light(name, kind, location, energy, size=1.5):
    data = bpy.data.lights.new(name, kind)
    if kind == "AREA":
        data.size = size
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    data.energy = energy
    return obj


def point_at(obj, target):
    direction = (Vector(target) - obj.location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_one(glb_path, out_path):
    reset_scene()
    import_glb(glb_path)
    minv, maxv = mesh_bounds()
    center = (minv + maxv) / 2.0
    height = maxv.z - minv.z
    width = maxv.x - minv.x
    span = max(width, height)
    span = max(span, 0.01)

    # Frame the full figure (A-pose arms included) with a little headroom.
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = span * 1.18
    # Camera in front of the character, aimed at its vertical centre.
    cam.location = (center.x, center.y - span * 2.0, center.z)
    point_at(cam, (center.x, center.y, center.z))

    key = add_light("Key", "AREA", (center.x - 1.2, center.y - span * 1.8,
                                     center.z + height * 1.6), 900, 2.5)
    point_at(key, center)
    fill = add_light("Fill", "AREA", (center.x + 1.6, center.y - span * 1.4,
                                      center.z + height * 0.9), 350, 2.0)
    point_at(fill, center)
    add_light("Rim", "AREA", (center.x, center.y + span * 1.6,
                              center.z + height * 1.2), 400, 2.0)
    # Soft overall lift so dark outfits still read.
    add_light("Top", "SUN", (center.x, center.y, center.z + span * 3.0), 1.2)

    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)


def main():
    with open(MANIFEST, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)
    os.makedirs(THUMB_DIR, exist_ok=True)
    only = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else None
    todo = [c for c in manifest if not only or c["id"] == only]
    if only and not todo:
        raise SystemExit(f"unknown character id: {only}")
    for char in todo:
        glb_path = os.path.join(CHAR_DIR, char["id"] + ".glb")
        out_path = os.path.join(THUMB_DIR, char["id"] + ".png")
        render_one(glb_path, out_path)
        print("rendered", char["id"])


if __name__ == "__main__":
    main()
