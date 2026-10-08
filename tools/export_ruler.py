# -*- coding: utf-8 -*-
"""把 尺子角色 导出成网页可用的 GLB。

阶段一（本脚本当前）：身体 + 4 块眼睛 + 眼镜 + 9 个动作，贴图中性化便于调色。
用法（无头）：
  blender -b --factory-startup <blend> -noaudio -P export_ruler.py -- out.glb base
参数：out.glb  [base|full]
不保存源 .blend。
"""
import bpy, sys, os, json, time

t0 = time.time()
def log(*a):
    print("[x %5.1fs]" % (time.time() - t0), *a, flush=True)

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
out_glb = argv[0] if argv else r"G:\C\wendang\ChatGPT\youxi\Build\ruler\out\ruler-base.glb"
mode = argv[1] if len(argv) > 1 else "base"
# 第三个参数可以覆盖中性化的目标亮度（`none` = 不做中性化，贴图保持原色）。
neutral_arg = argv[2] if len(argv) > 2 else os.environ.get("RULER_NEUTRAL", "0.85")
NEUTRAL = None if neutral_arg == "none" else float(neutral_arg)
JPEG_Q = int(os.environ.get("RULER_JPEG_Q", "85"))
MAX_TEX = int(os.environ.get("RULER_MAX_TEX", "1024"))
log("mode", mode, "out", out_glb, "neutral", NEUTRAL, "jpeg", JPEG_Q, "maxtex", MAX_TEX)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# ---------------------------------------------------------------- 1. 选物体
ARM = "Armature"
BODY = "RULER.001"
EYES = ["球体.004", "球体.005", "球体.006", "球体.007"]
GLASSES = "眼镜"
ACC_PREFIXES = ("胡子_", "头发_", "帽子_")
# **彻底不要这四个球**（用户 2026-09-28：「什么东西 退和身子时一体的 没有独立的腿的存在啊 删除干净」）。
#
# 量出来的事实：四个球在源 .blend 里**中心全部离板身 0.84–0.86m**，而且各自蒙到的骨头
# （`eye01s.r.pdown/pup.L/R`）**在骨架里根本不存在** —— 它们是别的模型遗留的垃圾几何，
# 导出后就是"两片/四片东西浮在人旁边跟着走"。**板子上已经画好了眼睛**（贴图里的白眼珠+黑瞳孔），
# 所以删掉这四个球，脸上的眼睛一点不少（对照渲染 `Build/ruler/noeyes-look.png` 可证）。
DEBRIS = "立方体002_3"

keep = [ARM, BODY, GLASSES]
if mode == "full":
    keep += [o.name for o in bpy.data.objects
             if o.type == 'MESH' and o.name.startswith(ACC_PREFIXES)]
for o in list(bpy.data.objects):
    if o.name in keep:
        continue
    if o.name in EYES:
        continue
    bpy.data.objects.remove(o, do_unlink=True)
log("kept", [o.name for o in bpy.data.objects])

# ---------------------------------------------------------------- 2. 丢掉垃圾眼球几何
arm = bpy.data.objects[ARM]
body = bpy.data.objects[BODY]

if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
for o in bpy.data.objects:
    o.hide_set(False)
    o.hide_viewport = False

# 直接删掉，不并进身体（见 EYES/DEBRIS 处的说明：它们在板外 0.85m，且绑的骨头不存在）。
for name in EYES:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)
        log("dropped stray eye geometry:", name)
log("body after dropping stray geometry:", len(body.data.vertices), "verts",
    [m.name if m else None for m in body.data.materials])

# 2b 已合并进第 2 步：垃圾几何整个对象删掉，不再做"按距离挑面"的补丁式清理。

# ---------------------------------------------------------------- 3. 骨架化：所有可见网格挂到 Armature
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
for o in meshes:
    if o.parent is not arm:
        o.parent = arm
        o.matrix_parent_inverse = arm.matrix_world.inverted()
    if not any(m.type == 'ARMATURE' for m in o.modifiers):
        md = o.modifiers.new("骨架", 'ARMATURE')
        md.object = arm
        md.use_vertex_groups = True
        md.use_bone_envelopes = False
    if not o.vertex_groups:
        vg = o.vertex_groups.new(name="mixamorig:Head")
        vg.add([v.index for v in o.data.vertices], 1.0, 'REPLACE')
    log("mesh", o.name, len(o.data.vertices), "v", [m.name for m in o.data.materials])

# ---------------------------------------------------------------- 4. 贴图处理
def process_images():
    import numpy as np
    for img in list(bpy.data.images):
        if img.size[0] == 0:
            continue
        name = img.name
        is_color = "BaseColor" in name
        # 4K -> MAX_TEX（低多边形角色够用，且大幅减小体积）
        w, h = img.size
        if max(w, h) > MAX_TEX:
            img.scale(MAX_TEX, MAX_TEX)
            log("scaled", name, (w, h), "->", img.size[:])
        if is_color and NEUTRAL is not None:
            px = np.empty(len(img.pixels), dtype=np.float32)
            img.pixels.foreach_get(px)
            rgba = px.reshape(-1, 4)
            lin = rgba[:, :3]
            gray = lin @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
            mean = float(gray.mean())
            target = NEUTRAL ** 2.2          # sRGB 目标 -> 线性
            factor = target / max(mean, 1e-5)
            rgba[:, 0] = np.clip(gray * factor, 0.0, 1.0)
            rgba[:, 1] = rgba[:, 0]
            rgba[:, 2] = rgba[:, 0]
            img.pixels.foreach_set(px)
            img.update()
            log("neutralised", name, "mean_lin=%.3f factor=%.3f" % (mean, factor))
        # JPEG 没有 alpha 通道，纯色贴图不需要 alpha
        try:
            img.file_format = 'JPEG'
        except Exception as e:
            log("file_format failed", name, e)
        try:
            img.pack()
        except Exception as e:
            log("pack failed", name, e)
        log("image ready", name, img.file_format, img.size[:])

process_images()

# ---------------------------------------------------------------- 5. 导出
os.makedirs(os.path.dirname(out_glb), exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
kwargs = dict(
    filepath=out_glb,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_animations=True,
    export_yup=True,
    export_image_format='JPEG',   # 强制 JPEG：PNG 时三张图占 1.7MB
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
try:
    bpy.ops.export_scene.gltf(**kwargs)
except TypeError as e:
    log("retry without some kwargs:", e)
    bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB',
                              export_apply=True, export_animations=True)
log("EXPORTED", out_glb, os.path.getsize(out_glb), "bytes")

# ---------------------------------------------------------------- 6. 自检
acts = sorted(a.name for a in bpy.data.actions)
log("actions in file:", acts)
log("bones:", len(arm.data.bones))
