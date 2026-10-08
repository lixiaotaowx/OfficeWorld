// Procedural sitting library for the Quaternius avatars. The bundled packs ship
// only Walk / Idle / combat clips (no "Sit"), so seated actions are authored
// here as bone poses: a small set of selectable seated poses plus the standing
// pose they transition from. Limbs are aimed with two-bone IK-style rotations
// and the torso/head are pitched, so the same code drives the local avatar and
// every remote player identically.
import * as THREE from "three";
import { findBone } from "./characterModel";

export type SitPoseId =
  | "standard"
  | "relax"
  | "forward"
  | "recline"
  | "crossLegs"
  | "wave";

export type V3 = [number, number, number];

export interface SitPose {
  id: SitPoseId;
  label: string;
  thighL: V3;
  thighR: V3;
  shinL: V3;
  shinR: V3;
  upperArmL: V3;
  upperArmR: V3;
  forearmL: V3;
  forearmR: V3;
  /** Torso pitch in radians; positive leans toward the desk (forward). */
  spineLean: number;
  /** Head pitch in radians; positive looks down at the desk. */
  headTilt: number;
  /** Extra vertical hip drop in metres below the standard seat height. */
  hipDrop: number;
}

/** Left side is +X, right side is -X, matching the bone layout. */
function mirror(v: V3): V3 {
  return [-v[0], v[1], v[2]];
}

interface Sym {
  id: SitPoseId;
  label: string;
  thigh: V3;
  shin: V3;
  upperArm: V3;
  forearm: V3;
  spineLean?: number;
  headTilt?: number;
  hipDrop?: number;
  thighR?: V3;
  shinR?: V3;
  upperArmR?: V3;
  forearmR?: V3;
  upperArmL?: V3;
  forearmL?: V3;
}

function sym(o: Sym): SitPose {
  return {
    id: o.id,
    label: o.label,
    thighL: o.thigh,
    thighR: o.thighR ?? mirror(o.thigh),
    shinL: o.shin,
    shinR: o.shinR ?? mirror(o.shin),
    upperArmL: o.upperArmL ?? o.upperArm,
    upperArmR: o.upperArmR ?? mirror(o.upperArm),
    forearmL: o.forearmL ?? o.forearm,
    forearmR: o.forearmR ?? mirror(o.forearm),
    spineLean: o.spineLean ?? 0,
    headTilt: o.headTilt ?? 0,
    hipDrop: o.hipDrop ?? 0,
  };
}

/** The neutral standing pose sits sit-down transitions start from. */
export const STANDING_POSE: SitPose = sym({
  id: "standard",
  label: "站立",
  thigh: [0, -1, 0],
  shin: [0, -1, 0],
  upperArm: [0.16, -1, 0],
  forearm: [0, -1, 0],
});

export const SIT_POSES: Record<SitPoseId, SitPose> = {
  standard: sym({
    id: "standard",
    label: "标准坐姿",
    spineLean: 0.10,
    thigh: [0, -0.08, 1],
    shin: [0, -1, 0.08],
    upperArm: [0.13, -1, 0.12],
    forearm: [0, -0.1, 1],
  }),
  relax: sym({
    id: "relax",
    label: "放松后靠",
    thigh: [0.06, -0.06, 0.85],
    shin: [0, -1, 0.3],
    upperArm: [0.16, -0.85, -0.08],
    forearm: [0.02, -0.45, 0.4],
    spineLean: -0.14,
    headTilt: -0.06,
  }),
  forward: sym({
    id: "forward",
    label: "前倾打字",
    thigh: [0, -0.1, 0.95],
    shin: [0, -1, -0.15],
    upperArm: [0.18, -0.5, 0.3],
    forearm: [0, -0.05, 1],
    spineLean: 0.16,
    headTilt: 0.05,
  }),
  recline: sym({
    id: "recline",
    label: "仰靠小憩",
    thigh: [0.05, -0.05, 0.8],
    shin: [0, -1, 0.35],
    upperArm: [0.3, 0.15, -0.25],
    forearm: [0.05, 0.45, -0.6],
    spineLean: -0.2,
    headTilt: -0.12,
    hipDrop: -0.02,
  }),
  crossLegs: sym({
    id: "crossLegs",
    label: "翘二郎腿",
    thigh: [0.06, -0.06, 0.9],
    shin: [0, -1, 0.15],
    upperArm: [0.15, -0.7, 0.05],
    forearm: [0, -0.35, 0.4],
    // Right ankle rests on the left knee: knee out to the right, shin across.
    thighR: [-0.38, -0.12, 0.6],
    shinR: [0.32, -0.08, 0.15],
  }),
  wave: sym({
    id: "wave",
    label: "坐着挥手",
    thigh: [0, -0.08, 1],
    shin: [0, -1, 0.08],
    upperArm: [0.13, -1, 0.12],
    forearm: [0, -0.1, 1],
    upperArmR: [-0.25, 0.55, 0.15],
    forearmR: [-0.28, 0.85, 0.05],
    headTilt: 0.04,
  }),
};

export const SIT_POSE_LIST: SitPose[] = Object.values(SIT_POSES);

