// Shared character loading, used by both the locally controlled avatar
// (OfficeAvatar) and every remote player (RemoteAvatars), so a remote player
// looks exactly like they do on their own screen. Seated posing lives in
// sitPoses.ts.
//
// The body is the 「尺子角色」(paper/wooden ruler person) exported from
// `跑步循环_修网格.blend` by Build/ruler/export_ruler.py. That export carries the
// Mixamo rig (`mixamorig:*`), nine clips and **every accessory** as an extra
// skinned mesh, so a look change never needs another download.
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { disposeResources } from './disposeResources';
import { applyAppearance, collectLookParts, type LookParts } from "./characterLook";
import { DEFAULT_APPEARANCE, type Appearance } from "./look";

export interface LoadedCharacter {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction;
  walk: THREE.AnimationAction;
  /** 跑步循环（`跑步循环_Run`）：长距离移动用它，不用一块板子慢悠悠走。 */
  run?: THREE.AnimationAction;
  /** 动作库里的任意一个 clip（尺子角色自带 9 条：站立/走路/跑步/招手/跳跃/空翻/坐姿打字/游泳/打拳）。 */
  action: (...names: string[]) => THREE.AnimationAction | undefined;
  /** 这个角色身上有哪些动作（小窗的打招呼动画据此断言"动作库里有这一条"）。 */
  clips: string[];
  bones: Map<string, THREE.Bone>;
  /** Bind-pose quaternion/position per bone, for resetting before a sit pose. */
  rest: Map<string, { quaternion: THREE.Quaternion; position: THREE.Vector3 }>;
  /** World Y of the hips at rest, feet on the ground. */
  restHipHeight: number;
  /** `model.position.y` that places the feet on the ground. */
  groundY: number;
  groundFootHeights: Map<string, number>;
  /** 可调色材质与配件网格（切配色/换配件用）。 */
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

/**
 * 骨骼名的归一写法：**同时去掉点和冒号**。
 * GLTFLoader 会把 Blender 的 `UpperLeg.L` 存成 `UpperLegL`、把 `mixamorig:Hips` 存成
 * `mixamorigHips`；而 Blender 里两套命名都带点/冒号。归一之后 `mixamorig:Hips` 与
 * `mixamorigHips` 就能对上（别名表里写的是 Blender 那一套）。
 */
export function boneKey(name: string): string {
  return name.replaceAll(".", "").replaceAll(":", "");
}

/**
 * 找一根骨头，**同时容忍两套命名**：旧 Quaternius（`UpperLeg.L` / `Abdomen`）与
 * 现在尺子角色的 Mixamo（`mixamorig:LeftUpLeg` / `mixamorig:Spine1`）。
 * 就座姿势与手部定位原先写死了 Quaternius 的名字，换角色后会全部静默找不到骨骼
 * （表现为"坐下时手脚一动不动"），所以查名字统一走这里。
 */
const BONE_ALIASES: Record<string, string[]> = {
  Hips: ["mixamorig:Hips"],
  Abdomen: ["mixamorig:Spine"],
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
  // `mixamorig:Hips` -> `mixamorigHips`：别名表里的名字可能还带冒号（Blender 里就是那样），
  // 到了 three 里冒号被去掉，所以再按"归一化后同名"扫一遍。
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

/** 按优先级在动作库里找第一个存在的 clip；兼容两套命名（尺子/旧 Quaternius）。 */
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
  // 中文命名兜底：`站立待机_Idle` 之类，按关键字找。
  for (const name of names) {
    const needle = name.toLowerCase().replace(/[^a-z]/g, "");
    if (!needle) continue;
    const found = animations.find((clip) =>
      clip.name.toLowerCase().replace(/[^a-z]/g, "").includes(needle));
    if (found) return found;
  }
  return undefined;
}

/** Load the ruler avatar, scaled to a plausible adult and ready to animate. */
export async function loadCharacter(
  appearance: Appearance = DEFAULT_APPEARANCE,
): Promise<LoadedCharacter> {
  const gltf = await new GLTFLoader()
    .setDRACOLoader(dracoLoader())
    .loadAsync(CHARACTER_GLB);
  const model = gltf.scene;
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
  const run = find("跑步循环_Run");
  return { model, mixer, idle, walk, run, action: find,
    clips: gltf.animations.map((clip) => clip.name),
    bones, rest, restHipHeight, groundY, groundFootHeights, look, appearance };
}

/** 换配色/换配件：只改材质与显隐，不重新加载模型。 */
export function setCharacterAppearance(character: LoadedCharacter, appearance: Appearance) {
  applyAppearance(character.look, appearance);
  character.appearance = appearance;
}

/** Release the GPU resources owned by a loaded character. */
export function releaseCharacter(character: LoadedCharacter) {
  character.mixer.stopAllAction();
  character.mixer.uncacheRoot(character.model);
  disposeResources(character.model);
}
