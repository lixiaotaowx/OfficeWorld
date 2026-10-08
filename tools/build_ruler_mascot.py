"""把用户的「跑步循环.blend」（黄色尺子人吉祥物）加工成 OfficeWeb 可用的角色。

全程只读原始文件：在内存里只留角色本体、把 NLA 上看到的走跑循环烘焙成普通
FK 动作、压掉 4096 贴图、减面，然后另存加工过的 .blend 到
AssetSources/Characters/RulerMascot/，并按配色导出 GLB 到
OfficeWeb/public/assets/characters/。

用法（Blender 无头，本机 5.1）：
  blender -b -P tools/build_ruler_mascot.py -- [--src <blend>] [--no-anim] [--no-variants]

原始文件永不被写回；所有产物都在项目内。
"""
import argparse
import os
import sys

import bpy
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = r"C:\Users\Administrator\Downloads\跑步循环.blend"
SRC_DIR = os.path.join(ROOT, "AssetSources", "Characters", "RulerMascot")
WEB_BLEND = os.path.join(SRC_DIR, "ruler_mascot_web.blend")
# 注意：不要写进 OfficeWeb/public/assets/characters/。那边的
# test/dock-rules.test.mjs 断言该目录**正好 21 个 GLB**，且每个都要在
# src/characters.ts 里登记；接线（搬运 + 登记 + 缩略图）属于网页那块的工作。
GLB_DIR = os.path.join(SRC_DIR, "glb")

KEEP_PREFIX = ("RULER", "球体")
ARMATURE = "骨架.001"
BODY = "RULER.001"
BODY_MATERIAL = "材质.017"

FRAME_START, FRAME_END = 1, 17
TARGET_TRIS = 12000
OTHER_TRIS = 600
BASE_TEX = 512

# (id, 色相偏移角度, 中文说明)。0° 就是原稿那把黄尺子。
COLORS = [
    ("yellow", 0.0, "原稿黄（计划里的母亲）"),
    ("orange", -22.0, "橙"),
    ("green", 95.0, "绿"),
    ("blue", 190.0, "蓝"),
    ("purple", 235.0, "紫"),
    ("red", -48.0, "红"),
]


def log(*parts):
    print("[ruler]", *parts, flush=True)


def fcurves_of(action):
    """动作的通道：兼容 4.4+ 的 slot/layer 结构。"""
    out = []
    try:
        for layer in action.layers:
            for strip in layer.strips:
                for bag in getattr(strip, "channelbags", []):
                    out.extend(bag.fcurves)
    except Exception:  # noqa: BLE001
        pass
    if not out:
        try:
            out = list(action.fcurves)
        except Exception:  # noqa: BLE001
            out = []
    return out


def purge_orphans():
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures,
                 bpy.data.images, bpy.data.actions, bpy.data.cameras,
                 bpy.data.lights, bpy.data.worlds):
        for item in list(coll):
            if item.users == 0 and not getattr(item, "use_fake_user", False):
                coll.remove(item)


def clean_scene():
    """场景里 22 个物体只有 9 个属于角色，其余是参考物与骨骼控制器。"""
    keep = {o.name for o in bpy.data.objects
            if o.type == "ARMATURE" or o.name.startswith(KEEP_PREFIX)}
    for obj in list(bpy.data.objects):
        if obj.name not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)
    purge_orphans()
    log("保留对象:", sorted(o.name for o in bpy.data.objects))


def bake_walk(arm):
    """NLA 上摆着 Anim_Layer / Subtract_Layer，直接读动作并不等于所见画面；
    用 visual keying 把「看起来的走跑循环」烘成一条普通 FK 动作，导出的 GLB
    就不再依赖约束。"""
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = FRAME_START, FRAME_END
    scene.render.fps = 24
    for obj in bpy.data.objects:
        if obj.animation_data:
            obj.animation_data.use_nla = True
    for obj in bpy.data.objects:
        obj.select_set(False)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.nla.bake(
        frame_start=FRAME_START,
        frame_end=FRAME_END,
        step=1,
        only_selected=True,
        visual_keying=True,
        clear_constraints=False,
        clear_parents=False,
        use_current_action=False,
        bake_types={"POSE"},
    )
    bpy.ops.object.mode_set(mode="OBJECT")
    baked = arm.animation_data.action
    baked.name = "Walk"
    baked.use_fake_user = True
    if hasattr(baked, "use_frame_range"):
        baked.use_frame_range = True
        baked.frame_start, baked.frame_end = FRAME_START, FRAME_END
    log("烘焙出 Walk：%d 条通道 / %d 帧" % (len(fcurves_of(baked)), FRAME_END - FRAME_START + 1))
    return baked