/** Linear blend of every scalar and vector field between two poses. */
export function blendPoses(a: SitPose, b: SitPose, t: number): SitPose {
  const v = (x: V3, y: V3): V3 => [
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t,
  ];
  return {
    id: b.id,
    label: b.label,
    thighL: v(a.thighL, b.thighL),
    thighR: v(a.thighR, b.thighR),
    shinL: v(a.shinL, b.shinL),
    shinR: v(a.shinR, b.shinR),
    upperArmL: v(a.upperArmL, b.upperArmL),
    upperArmR: v(a.upperArmR, b.upperArmR),
    forearmL: v(a.forearmL, b.forearmL),
    forearmR: v(a.forearmR, b.forearmR),
    spineLean: a.spineLean + (b.spineLean - a.spineLean) * t,
    headTilt: a.headTilt + (b.headTilt - a.headTilt) * t,
    hipDrop: a.hipDrop + (b.hipDrop - a.hipDrop) * t,
  };
}

/** Restore every bone to the bind pose captured at load time. */
export function resetToRest(
  bones: Map<string, THREE.Bone>,
  rest: Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>,
) {
  for (const [name, bone] of bones) {
    const r = rest.get(name);
    if (!r) continue;
    bone.quaternion.copy(r.quaternion);
    bone.position.copy(r.position);
  }
}

/** Rotate `name` so its child bone points towards `desired` (root-local). */
function aimBone(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  name: string,
  childName: string,
  desired: V3,
) {
  // GLTFLoader sanitizes Blender names: "UpperLeg.L" becomes "UpperLegL".
  // findBone 还负责在尺子角色的 Mixamo 命名（mixamorig:LeftUpLeg）里找到同一根骨头。
  const bone = findBone(bones, name),
    child = findBone(bones, childName);
  if (!bone || !child || !bone.parent) return;
  root.updateMatrixWorld(true);
  // Feet in this pack are independent rig controls, not shin children.
  const from = child.parent === bone
    ? child.getWorldPosition(new THREE.Vector3())
      .sub(bone.getWorldPosition(new THREE.Vector3())).normalize()
    : new THREE.Vector3(0, 1, 0)
      .applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));
  const to = new THREE.Vector3(...desired)
    .applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()))
    .normalize();
  const delta = new THREE.Quaternion().setFromUnitVectors(from, to);
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  bone.quaternion.copy(
    bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world),
  );
}

/** Pitch a bone around the character's own left-right axis. */
function pitchBone(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  name: string,
  angle: number,
) {
  const bone = findBone(bones, name);
  if (!bone || !bone.parent || Math.abs(angle) < 1e-4) return;
  root.updateMatrixWorld(true);
  const axis = new THREE.Vector3(1, 0, 0)
    .applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const delta = new THREE.Quaternion().setFromAxisAngle(axis, angle);
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  bone.quaternion.copy(
    bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world),
  );
}

/**
 * Apply a seated (or blended standing) pose. The caller resets the model to the
 * bind pose first via `resetToRest`, then this aims the limbs and pitches the
 * torso/head. Hip height is adjusted by the caller so sit/stand can tween it.
 */
export function applySitPose(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  rest: Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>,
  pose: SitPose,
  time = 0,
) {
  resetToRest(bones, rest);
  root.updateMatrixWorld(true);
  const feet = ["L", "R"].map((side) => {
    const foot = findBone(bones, `Foot${side}`);
    const shin = findBone(bones, `LowerLeg${side}`);
    if (!foot || !shin) return null;
    return {
      foot, shin, side,
      rotation: foot.getWorldQuaternion(new THREE.Quaternion()),
      length: foot.getWorldPosition(new THREE.Vector3())
        .distanceTo(shin.getWorldPosition(new THREE.Vector3())),
    };
  });
  // A gentle breathing sway keeps the seated figure from looking frozen.
  const breath = Math.sin(time * 1.6) * 0.025;
  // Establish the torso before aiming arms; otherwise leaning rotates the
  // already-positioned hands away from their intended targets.
  pitchBone(root, bones, "Abdomen", (pose.spineLean + breath) * 0.6);
  pitchBone(root, bones, "Chest", pose.spineLean + breath);
  aimBone(root, bones, "UpperLeg.L", "LowerLeg.L", pose.thighL);
  aimBone(root, bones, "UpperLeg.R", "LowerLeg.R", pose.thighR);
  aimBone(root, bones, "LowerLeg.L", "Foot.L", pose.shinL);
  aimBone(root, bones, "LowerLeg.R", "Foot.R", pose.shinR);
  root.updateMatrixWorld(true);
  for (const item of feet) {
    if (!item?.foot.parent) continue;
    const direction = new THREE.Vector3(...(item.side === "L" ? pose.shinL : pose.shinR))
      .normalize().applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
    const target = item.shin.getWorldPosition(new THREE.Vector3())
      .addScaledVector(direction, item.length);
    item.foot.position.copy(item.foot.parent.worldToLocal(target));
    item.foot.quaternion.copy(item.foot.parent
      .getWorldQuaternion(new THREE.Quaternion()).invert().multiply(item.rotation));
  }
  aimBone(root, bones, "UpperArm.L", "LowerArm.L", pose.upperArmL);
  aimBone(root, bones, "UpperArm.R", "LowerArm.R", pose.upperArmR);
  aimBone(root, bones, "LowerArm.L", "Wrist.L", pose.forearmL);
  aimBone(root, bones, "LowerArm.R", "Wrist.R", pose.forearmR);
  pitchBone(root, bones, "Head", pose.headTilt + Math.sin(time * 1.6 + 0.5) * 0.015);
}
