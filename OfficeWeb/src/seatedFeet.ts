import * as THREE from "three";
import type { LoadedCharacter } from "./characterModel";
import type { SitPoseId } from "./sitPoses";

/** Two-bone solve: keep the pelvis on the chair and each supported foot down. */
export function groundSeatedFeet(
  root: THREE.Object3D,
  character: LoadedCharacter,
  pose: SitPoseId,
) {
  root.updateMatrixWorld(true);
  const worldRotation = root.getWorldQuaternion(new THREE.Quaternion());
  for (const side of ["L", "R"]) {
    if (pose === "crossLegs" && side === "R") continue;
    const thigh = character.bones.get(`UpperLeg${side}`);
    const shin = character.bones.get(`LowerLeg${side}`);
    const foot = character.bones.get(`Foot${side}`);
    const height = character.groundFootHeights.get(side);
    if (!thigh?.parent || !shin?.parent || !foot?.parent || height === undefined) continue;
    const hip = thigh.getWorldPosition(new THREE.Vector3());
    const knee = shin.getWorldPosition(new THREE.Vector3());
    const ankle = foot.getWorldPosition(new THREE.Vector3());
    const footRotation = foot.getWorldQuaternion(new THREE.Quaternion());
    const upperLength = hip.distanceTo(knee);
    const lowerLength = knee.distanceTo(ankle);
    const target = ankle.clone();
    target.y = root.getWorldPosition(new THREE.Vector3()).y + height;
    const axis = target.clone().sub(hip);
    const distance = axis.length();
    if (distance < 1e-5 || distance >= upperLength + lowerLength) continue;
    axis.normalize();
    const along = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(worldRotation);
    forward.addScaledVector(axis, -forward.dot(axis)).normalize();
    const desiredKnee = hip.clone().addScaledVector(axis, along)
      .addScaledVector(forward, Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2)));
    const rotate = (bone: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3) => {
      const delta = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize());
      const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
      bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
      root.updateMatrixWorld(true);
    };
    rotate(thigh, knee.clone().sub(hip), desiredKnee.clone().sub(hip));
    rotate(shin, new THREE.Vector3(0, 1, 0).applyQuaternion(shin.getWorldQuaternion(new THREE.Quaternion())), target.clone().sub(desiredKnee));
    foot.position.copy(foot.parent.worldToLocal(target));
    foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(footRotation));
    root.updateMatrixWorld(true);
  }
}