def drop_other_actions(keep_names, arm):
    """删掉原稿里的杂动作（Action / Anim_Layer.002 / 球体*Action）与 NLA。

    眼睛那几个网格原本挂着单帧动作，删动作前先把当前帧的物体变换固化下来，
    否则眼睛会跳回未动画的位置。
    """
    for obj in bpy.data.objects:
        if obj is arm or not obj.animation_data:
            continue
        loc, quat, scale = obj.matrix_basis.decompose()
        obj.location, obj.scale = loc, scale
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = quat
    for action in list(bpy.data.actions):
        if action.name not in keep_names:
            bpy.data.actions.remove(action)
    for obj in bpy.data.objects:
        if not obj.animation_data:
            continue
        obj.animation_data.use_nla = False
        for track in list(obj.animation_data.nla_tracks):
            obj.animation_data.nla_tracks.remove(track)
    purge_orphans()
    log("剩余动作:", sorted(a.name for a in bpy.data.actions))


def base_color_node():
    material = bpy.data.materials.get(BODY_MATERIAL)
    if material is None or not material.use_nodes:
        return None
    for node in material.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image and "BaseColor" in node.image.name:
            return node
    return None


def slim_textures():
    """角色只靠一张 4096² BaseColor 上色；Normal/Roughness 对这种平面风格没必要。"""
    material = bpy.data.materials.get(BODY_MATERIAL)
    if material is not None and material.use_nodes:
        for node in list(material.node_tree.nodes):
            if node.type == "TEX_IMAGE" and not (
                node.image and "BaseColor" in node.image.name
            ):
                material.node_tree.nodes.remove(node)
    keep = base_color_node()
    if keep is None:
        log("警告：没找到 BaseColor 贴图")
        return
    keep_image = keep.image
    for image in list(bpy.data.images):
        if image is not keep_image:
            bpy.data.images.remove(image)
    keep_image.scale(BASE_TEX, BASE_TEX)
    try:
        keep_image.pack()
    except Exception as exc:  # noqa: BLE001
        log("重新打包失败，改为落盘再打包:", repr(exc))
        path = os.path.join(SRC_DIR, "ruler_basecolor_%d.png" % BASE_TEX)
        keep_image.filepath_raw = path
        keep_image.file_format = "PNG"
        keep_image.save()
        keep_image.source = "FILE"
        keep_image.pack()
    log("贴图压到 %dx%d（%s）" % (BASE_TEX, BASE_TEX, keep_image.name))


def drop_vertex_colors():
    """原稿的网格带着 COLOR_0/COLOR_1 两组顶点色。glTF 会把顶点色**再乘一次**
    到贴图上，网页里颜色会和 Blender 里看到的不一样，还白占几百 KB。颜色本来
    就全在贴图里，直接删。"""
    removed = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        for attr in list(obj.data.color_attributes):
            obj.data.color_attributes.remove(attr)
            removed += 1
    if removed:
        log("删掉 %d 组顶点色" % removed)


def tri_count(mesh):
    return sum(max(0, len(p.vertices) - 2) for p in mesh.polygons)


def decimate_object(obj, target_tris):
    mesh = obj.data
    before = tri_count(mesh)
    if before <= target_tris:
        return before, before
    if mesh.shape_keys:
        # 原稿里那两组形态键（基型/键 1）没有任何动作或驱动器在用，减面前清掉。
        obj.shape_key_clear()
    mod = obj.modifiers.new("Decimate", "DECIMATE")
    mod.decimate_type = "COLLAPSE"
    mod.ratio = target_tris / float(before)
    mod.use_collapse_triangulate = True
    obj.modifiers.move(len(obj.modifiers) - 1, 0)
    with bpy.context.temp_override(object=obj, active_object=obj,
                                   selected_objects=[obj],
                                   selected_editable_objects=[obj]):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return before, tri_count(obj.data)


def decimate_all(body_target=TARGET_TRIS, other_target=OTHER_TRIS):
    """身体 98,944 面；8 个眼球/眼皮网格更夸张，比身体还多，一起压。"""
    total_before = total_after = 0
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        target = body_target if obj.name == BODY else other_target
        before, after = decimate_object(obj, target)
        total_before += before
        total_after += after
        if before != after:
            log("  %-10s %6d → %6d 三角面" % (obj.name, before, after))
    log("减面合计 %d → %d 三角面" % (total_before, total_after))
    return total_after


def select_character():
    for obj in bpy.data.objects:
        obj.select_set(obj.name.startswith(KEEP_PREFIX) or obj.type == "ARMATURE")
    bpy.context.view_layer.objects.active = bpy.data.objects[ARMATURE]


def export_glb(path):
    wanted = dict(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_force_sampling=True,
        export_frame_range=False,
        export_skins=True,
        export_morph=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_vertex_color="NONE",
        export_colors=False,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
    )
    available = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    kwargs = {k: v for k, v in wanted.items() if k in available}
    dropped = sorted(set(wanted) - set(kwargs))
    if dropped:
        log("该版本导出器不接受这些参数，已跳过:", dropped)
    bpy.ops.export_scene.gltf(**kwargs)


