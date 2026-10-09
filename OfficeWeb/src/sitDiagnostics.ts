// 坐姿几何的诊断读数（`?debug=1` 的探针用）。
//
// 单独一个文件有两个原因：① `OfficeAvatar.ts` 已经贴着 500 行上限；
// ② 换角色骨架时最容易被搞坏的就是"坐到椅子上"这件事（实测踩过三次：骨骼名映射、
// `boneKey` 漏冒号、下沉量按旧角色调），所以把它做成一个能一眼看完的小模块。
import * as THREE from "three";
import type { OfficeAvatar, SitDiagnostics } from "./OfficeAvatar";
import type { LoadedCharacter } from "./characterModel";
import { applySitPose, SIT_POSES, type SitPoseId } from "./sitPoses";

/** 髋部骨头的候选名（Blender 里带冒号，运行时冒号被 GLTFLoader 去掉）。 */
const HIP_CANDIDATES = ["mixamorig:Hips", "mixamorigHips", "Hips"];

/** 摆好坐姿后，髋部在**世界坐标**里的高度。（root 与模型都在原点时量的才是纯几何值。） */
export function seatedHipHeight(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
): number {
  for (const name of HIP_CANDIDATES) {
    const bone = bones.get(name);
    if (bone) return bone.getWorldPosition(new THREE.Vector3()).y;
  }
  return 0;
}

/** 从本人（`window.__officeDebug.avatar`）取一份坐姿读数。 */
export function sitDiagnostics(avatar: OfficeAvatar | undefined | null): SitDiagnostics | null {
  return avatar?.sitDiagnostics() ?? null;
}

/**
 * 坐姿下"髋部相对模型原点"的高度**实测一次**（量完把 root/模型原样恢复）。
 *
 * 不能再靠 `seatHeight - restHipHeight` 这种差值：姿势会把腿折起来，髋部相对模型原点的位置
 * **随骨架而变**。旧角色（Quaternius）下那个差值刚好成立，换成尺子角色（Mixamo）后坐姿反而
 * 把整个人抬高了 0.58m（实测：站姿髋 0.601 → 坐姿 1.178）。所以：把坐姿摆到模型上量一次。
 *
 * 算法放这里是因为 `OfficeAvatar.ts` 贴着 500 行上限（2026-10-09 加掉落机制时挪出来）。
 */
export function measureSeatedOffset(input: {
  root: THREE.Object3D;
  bones: Map<string, THREE.Bone>;
  character: LoadedCharacter;
  pose: SitPoseId;
}): number | null {
  const model = input.character.model;
  const previousY = model.position.y;
  const previousRootY = input.root.position.y;
  try {
    // 先把 root 归零，量到的就是"相对模型原点"的纯几何偏移。
    input.root.position.y = 0;
    model.position.y = 0;
    applySitPose(input.root, input.bones, input.character.rest, SIT_POSES[input.pose], 0);
    input.root.updateMatrixWorld(true);
    const hips = HIP_CANDIDATES.map(name => input.bones.get(name)).find(Boolean);
    if (!hips) return null;
    return hips.getWorldPosition(new THREE.Vector3()).y;
  } catch {
    return null;
  } finally {
    model.position.y = previousY;
    input.root.position.y = previousRootY;
    input.root.updateMatrixWorld(true);
  }
}
