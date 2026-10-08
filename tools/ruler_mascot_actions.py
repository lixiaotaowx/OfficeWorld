"""给尺子人补两条动作：Idle（待机）与 Wave（招手）。

不猜骨骼的旋转轴：姿势基底取 walk 一个循环的逐通道平均值（跑动一圈的中立
姿势），再把双手用 IK 目标位移**求解**到身侧自然下垂；动作本身同样用世界
空间的位移求解实现，因此完全不依赖 Auto-Rig Pro 的骨骼朝向/roll。导出的
动画由 glTF 采样最终姿势，约束也一并被烘进去。

被 tools/build_ruler_mascot.py 导入调用：author(arm, walk, fcurves_of, log)。
"""
import math
import re

import bpy
from mathutils import Matrix, Vector

IDLE_FRAMES = 96          # 4 秒 @24fps
WAVE_FRAMES = 48          # 2 秒
KEY_STEP = 4
BOB_UNITS = 0.35          # 上下起伏（世界单位；角色高约 9.5）
SWAY_UNITS = 0.16         # 左右重心微移
HAND_DRIFT = 0.18
WAVE_AMP = 1.2            # 招手左右幅度
WAVE_CYCLES = 3
CHANNEL_SIZE = {"location": 3, "rotation_quaternion": 4, "scale": 3}
CHANNEL_DEFAULT = {"location": 0.0, "rotation_quaternion": 0.0, "scale": 1.0}
QUAT_W = 1.0
UP = Vector((0.0, 0.0, 1.0))


def channel_map(action, fcurves_of):
    out = {}
    for fcurve in fcurves_of(action):
        match = re.match(r'pose\.bones\["(.+)"\]\.(\w+)$', fcurve.data_path)
        if match:
            out.setdefault(match.group(1), {}).setdefault(
                match.group(2), {})[fcurve.array_index] = fcurve
    return out


def average_pose(arm, action, fcurves_of, frames):
    """逐通道平均 = 一个循环的中立姿势（跑动时四肢摆动的中点）。"""
    pose = {}
    for bone_name, props in channel_map(action, fcurves_of).items():
        if arm.pose.bones.get(bone_name) is None:
            continue
        entry = {}
        for prop, comps in props.items():
            size = CHANNEL_SIZE[prop]
            samples = []
            for frame in frames:
                row = []
                for index in range(size):
                    if index in comps:
                        row.append(comps[index].evaluate(frame))
                    elif prop == "rotation_quaternion" and index == 0:
                        row.append(QUAT_W)
                    else:
                        row.append(CHANNEL_DEFAULT[prop])
                samples.append(row)
            if prop == "rotation_quaternion":
                reference = samples[0]
                for row in samples[1:]:
                    if sum(a * b for a, b in zip(row, reference)) < 0:
                        for index in range(4):
                            row[index] = -row[index]
            entry[prop] = [sum(row[i] for row in samples) / len(samples)
                           for i in range(size)]
        pose[bone_name] = entry
    return pose


def apply_pose(arm, pose):
    for pose_bone in arm.pose.bones:
        pose_bone.rotation_mode = "QUATERNION"
        pose_bone.location = (0.0, 0.0, 0.0)
        pose_bone.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)
        pose_bone.scale = (1.0, 1.0, 1.0)
    for name, props in pose.items():
        pose_bone = arm.pose.bones.get(name)
        if pose_bone is None:
            continue
        for prop, values in props.items():
            setattr(pose_bone, prop, values)
    bpy.context.view_layer.update()


def bone_world(arm, name):
    """求值后的世界坐标（姿势骨骼的 matrix 必须从 depsgraph 上取才是最新的）。"""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    pose_bone = arm.evaluated_get(depsgraph).pose.bones.get(name)
    if pose_bone is None:
        return Vector((0.0, 0.0, 0.0))
    return arm.matrix_world @ pose_bone.matrix.translation