def hue_rotate(source, degrees, target):
    """在 sRGB 空间转色相：黑刻度 s=0 不受影响，正好只换尺子本身的颜色。"""
    count = source.size[0] * source.size[1]
    buf = np.empty(count * 4, dtype=np.float32)
    source.pixels.foreach_get(buf)
    rgba = buf.reshape(-1, 4)
    lin = np.clip(rgba[:, :3], 0.0, 1.0)
    srgb = np.where(lin <= 0.0031308, lin * 12.92,
                    1.055 * np.power(np.clip(lin, 1e-8, None), 1 / 2.4) - 0.055)
    r, g, b = srgb[:, 0], srgb[:, 1], srgb[:, 2]
    mx, mn = srgb.max(axis=1), srgb.min(axis=1)
    diff = mx - mn
    colored = diff > 1e-6
    safe = np.where(colored, diff, 1.0)
    hue = np.zeros(count, dtype=np.float32)
    sel = colored & (mx == r)
    hue[sel] = ((g[sel] - b[sel]) / safe[sel]) % 6.0
    sel = colored & (mx == g) & (mx != r)
    hue[sel] = (b[sel] - r[sel]) / safe[sel] + 2.0
    sel = colored & (mx == b) & (mx != r) & (mx != g)
    hue[sel] = (r[sel] - g[sel]) / safe[sel] + 4.0
    hue = (hue / 6.0 + degrees / 360.0) % 1.0
    sat = np.where(mx > 1e-6, diff / np.where(mx > 1e-6, mx, 1.0), 0.0)
    val = mx
    sector = np.floor(hue * 6.0)
    frac = hue * 6.0 - sector
    p = val * (1.0 - sat)
    q = val * (1.0 - frac * sat)
    t = val * (1.0 - (1.0 - frac) * sat)
    out = np.empty_like(srgb)
    for index, (cr, cg, cb) in enumerate(((val, t, p), (q, val, p), (p, val, t),
                                          (p, q, val), (t, p, val), (val, p, q))):
        mask = (sector.astype(np.int32) % 6) == index
        out[mask, 0], out[mask, 1], out[mask, 2] = cr[mask], cg[mask], cb[mask]
    out_lin = np.where(out <= 0.04045, out / 12.92,
                       np.power(np.clip((out + 0.055) / 1.055, 1e-8, None), 2.4))
    rgba[:, :3] = out_lin
    target.pixels.foreach_set(rgba.reshape(-1))
    target.update()


def export_variants(source_image, colors):
    node = base_color_node()
    written = []
    for name, degrees, _note in colors:
        path = os.path.join(GLB_DIR, "ruler_%s.glb" % name)
        if degrees == 0.0:
            node.image = source_image
        else:
            copy = source_image.copy()
            copy.name = "ruler_basecolor_%s" % name
            hue_rotate(source_image, degrees, copy)
            node.image = copy
        select_character()
        export_glb(path)
        size = os.path.getsize(path)
        log("导出 ruler_%s.glb  %.2f MB" % (name, size / 1048576.0))
        written.append((name, path, size))
        if degrees != 0.0:
            bpy.data.images.remove(node.image)
    node.image = source_image
    return written


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", default=DEFAULT_SRC)
    parser.add_argument("--no-anim", action="store_true")
    parser.add_argument("--no-variants", action="store_true")
    args = parser.parse_args(argv)

    os.makedirs(SRC_DIR, exist_ok=True)
    os.makedirs(GLB_DIR, exist_ok=True)
    if not os.path.exists(args.src):
        raise SystemExit("找不到原始 blend：%s" % args.src)

    log("打开（只读）", args.src)
    bpy.ops.wm.open_mainfile(filepath=args.src)
    clean_scene()
    arm = bpy.data.objects[ARMATURE]
    walk = bake_walk(arm)
    drop_other_actions({"Walk"}, arm)
    authored = []
    if not args.no_anim:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import ruler_mascot_actions
        authored = ruler_mascot_actions.author(arm, walk, fcurves_of, log)
        log("新动作:", [a.name for a in authored])
    slim_textures()
    drop_vertex_colors()
    decimate_all()
    bpy.context.scene.frame_set(FRAME_START)

    log("另存加工过的源文件", WEB_BLEND)
    # 不留 .blend1 备份（项目里的产物只应该有加工后的那一份）。
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=WEB_BLEND, compress=True)
    source_image = base_color_node().image
    colors = COLORS if not args.no_variants else COLORS[:1]
    written = export_variants(source_image, colors)
    log("完成，共 %d 个 GLB" % len(written))
    for name, path, size in written:
        log("  ", name, "%.2f MB" % (size / 1048576.0), path)


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001
        import traceback
        traceback.print_exc()
        bpy.ops.wm.quit_blender()
        raise SystemExit(1) from None
    bpy.ops.wm.quit_blender()
