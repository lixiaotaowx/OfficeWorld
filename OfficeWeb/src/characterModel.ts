import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { disposeResources } from './disposeResources';
import { applyAppearance, collectLookParts, releaseLookTextures, releaseTintVariants, type LookParts } from "./characterLook";
import { DEFAULT_APPEARANCE, type Appearance } from "./look";
import { SharedResourcePool } from './sharedResourcePool';

// Shared character loading, used by both the locally controlled avatar
// (OfficeAvatar) and every remote player (RemoteAvatars). Geometry, original
// textures and animation clips are immutable and shared; each consumer gets
// its own skeleton and materials, so posing and appearance stay independent.

export interface LoadedCharacter {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  /** 跑步循环（`跑步循环_Run`）：长距离移动用它，不用一块模板慢悠悠走。 */
  run?: THREE.AnimationAction;
  /** 动作库里的任意一个 clip。 */
  action: (...names: string[]) => THREE.AnimationAction | undefined;
  /** 这个角色身上有哪些动作。 */
  clips: string[];
  bones: Map<string, THREE.Bone>;
  /** Bind-pose quaternion/position per bone, for resetting before a sit pose. */
  rest: Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>;
  /** World Y of the hips at rest, feet on the ground. */
  restHipHeight: number;
  /** `model.position.y` that places the feet on the ground. */
  groundY: number;
  groundFootHeights: Map<string, number>;
  /** 可调色材质与配件网格（切换色/换配件用）。 */
  look: LookParts;
  /** 当前外观（初始为参数给的那一套）。 */
  appearance: Appearance;
}

/** Average adult height the models are normalised to. */
const TARGET_HEIGHT = 1.72;

/** 尺子角色的 GLB（身体 + 眼睛 + 眼镜 + 18 件配件 + 9 条动作）。 */
export const CHARACTER_GLB = "/assets/characters/ruler.glb?v=fit-20260928";

let sharedDraco: DRACOLoader | null = null;

function dracoLoader(): DRACOLoader {
  if (!sharedDraco) {
    sharedDraco = new DRACOLoader().setDecoderPath("/assets/draco/");
  }
  return sharedDraco;
}

// Geometry, original textures and animation clips are immutable. Each consumer
// gets its own skeleton and materials, so posing and appearance remain independent.
const templates = new SharedResourcePool(async () => {
  const gltf = await new GLTFLoader().setDRACOLoader(dracoLoader()).loadAsync(CHARACTER_GLB);
  const materials = new Set<THREE.Material>();
  gltf.scene.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(m);
  });
  return { gltf, materials };
}, ({ gltf, materials }) => {
  const textures = new Set<THREE.Texture>();
  for (const material of materials) for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
  for (const texture of textures) releaseTintVariants(texture);
  disposeResources(gltf.scene);
});

const characterLeases = new WeakMap<LoadedCharacter, () => void>();

function disposeClone(model: THREE.Object3D, shared: Set<THREE.Material>) {
  const materials = new Set<THREE.Material>(), skeletons = new Set<THREE.Skeleton>();
  model.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) if (!shared.has(material)) materials.add(material);
    const skinned = mesh as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh) skeletons.add(skinned.skeleton);
  });
  for (const material of materials) material.dispose();
  for (const skeleton of skeletons) skeleton.dispose();
}

/** Bone-name normalisation shared by the alias table below. */
export function boneKey(name: string): string {
  return name.replaceAll(".", "").replaceAll(":", "");
}

const BONE_ALIASES: Record<string, string[]> = {
  Hips: ["mixamorig:Hips"],
  Chest: ["mixamorig:Spine1", "mixamorig:Spine2"],
  Neck: ["mixamorig:Neck"],
  Head: ["mixamorig:Head"],
  UpperLegL: ["mixamorig:LeftUpLeg"], UpperLegR: ["mixamorig:RightUpLeg"],
  LowerLegL: ["mixamorig:LeftLeg"], LowerLegR: ["mixamorig:RightLeg"],
  FootL: ["mixamorig:LeftFoot"], FootR: ["mixamorig:RightFoot"],
  UpperArmL: ["mixamorig:LeftArm"], UpperArmR: ["mixamorig:RightArm"],
  LowerArmL: ["mixamorig:LeftForeArm"], LowerArmR: ["mixamorig:RightForeArm"],
  WristL: ["mixamorig:LeftHand"], WristR: ["mixamorig:RightHand"],
  ShoulderL: ["mixamorig:LeftShoulder"], ShoulderR: ["mixamorig:RightShoulder"],
};