def jacobian(arm, bone_name, probe_name, step=0.4):
    """世界位移 / 该骨骼 location 三分量 的 3x3 雅可比（已求逆）。

    有了它就能把"手要往世界上方挪 3 个单位"翻译成这个骨骼三个 location 分量
    该加多少，不需要知道骨骼的局部轴朝向。
    """
    pose_bone = arm.pose.bones[bone_name]
    base = pose_bone.location.copy()
    origin = bone_world(arm, probe_name)
    columns = []
    for index in range(3):
        pose_bone.location = base.copy()
        pose_bone.location[index] += step
        bpy.context.view_layer.update()
        columns.append((bone_world(arm, probe_name) - origin) / step)
    pose_bone.location = base.copy()
    bpy.context.view_layer.update()
    matrix = Matrix(((columns[0].x, columns[1].x, columns[2].x),
                     (columns[0].y, columns[1].y, columns[2].y),
                     (columns[0].z, columns[1].z, columns[2].z)))
    try:
        return matrix.inverted()
    except ValueError:
        return Matrix.Identity(3)


def solve_target(arm, bone_name, probe_name, world_point, base_location,
                 iterations=6, tolerance=0.02):
    """求出让 probe 骨骼到达 world_point 的 location；IK 不严格线性，迭代收敛。"""
    inverse = jacobian(arm, bone_name, probe_name)
    pose_bone = arm.pose.bones[bone_name]
    pose_bone.location = base_location.copy()
    bpy.context.view_layer.update()
    residual = 0.0
    for _ in range(iterations):
        residual = (Vector(world_point) - bone_world(arm, probe_name)).length
        if residual < tolerance:
            break
        pose_bone.location = pose_bone.location + (
            inverse @ (Vector(world_point) - bone_world(arm, probe_name)))
        bpy.context.view_layer.update()
    return pose_bone.location.copy(), residual, inverse


def base_location(pose, name):
    entry = pose.get(name, {}).get("location")
    return Vector(entry) if entry else Vector((0.0, 0.0, 0.0))


def hand_frame(arm):
    """肩宽方向（世界）、肩到手的大致长度、身体前后位置。"""
    shoulder_l = bone_world(arm, "shoulder.L")
    shoulder_r = bone_world(arm, "shoulder.R")
    right = Vector((shoulder_r.x - shoulder_l.x, 0.0, 0.0))
    right = right.normalized() if right.length > 1e-4 else Vector((1.0, 0.0, 0.0))
    reach = max((bone_world(arm, "palm.R") - shoulder_r).length, 1.0)
    return right, reach, (shoulder_l.y + shoulder_r.y) / 2.0, shoulder_l, shoulder_r


def relax_arms(arm, pose, log):
    """跑动的平均姿势里双臂是前后摆的，当待机会像抱着肚子；用 IK 目标把手
    挪到身侧自然下垂，得到一个像样的站立姿势。"""
    apply_pose(arm, pose)
    right, reach, body_y, shoulder_l, shoulder_r = hand_frame(arm)
    relaxed = dict(pose)
    for side, sign, shoulder in (("L", -1.0, shoulder_l), ("R", 1.0, shoulder_r)):
        name = "palm.tg.%s" % side
        if arm.pose.bones.get(name) is None:
            continue
        target = Vector((shoulder.x + right.x * sign * reach * 0.32,
                         body_y,
                         shoulder.z - reach * 0.78))
        location, residual, _inverse = solve_target(
            arm, name, "palm.%s" % side, target, base_location(pose, name))
        relaxed[name] = {"location": list(location)}
        log("  %s 垂手：剩余误差 %.2f（肩到手 %.2f）" % (side, residual, reach))
    return relaxed


def key_pose(arm, frame, bones):
    for name in bones:
        pose_bone = arm.pose.bones.get(name)
        if pose_bone is None:
            continue
        pose_bone.keyframe_insert(data_path="location", frame=frame)
        pose_bone.keyframe_insert(data_path="rotation_quaternion", frame=frame)
        pose_bone.keyframe_insert(data_path="scale", frame=frame)


def start_action(arm, frames):
    data = arm.animation_data or arm.animation_data_create()
    data.action = None
    bpy.context.view_layer.update()
    return data


def finish_action(arm, name, log, frames):
    action = arm.animation_data.action
    action.name = name
    action.use_fake_user = True
    if hasattr(action, "use_frame_range"):
        action.use_frame_range = True
        action.frame_start, action.frame_end = 1, frames
    log("  %s：%d 帧（%.2f 秒）" % (name, frames, (frames - 1) / 24.0))
    return action


