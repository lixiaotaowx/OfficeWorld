import * as THREE from 'three';
import { loadCharacter, setCharacterAppearance, type LoadedCharacter } from './characterModel';
import { appearanceKey, type Appearance } from './look';
import { portraitLighting } from './portraitLighting';

/**
 * 脸上那几块"五官"几何（瞳孔 / 眼白）。
 *
 * 这角色没有独立的头：整块板 1.75m，五官是板身网格里**另外两个材质槽**（`材质.005/006`，
 * 实测 y≈1.10~1.23）。所以脸的定位办法是：板身网格里，既不是板身材质、也不是配件的那几块。
 */
function faceFeatures(character: LoadedCharacter): THREE.Box3 {
  const box = new THREE.Box3();
  character.model.updateMatrixWorld(true);
  character.model.traverseVisible(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (character.look.accessories.has(mesh.name) || character.look.slots.has(mesh.name)) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (!materials.length) return;
    if (materials.some(material => material?.name === character.look.bodyMaterial)) return;
    box.union(new THREE.Box3().setFromObject(mesh, true));
  });
  return box;
}

/**
 * 取景余量：眼睛又宽又扁，留一点边才不至于顶到画框。
 *
 * **必须对所有人和所有配件都一样**（用户 2026-09-28：「怎么还有大有小」）：
 * 早先按"脸 + 眼镜/胡子"取景，戴眼镜的人框会放宽到 0.68 —— 于是别人是特写、他是一张远景，
 * 同一条头像条上大小不一。现在只按**眼睛**算，1.55 这个系数正好能把眼镜整个装进去
 * （眼镜 x±0.271，眼睛 x±0.172），任何人、任何配件都是同一档缩放。
 */
const FACE_MARGIN = 1.55;
/** 五官量不到时的兜底取景（以瞳孔实测高度为中心）。 */
const FACE_FALLBACK = { y: 1.16, half: .22 };

/**
 * 头像取的**就是这张脸**（用户 2026-09-28：「头像太小了 只特写面部就行」）。
 *
 * 原来按「头顶往下 0.65m」取景：脸（y 1.10~1.23）只占画面的十几分之一，缩到 28px 头像里
 * 就只剩一条缝。现在量出五官那块几何、围着它取景，眼睛横着占满约 2/3 宽 ——
 * 而且**与穿了什么无关**，所以一整排头像大小一致。
 */
export function portraitCamera(character: LoadedCharacter) {
  const box = faceFeatures(character);
  if (box.isEmpty()) {
    const camera = new THREE.OrthographicCamera(-FACE_FALLBACK.half, FACE_FALLBACK.half,
      FACE_FALLBACK.half, -FACE_FALLBACK.half, .1, 20);
    camera.position.set(0, FACE_FALLBACK.y, 3);
    camera.lookAt(0, FACE_FALLBACK.y, 0);
    return camera;
  }
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const half = Math.max(.12, Math.max(size.x, size.y) * .5 * FACE_MARGIN);
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, .1, 20);
  camera.position.set(center.x + .26, center.y + .065, 3);
  camera.lookAt(center.x, center.y, 0);
  return camera;
}

/** Fitting-room framing includes accessories; dock framing remains fixed. */
export function accessoryCamera(character: LoadedCharacter) {
  const box = faceFeatures(character);
  for (const mesh of character.look.accessories.values()) {
    if (mesh.visible) box.union(new THREE.Box3().setFromObject(mesh, true));
  }
  if (box.isEmpty()) return portraitCamera(character);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const half = Math.max(.27, size.x * .59, size.y * .59);
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, .1, 20);
  camera.position.set(center.x + .26, center.y + .065, 3);
  camera.lookAt(center.x, center.y, 0);
  return camera;
}

let studio: Promise<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; character: LoadedCharacter; camera: THREE.OrthographicCamera }> | undefined;
let queue = Promise.resolve();
const portraits = new Map<string, string>();
function getStudio() {
  return studio ??= (async () => {
    const character = await loadCharacter();
    character.idle.play();
    character.mixer.update(.1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(160, 160, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(character.model);
    portraitLighting(renderer, scene);
    return { renderer, scene, character, camera: portraitCamera(character) };
  })().catch(error => { studio = undefined; throw error; });
}

/** One shared renderer, no animation loop; repaint only when an outfit changes. */
export async function renderPortrait(appearance: Appearance): Promise<string> {
  const key = appearanceKey(appearance);
  const cached = portraits.get(key);
  if (cached) return cached;
  let result = '';
  const work = queue.then(async () => {
    const { renderer, scene, character, camera } = await getStudio();
    setCharacterAppearance(character, appearance);
    renderer.render(scene, camera);
    result = renderer.domElement.toDataURL('image/png');
    if (portraits.size >= 64) portraits.delete(portraits.keys().next().value!);
    portraits.set(key, result);
  });
  queue = work.catch(() => {});
  await work;
  return result;
}


