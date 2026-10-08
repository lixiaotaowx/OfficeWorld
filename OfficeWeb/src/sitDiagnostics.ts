// 坐姿几何的诊断读数（`?debug=1` 的探针用）。
//
// 单独一个文件有两个原因：① `OfficeAvatar.ts` 已经贴着 500 行上限；
// ② 换角色骨架时最容易被搞坏的就是"坐到椅子上"这件事（实测踩过三次：骨骼名映射、
// `boneKey` 漏冒号、下沉量按旧角色调），所以把它做成一个能一眼看完的小模块。
import * as THREE from "three";
import type { OfficeAvatar, SitDiagnostics } from "./OfficeAvatar";

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
