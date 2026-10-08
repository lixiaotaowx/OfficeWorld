"""从导出的 GLB 反向核对：重新导入、报结构、渲染缩略图与动作抽查帧。

用法：
  blender --factory-startup -b -P tools/verify_ruler_mascot.py -- [id ...]

不带参数就检查 public/assets/characters/ruler_*.glb 全部。缩略图写到
public/assets/characters/thumbnails/，动作抽查帧写到 Build/ruler-check/。
"""
import glob
import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "AssetSources", "Characters", "RulerMascot")
CHAR_DIR = os.path.join(SRC_DIR, "glb")
THUMB_DIR = os.path.join(SRC_DIR, "thumbnails")
CHECK_DIR = os.path.join(ROOT, "Build", "ruler-check")
THUMB_SIZE = 256
CHECK_FRAMES = (1, 6, 12)


def engine():
    names = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    for want in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        if want in names:
            return want
    return names[0]


def reset_scene(size):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = engine()
    scene.render.film_transparent = True
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    try:
        scene.eevee.taa_render_samples = 24
    except Exception:  # noqa: BLE001
        pass
    return scene


def character_meshes():
    return [o for o in bpy.context.scene.objects
            if o.type == "MESH" and any(m.type == "ARMATURE" for m in o.modifiers)]


def hide_strays():
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH" and not any(m.type == "ARMATURE" for m in obj.modifiers):
            obj.hide_render = True
            obj.hide_viewport = True


def deformed_bounds():
    depsgraph = bpy.context.evaluated_depsgraph_get()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in character_meshes():
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        try:
            for vertex in mesh.vertices:
                point = obj.matrix_world @ vertex.co
                for i in range(3):
                    lo[i] = min(lo[i], point[i])
                    hi[i] = max(hi[i], point[i])
        finally:
            evaluated.to_mesh_clear()
    return lo, hi


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_camera_lights(center, span, height):
    world = bpy.data.worlds.new("CheckWorld")
    world.use_nodes = True
    background = world.node_tree.nodes["Background"]
    background.inputs[0].default_value = (0.55, 0.60, 0.68, 1.0)
    background.inputs[1].default_value = 1.0
    bpy.context.scene.world = world
    # 这模型约 9.5 单位高（不是 1.72 米的人），灯的强度要按距离平方补回来。
    boost = max(1.0, (max(height, 0.01) / 1.72) ** 2)
    camera_data = bpy.data.cameras.new("Cam")
    camera = bpy.data.objects.new("Cam", camera_data)
    bpy.context.scene.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = span * 1.15
    camera.location = (center.x, center.y - span * 2.0, center.z)
    point_at(camera, center)
    specs = [("Key", (center.x - 1.2, center.y - span * 1.8, center.z + height * 1.6), 900, 2.5),
             ("Fill", (center.x + 1.6, center.y - span * 1.4, center.z + height * 0.9), 350, 2.0),
             ("Rim", (center.x, center.y + span * 1.6, center.z + height * 1.2), 400, 2.0)]
    for name, location, energy, size in specs:
        data = bpy.data.lights.new(name, "AREA")
        data.size = size * max(1.0, height / 1.72)
        data.energy = energy * boost
        obj = bpy.data.objects.new(name, data)
        bpy.context.scene.collection.objects.link(obj)
        obj.location = location
        point_at(obj, center)
    data = bpy.data.lights.new("Top", "SUN")
    data.energy = 1.2
    obj = bpy.data.objects.new("Top", data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = (center.x, center.y, center.z + span * 3.0)


def report(glb_path):
    armatures = [o for o in bpy.context.scene.objects if o.type == "ARMATURE"]
    clips = []
    for action in bpy.data.actions:
        start, end = action.frame_range
        clips.append("%s(%.2fs)" % (action.name, (end - start) / 24.0))
    tris = 0
    for obj in character_meshes():
        tris += sum(max(0, len(p.vertices) - 2) for p in obj.data.polygons)
    images = [i for i in bpy.data.images if i.size[0]]
    print("[check] %s" % os.path.basename(glb_path))
    print("[check]   动作: %s" % (", ".join(sorted(clips)) or "（无）"))
    print("[check]   网格 %d 个 / %d 三角面 / 骨架 %s(%d 骨)"
          % (len(character_meshes()), tris,
             armatures[0].name if armatures else "-",
             len(armatures[0].data.bones) if armatures else 0))
    print("[check]   贴图: %s" % (", ".join("%s %dx%d" % (i.name, i.size[0], i.size[1])
                                            for i in images) or "（无）"))
    return clips


def render(path, size):
    scene = bpy.context.scene
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def assign_action(armature, action):
    if armature.animation_data is None:
        armature.animation_data_create()
    data = armature.animation_data
    data.use_nla = False
    data.action = action
    # 4.4+ 的 slotted action：不指定 slot 的话动作不会驱动骨架（渲染出来是静止姿势）。
    for attribute in ("action_slot", "action_slot_handle"):
        try:
            if getattr(data, attribute, None) is None and getattr(action, "slots", None):
                setattr(data, attribute, action.slots[0])
                break
        except Exception:  # noqa: BLE001
            continue


def check_glb(glb_path):
    reset_scene(THUMB_SIZE)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    hide_strays()
    report(glb_path)
    name = os.path.splitext(os.path.basename(glb_path))[0]
    armature = next((o for o in bpy.context.scene.objects if o.type == "ARMATURE"), None)
    actions = sorted(bpy.data.actions, key=lambda a: a.name)
    if actions and armature:
        assign_action(armature, actions[0])

    lo, hi = deformed_bounds()
    center = (lo + hi) / 2.0
    span = max(hi.x - lo.x, hi.z - lo.z, 0.01)
    setup_camera_lights(center, span, hi.z - lo.z)

    # 每条动作抽 4 帧，方便人眼核对姿势与循环。
    os.makedirs(CHECK_DIR, exist_ok=True)
    for action in actions:
        assign_action(armature, action)
        start, end = int(action.frame_range[0]), int(action.frame_range[1])
        for step in range(4):
            frame = start + round((end - start) * step / 4.0)
            bpy.context.scene.frame_set(frame)
            render(os.path.join(CHECK_DIR, "%s_%s_%02d.png" % (name, action.name, frame)), 340)

    # 缩略图放最后：此时动作确实驱动着骨架（先渲染会拍到静止姿势）。
    if actions and armature:
        assign_action(armature, actions[0])
    bpy.context.scene.frame_set(1)
    render(os.path.join(THUMB_DIR, name + ".png"), THUMB_SIZE)
    print("[check]   渲染完成 → %s / thumbnails/%s.png" % (CHECK_DIR, name))


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    os.makedirs(THUMB_DIR, exist_ok=True)
    targets = [os.path.join(CHAR_DIR, "%s.glb" % i) for i in argv] or \
        sorted(glob.glob(os.path.join(CHAR_DIR, "ruler_*.glb")))
    for glb in targets:
        if not os.path.exists(glb):
            raise SystemExit("找不到 %s" % glb)
        check_glb(glb)
    bpy.ops.wm.quit_blender()


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001
        import traceback
        traceback.print_exc()
        bpy.ops.wm.quit_blender()
        raise SystemExit(1) from None
