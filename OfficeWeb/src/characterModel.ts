// Shared character loading and posing, used by both the locally controlled
// avatar (OfficeAvatar) and every remote player (RemoteAvatars), so a remote
// player looks exactly like they do on their own screen.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type CharacterKind = "woman" | "man";

export interface LoadedCharacter {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  bones: Map<string, THREE.Bone>;
}

/** Average adult height the models are normalised to. */
const TARGET_HEIGHT = 1.72;

/** Load a bundled CC0 avatar, scaled to a plausible adult and ready to animate. */
export async function loadCharacter(
  kind: CharacterKind,
): Promise<LoadedCharacter> {
  const gltf = await new GLTFLoader().loadAsync(`/assets/characters/${kind}.glb`);
  const model = gltf.scene;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const scale = TARGET_HEIGHT / (box.max.y - box.min.y);
  model.scale.multiplyScalar(scale);
  model.position.y = -box.min.y * scale;
  const bones = new Map<string, THREE.Bone>();
  model.traverse((object) => {
    if (object instanceof THREE.Bone) bones.set(object.name, object);
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  const mixer = new THREE.AnimationMixer(model);
  const idle = mixer.clipAction(
    gltf.animations.find((a) => a.name === "Idle_Neutral") ||
      gltf.animations.find((a) => a.name === "Idle")!,
  );
  const walk = mixer.clipAction(
    gltf.animations.find((a) => a.name === "Walk")!,
  );
  return { model, mixer, idle, walk, bones };
}

/** Point `name` at `desired` by rotating its child bone towards it. */
function aimBone(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  name: string,
  childName: string,
  desired: THREE.Vector3,
) {
  const bone = bones.get(name),
    child = bones.get(childName);
  if (!bone || !child || !bone.parent) return;
  root.updateMatrixWorld(true);
  const from = child
    .getWorldPosition(new THREE.Vector3())
    .sub(bone.getWorldPosition(new THREE.Vector3()))
    .normalize();
  const to = desired
    .clone()
    .applyQuaternion(root.quaternion)
    .normalize();
  const delta = new THREE.Quaternion().setFromUnitVectors(from, to);
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  bone.quaternion.copy(
    bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world),
  );
}

/**
 * Runtime seated pose. The bundled Quaternius packs ship only Walk and Idle, so
 * a seated figure is authored here rather than played from a clip. Reapplied
 * every frame because the idle clip keeps writing to the same bones.
 */
export function applySitPose(
  root: THREE.Object3D,
  model: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  seatHeight = 0.58,
) {
  for (const side of ["L", "R"]) {
    aimBone(root, bones, `UpperLeg.${side}`, `LowerLeg.${side}`, new THREE.Vector3(0, -0.08, 1));
    aimBone(root, bones, `LowerLeg.${side}`, `Foot.${side}`, new THREE.Vector3(0, -1, 0.08));
    aimBone(
      root,
      bones,
      `UpperArm.${side}`,
      `LowerArm.${side}`,
      new THREE.Vector3(side === "L" ? 0.13 : -0.13, -1, 0.12),
    );
    aimBone(root, bones, `LowerArm.${side}`, `Wrist.${side}`, new THREE.Vector3(0, -0.1, 1));
  }
  root.updateMatrixWorld(true);
  const hips = bones.get("Hips");
  if (hips)
    model.position.y +=
      seatHeight - hips.getWorldPosition(new THREE.Vector3()).y;
}

/** Release the GPU resources owned by a loaded character. */
export function releaseCharacter(character: LoadedCharacter) {
  character.mixer.stopAllAction();
  character.model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