def build_idle(arm, pose, bones, log):
    """待机：重心轻微起伏与左右微移 + 双手一点点漂移，首尾闭合可循环。"""
    apply_pose(arm, pose)
    up_inverse = jacobian(arm, "spine.k", "spine.k")
    right, _reach, _y, _sl, _sr = hand_frame(arm)
    hands = {}
    for side in ("L", "R"):
        name = "palm.tg.%s" % side
        if arm.pose.bones.get(name):
            hands[side] = (name, jacobian(arm, name, "palm.%s" % side),
                           base_location(pose, name))
    start_action(arm, IDLE_FRAMES)
    for frame in range(1, IDLE_FRAMES + 1, KEY_STEP):
        apply_pose(arm, pose)
        phase = 2.0 * math.pi * (frame - 1) / float(IDLE_FRAMES)
        breath = BOB_UNITS * math.sin(phase * 2.0)
        lean = SWAY_UNITS * math.sin(phase)
        arm.pose.bones["spine.k"].location = base_location(pose, "spine.k") + (
            up_inverse @ Vector((right.x * lean, right.y * lean, breath)))
        for index, (side, (name, inverse, base)) in enumerate(sorted(hands.items())):
            drift = right * (HAND_DRIFT * math.sin(phase * 2.0 + index * math.pi))
            arm.pose.bones[name].location = base + (inverse @ drift)
        key_pose(arm, frame, bones)
    apply_pose(arm, pose)
    for name, _inverse, base in hands.values():
        arm.pose.bones[name].location = base.copy()
    key_pose(arm, IDLE_FRAMES + 1, bones)
    return finish_action(arm, "Idle", log, IDLE_FRAMES + 1)


def build_wave(arm, pose, bones, log):
    """招手：把右手举到身体侧上方（这套模型手臂很短，只能举到身高中段），
    然后左右摆三下。"""
    apply_pose(arm, pose)
    right, reach, body_y, _shoulder_l, shoulder_r = hand_frame(arm)
    name = "palm.tg.R"
    base = base_location(pose, name)
    raised_point = Vector((shoulder_r.x + right.x * reach * 0.55,
                           body_y - 0.35,
                           shoulder_r.z + reach * 0.85))
    raised, residual, inverse = solve_target(
        arm, name, "palm.R", raised_point, base, iterations=8)
    log("  举手目标 (%.2f, %.2f, %.2f)，误差 %.2f，肩到手 %.2f"
        % (raised_point.x, raised_point.y, raised_point.z, residual, reach))

    start_action(arm, WAVE_FRAMES)
    for frame in range(1, WAVE_FRAMES + 1, 2):
        apply_pose(arm, pose)
        envelope = max(0.0, min(1.0, (frame - 1) / 8.0, (WAVE_FRAMES - frame) / 8.0))
        swing = WAVE_AMP * envelope * math.sin(
            2.0 * math.pi * WAVE_CYCLES * (frame - 1) / float(WAVE_FRAMES))
        arm.pose.bones[name].location = raised + (inverse @ (right * swing))
        key_pose(arm, frame, bones)
    apply_pose(arm, pose)
    arm.pose.bones[name].location = base.copy()
    key_pose(arm, WAVE_FRAMES + 1, bones)
    return finish_action(arm, "Wave", log, WAVE_FRAMES + 1)


def author(arm, walk, fcurves_of, log):
    pose = average_pose(arm, walk, fcurves_of, list(range(1, 17)))
    log("站立基底来自 walk 的逐通道平均：%d 根骨骼" % len(pose))
    # 关键：求解期间骨架上不能挂着动作，否则每次 view_layer.update() 都会把
    # 手动摆的姿势按当前帧覆盖回去，IK 求解就变成了追一个移动的目标。
    data = arm.animation_data or arm.animation_data_create()
    data.use_nla = False
    data.action = None
    bpy.context.view_layer.update()
    stand = relax_arms(arm, pose, log)
    bones = sorted(set(pose) | set(stand))
    actions = [build_idle(arm, stand, bones, log), build_wave(arm, stand, bones, log)]
    arm.animation_data.action = walk
    return actions
