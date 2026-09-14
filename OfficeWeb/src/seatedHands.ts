import * as THREE from "three";
import type { LoadedCharacter } from "./characterModel";
import type { SitPoseId } from "./sitPoses";

/** Wrist targets match the authored keyboard: 0.52m ahead, top at 0.818m. */
export function placeSeatedHands(root: THREE.Object3D, character: LoadedCharacter, pose: SitPoseId) {
  if (pose !== "standard" && pose !== "forward") return;
  root.updateMatrixWorld(true);
  const rotation = root.getWorldQuaternion(new THREE.Quaternion());
  const origin = root.getWorldPosition(new THREE.Vector3());
  const rotate = (bone: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3) => {
    const delta = new THREE.Quaternion().setFromUnitVectors(from.normalize(), to.normalize());
    const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
    bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
    root.updateMatrixWorld(true);
  };
  for (const side of ["L", "R"]) {
    const upper = character.bones.get(`UpperArm${side}`);
    const lower = character.bones.get(`LowerArm${side}`);
    const wrist = character.bones.get(`Wrist${side}`);
    if (!upper?.parent || !lower?.parent || !wrist?.parent) continue;
    const shoulder = upper.getWorldPosition(new THREE.Vector3());
    const elbow = lower.getWorldPosition(new THREE.Vector3());
    const hand = wrist.getWorldPosition(new THREE.Vector3());
    const a = shoulder.distanceTo(elbow), b = elbow.distanceTo(hand);
    const sign = side === "L" ? 1 : -1;
    const target = new THREE.Vector3(sign * .095, 0, .435).applyQuaternion(rotation).add(origin);
    target.y = origin.y + .842;
    const axis = target.clone().sub(shoulder);
    const distance = Math.min(axis.length(), a + b - .001);
    axis.normalize(); target.copy(shoulder).addScaledVector(axis, distance);
    const along = (a*a - b*b + distance*distance) / (2*distance);
    const pole = new THREE.Vector3(sign * .4, -1, -.2).applyQuaternion(rotation);
    pole.addScaledVector(axis, -pole.dot(axis)).normalize();
    const desiredElbow = shoulder.clone().addScaledVector(axis, along)
      .addScaledVector(pole, Math.sqrt(Math.max(0, a*a-along*along)));
    rotate(upper, elbow.clone().sub(shoulder), desiredElbow.clone().sub(shoulder));
    rotate(lower, wrist.getWorldPosition(new THREE.Vector3()).sub(lower.getWorldPosition(new THREE.Vector3())), target.clone().sub(desiredElbow));
    const middle = character.bones.get(`Middle3${side}`);
    const index = character.bones.get(`Index3${side}`);
    const pinky = character.bones.get(`Pinky3${side}`);
    if (middle && index && pinky) {
      const forward = middle.getWorldPosition(new THREE.Vector3()).sub(wrist.getWorldPosition(new THREE.Vector3())).normalize();
      const across = index.getWorldPosition(new THREE.Vector3()).sub(pinky.getWorldPosition(new THREE.Vector3()));
      across.addScaledVector(forward, -across.dot(forward)).normalize();
      const desiredForward = new THREE.Vector3(0, -.10, 1).normalize().applyQuaternion(rotation);
      const desiredAcross = new THREE.Vector3(-sign, 0, 0).applyQuaternion(rotation);
      const basis = (x: THREE.Vector3, y: THREE.Vector3) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, x.clone().cross(y)));
      const delta = basis(desiredAcross, desiredForward).multiply(basis(across, forward).invert());
      const flat = wrist.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
      wrist.quaternion.copy(wrist.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(flat));
    }
    root.updateMatrixWorld(true);
  }
}