export function findBone(
  bones: Map<string, THREE.Bone>,
  name: string,
): THREE.Bone | undefined {
  const direct = bones.get(name) ?? bones.get(boneKey(name));
  if (direct) return direct;
  const wanted = boneKey(name);
  for (const [key, bone] of bones) {
    if (boneKey(key) === wanted) return bone;
  }
  for (const alias of BONE_ALIASES[wanted] ?? []) {
    const found = bones.get(alias) ?? bones.get(boneKey(alias));
    if (found) return found;
    const normalised = boneKey(alias);
    for (const [key, bone] of bones) {
      if (boneKey(key) === normalised) return bone;
    }
  }
  return undefined;
}

export function findClip(
  animations: THREE.AnimationClip[],
  ...names: string[]
): THREE.AnimationClip | undefined {
  for (const name of names) {
    const exact = animations.find((clip) => clip.name === name);
    if (exact) return exact;
    const loose = animations.find((clip) => clip.name.endsWith(name));
    if (loose) return loose;
  }
  for (const name of names) {
    const needle = name.toLowerCase().replace(/[^a-z]/g, "");
    if (!needle) continue;
    const found = animations.find((clip) =>
      clip.name.toLowerCase().replace(/[^a-z]/g, "").includes(needle));
    if (found) return found;
  }
  return undefined;
}

/** Load the ruler avatar: one shared template, one private skeleton. */
export async function loadCharacter(
  appearance: Appearance = DEFAULT_APPEARANCE,
): Promise<LoadedCharacter> {
  const lease = await templates.acquire();
  const { gltf, materials } = lease.value;
  let model: THREE.Group | undefined;
  try {
    model = cloneSkeleton(gltf.scene) as THREE.Group;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const scale = TARGET_HEIGHT / (box.max.y - box.min.y);
    model.scale.multiplyScalar(scale);
    model.position.y = -box.min.y * scale;
    const groundY = model.position.y;
    const bones = new Map<string, THREE.Bone>();
    model.traverse((object) => {
      if (object instanceof THREE.Bone) {
        bones.set(object.name, object);
        bones.set(boneKey(object.name), object);
      }
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        // 蒙皮网格的包围球按绑定姿态算，坐着/挥手时会被误裁掉。
        object.frustumCulled = false;
      }
    });
    const look = collectLookParts(model);
    applyAppearance(look, appearance);
    model.updateMatrixWorld(true);
    const rest = new Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>();
    for (const [name, bone] of bones) {
      rest.set(name, { quaternion: bone.quaternion.clone(), position: bone.position.clone() });
    }
    const hips = bones.get("mixamorig:Hips") ?? bones.get("Hips");
    const groundFootHeights = new Map<string, number>();
    for (const side of ["L", "R"]) {
      const foot = bones.get(`mixamorig:Foot${side}`) ?? bones.get(`Foot${side}`);
      if (foot) groundFootHeights.set(side, foot.getWorldPosition(new THREE.Vector3()).y);
    }
    const restHipHeight = hips ? hips.getWorldPosition(new THREE.Vector3()).y : 0;
    const mixer = new THREE.AnimationMixer(model);
    const find = (...names: string[]) => {
      const clip = findClip(gltf.animations, ...names);
      return clip ? mixer.clipAction(clip) : undefined;
    };
    const idle = find("站立待机_Idle", "Idle_Neutral", "Idle")!;
    const walk = find("走路循环_Walk", "Walk")!;
    const character: LoadedCharacter = {
      model, mixer, idle, walk, action: find,
      run: find("跑步循环_Run", "Run"),
      clips: gltf.animations.map((clip) => clip.name),
      bones, rest, restHipHeight, groundY, groundFootHeights, look, appearance,
    };
    characterLeases.set(character, () => {
      disposeClone(character.model, materials);
      lease.release();
    });
    return character;
  } catch (error) {
    if (model) disposeClone(model, materials);
    lease.release();
    throw error;
  }
}

/** Switch looks on a live character: drop the old tint reference first so
 *  the shared texture cache stays correct, then re-apply. */
export function setCharacterAppearance(character: LoadedCharacter, appearance: Appearance) {
  applyAppearance(character.look, appearance);
  character.appearance = appearance;
}

/** Give the whole character back: stop clips, drop private resources, then
 *  release the shared template (which disposes when nobody else holds it). */
export function releaseCharacter(character: LoadedCharacter) {
  const release = characterLeases.get(character);
  if (!release) return;
  characterLeases.delete(character);
  character.mixer.stopAllAction();
  character.mixer.uncacheRoot(character.model);
  releaseLookTextures(character.look);
  disposeResources(character.model);
  release();
}
