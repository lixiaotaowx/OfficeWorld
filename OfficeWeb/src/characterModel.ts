// Shared character loading, used by both the locally controlled avatar
// (OfficeAvatar) and every remote player (RemoteAvatars), so a remote player
// looks exactly like they do on their own screen. Seated posing lives in
// sitPoses.ts.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { getCharacter, type CharacterId } from "./characters";
import { disposeResources } from './disposeResources';

export interface LoadedCharacter {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  bones: Map<string, THREE.Bone>;
  /** Bind-pose quaternion/position per bone, for resetting before a sit pose. */
  rest: Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>;
  /** World Y of the hips at rest, feet on the ground. */
  restHipHeight: number;
  /** `model.position.y` that places the feet on the ground. */
  groundY: number;
  groundFootHeights: Map<string, number>;
}

/** Average adult height the models are normalised to. */
const TARGET_HEIGHT = 1.72;

/** Load a bundled CC0 avatar, scaled to a plausible adult and ready to animate. */
export async function loadCharacter(
  id: CharacterId,
): Promise<LoadedCharacter> {
  const def = getCharacter(id);
  const gltf = await new GLTFLoader().loadAsync(def.glb);
  const model = gltf.scene;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const scale = TARGET_HEIGHT / (box.max.y - box.min.y);
  model.scale.multiplyScalar(scale);
  model.position.y = -box.min.y * scale;
  const groundY = model.position.y;
  const bones = new Map<string, THREE.Bone>();
  model.traverse((object) => {
    if (object instanceof THREE.Bone) bones.set(object.name, object);
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  // Snapshot the bind pose before any clip plays, so seated posing can reset
  // the skeleton to a known state regardless of what the mixer last wrote.
  model.updateMatrixWorld(true);
  const rest = new Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>();
  for (const [name, bone] of bones) {
    rest.set(name, {
      quaternion: bone.quaternion.clone(),
      position: bone.position.clone(),
    });
  }
  const hips = bones.get("Hips");
  const groundFootHeights = new Map<string, number>();
  for (const side of ["L", "R"]) {
    const foot = bones.get(`Foot${side}`);
    if (foot) groundFootHeights.set(side, foot.getWorldPosition(new THREE.Vector3()).y);
  }
  const restHipHeight = hips
    ? hips.getWorldPosition(new THREE.Vector3()).y
    : 0;
  const mixer = new THREE.AnimationMixer(model);
  const find = (...names: string[]) => {
    for (const name of names) {
      const clip = gltf.animations.find((a) => a.name === name);
      if (clip) return mixer.clipAction(clip);
    }
    return undefined;
  };
  const idle = find("Idle_Neutral", "Idle")!;
  const walk = find("Walk")!;
  return { model, mixer, idle, walk, bones, rest, restHipHeight, groundY, groundFootHeights };
}

/** Release the GPU resources owned by a loaded character. */
export function releaseCharacter(character: LoadedCharacter) {
  character.mixer.stopAllAction();
  character.mixer.uncacheRoot(character.model);
  disposeResources(character.model);
}
