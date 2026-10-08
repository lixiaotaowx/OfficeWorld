// 把一套「外观」应用到已加载的尺子角色上：板身调色 + 配件显隐。
//
// 导出时所有配件都带在同一个 GLB 里（同一个骨架、都蒙到 mixamorig:Head），
// 所以显隐就是设 `Object3D.visible`，不需要重新加载模型、也不会断动画。
//
// **不要写死材质名**：这个 GLB 是用户自己的元绘工程导出的，材质槽顺序改一次就全错。
// 所以"板身材质"按"网格里顶点最多的那一槽"认。名字来自 Blender（`材质.017`…），
// 见 look.ts 与 export_ruler.py。
//
// 另外：源 .blend 里有四个"眼球"（`球体.004~007`）是**别的模型遗留的垃圾几何**——
// 它们中心离板身 0.85m、蒙到的骨头在骨架里不存在，导出后会浮在人旁边。
// 已经在导出阶段整个删掉（`export_ruler.py` 的 EYES），这里不再做运行时的隐藏补丁。
import * as THREE from "three";
import {
  ACCESSORIES,
  SLOT_ORDER,
  colorHex,
  type Appearance,
  type AccessorySlot,
} from "./look";

export interface LookParts {
  /** 每个材质名一份**独立副本**：每个角色一份，调色才不会互相影响。 */
  materials: Map<string, THREE.MeshStandardMaterial>;
  /** 配件网格名 -> 物体，用来切显隐。 */
  accessories: Map<string, THREE.Object3D>;
  /** 网格名 -> 它属于哪个槽位（诊断与测试用）。 */
  slots: Map<string, AccessorySlot>;
  /** 板身材质名（顶点最多的那一槽）。 */
  bodyMaterial: string | null;
  /** 各材质槽统计到的顶点数（诊断用：确认"板身"认对了）。 */
  weights: Record<string, number>;
}

function asStandard(material: THREE.Material): THREE.MeshStandardMaterial | null {
  return (material as THREE.MeshStandardMaterial).isMeshStandardMaterial
    ? (material as THREE.MeshStandardMaterial)
    : null;
}

/**
 * 某个材质槽实际覆盖多少顶点。
 * 有 `groups` 就按组算（一个槽可能只占网格的一小部分）；没有就整块都算给它。
 */
function slotVertexCount(
  geometry: THREE.BufferGeometry | undefined,
  index: number,
  slotCount: number,
): number {
  const total = geometry?.attributes?.position?.count ?? 0;
  const groups = geometry?.groups ?? [];
  if (!groups.length || slotCount <= 1) return total;
  const indices = geometry?.index;
  let count = 0;
  for (const group of groups) {
    if (group.materialIndex !== index) continue;
    // 有索引时组里是索引个数，否则是顶点个数
    count += group.count;
    if (!indices) continue;
  }
  return count || total / slotCount;
}

/**
 * 在模型上找出可调色材质与全部配件网格。
 * `Clone` 一份材质，避免多个角色共用同一个材质实例（远端玩家会被一起改色）。
 */
export function collectLookParts(model: THREE.Object3D): LookParts {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const accessories = new Map<string, THREE.Object3D>();
  const slots = new Map<string, AccessorySlot>();
  /** 材质名 -> 总顶点数（用来认"板身"是哪一槽）。 */
  const weights = new Map<string, number>();

  const accessoryNames = new Set<string>();
  for (const slot of SLOT_ORDER) {
    for (const def of ACCESSORIES[slot]) {
      if (def.mesh) accessoryNames.add(def.mesh);
    }
  }

  model.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh && !(mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const copy = list.map((material) => material.clone());
    mesh.material = Array.isArray(mesh.material) ? copy : copy[0];
    copy.forEach((material, index) => {
      const standard = asStandard(material);
      if (!standard) return;
      if (standard.name === '材质.005' || standard.name === '材质.006') {
        standard.roughness = standard.name === '材质.005' ? .2 : .42;
        standard.metalness = 0;
      }
      materials.set(standard.name, standard);
      // **只统计身体自己那几块网格**：配件（头发/帽子/胡子/眼镜）都是独立网格、顶点还比板身多，
      // 一起算会把"板身"认成某条头发（实测踩过：色相补丁装到隐藏的 `头发_长直发_材质` 上，
      // 表现就是"换颜色完全没反应"）。
      if (accessoryNames.has(mesh.name)) return;
      // 顶点数要按"这个材质槽实际覆盖多少顶点"算，不能把整块网格的顶点数都算给每个槽。
      const count = slotVertexCount(mesh.geometry, index, copy.length);
      weights.set(standard.name, (weights.get(standard.name) ?? 0) + count);
    });
    // 配件是按对象名区分的（Blender 物体名原样导出）。
    if (accessoryNames.has(mesh.name)) accessories.set(mesh.name, mesh);
  });

  for (const slot of SLOT_ORDER) {
    for (const def of ACCESSORIES[slot]) {
      if (def.mesh) slots.set(def.mesh, slot);
    }
  }

  // The ruler surface owns the printed texture. Detailed eyes can have more
  // vertices than the board, so vertex count alone no longer identifies it.
  const textured = [...weights.keys()].filter(name => materials.get(name)?.map);
  const candidates = textured.length ? textured : [...weights.keys()];
  let bodyMaterial: string | null = null;
  let bodyWeight = -1;
  for (const name of candidates) {
    const weight = weights.get(name)!;
    if (weight > bodyWeight) { bodyWeight = weight; bodyMaterial = name; }
  }

  return { materials, accessories, slots, bodyMaterial, weights: Object.fromEntries(weights) };
}

/** 按外观设置板身颜色与配件显隐。 */
export function applyAppearance(parts: LookParts, appearance: Appearance) {
  // **直接改贴图像素**（而不是在着色器里调色）。
  //
  // 走过一段弯路：先在 `onBeforeCompile` 里对 `diffuseColor` 做色相偏移——uniform 也设对了、
  // 逐像素 A/B 也证明那段 GLSL 会改画面，但**角色在场景里就是不变色**（实测三次采样完全相同）。
  // 与其继续和着色器管线较劲，不如把结果直接写进像素：复制一份贴图 → 逐像素上色 → 换上新纹理。
  const material = parts.bodyMaterial ? parts.materials.get(parts.bodyMaterial) : undefined;
  if (material) applyLookToMaterial(material, appearance);

  const wanted = new Set<string>();
  for (const slot of SLOT_ORDER) {
    const id = appearance.accessories[slot];
    const def = ACCESSORIES[slot].find((a) => a.id === id);
    if (def?.mesh) wanted.add(def.mesh);
  }
  for (const [name, object] of parts.accessories) {
    object.visible = wanted.has(name);
  }
}

/** 贴图副本缓存：同一张原图 + 同一个配色只算一次（所有角色共用一张算好的贴图）。 */
const textureCache = new Map<string, THREE.Texture>();

/**
 * 把配色算进一张贴图副本并换上。
 *
 * 板身贴图（GLB 里的 `ruler03_材质.002_BaseColor`，1024×1024 JPEG）实测是**纯灰度**：
 * 逐像素 R=G=B（平均色偏 0.00），纸面亮度 ≈ 206/255、刻度 ≈ 0~9。
 * 也就是说颜色**只能来自这里**，把它按配色重算一遍，模型渲出来就一定是目标色。
 */
export function applyLookToMaterial(material: THREE.MeshStandardMaterial, appearance: Appearance) {
  const hex = colorHex(appearance.color);
  // **永远以"原图"为源**：换上去之后的 `material.map` 已经是算过的图，再拿它当源就会把
  // 上一种配色乘进来 —— 实测连换几次颜色后纸面一次比一次黑（原色正常、雪白渲成深灰）。
  const source = (material.userData.lookSource as THREE.Texture | undefined) ?? material.map;
  let recolored = false;
  if (source?.image) {
    material.userData.lookSource = source;
    const key = `${source.uuid}|${hex}`;
    let cached = textureCache.get(key);
    if (!cached) {
      cached = tintTexture(source, hex);
      textureCache.set(key, cached);
    }
    material.map = cached;
    // 贴图已经是目标色，基色保持白，避免二次相乘。
    material.color.setRGB(1, 1, 1);
    recolored = true;
  } else {
    // 没有贴图（纯色槽）：直接设基色。
    material.color.setStyle(hex);
  }
  material.needsUpdate = true;
  // 诊断/测试读这里（`?debug=1` 的探针会用它确认"真的换过贴图"）。
  material.userData.look = { color: appearance.color, hex, recolored, mapUuid: material.map?.uuid ?? null };
}

/** 贴图尺寸：`ImageBitmap` 用 width/height，`HTMLImageElement` 要用 natural 尺寸。 */
function imageSize(image: unknown): { width: number; height: number } {
  const source = image as {
    width?: number;
    height?: number;
    naturalWidth?: number;
    naturalHeight?: number;
  };
  return {
    width: source.naturalWidth || source.width || 0,
    height: source.naturalHeight || source.height || 0,
  };
}

/**
 * 纸面亮度基准（贴图实测 p50 = 206/255）。
 * 用它做分母，纸就正好是配色本身；比纸暗的地方（刻度、阴影）按比例跟着暗下去。
 */
export const PAPER_LEVEL = 206 / 255;

/**
 * 复制一张贴图，按配色逐像素上色。
 *
 * 做法是**灰度当遮罩、配色当颜色**：`出 = 配色 × (像素明度 / 纸面亮度)`，上限 1。
 * 这样：
 *   * 纸面（亮度 = 基准）出来的就是配色本身的 RGB —— 雪白真的白、墨黑真的黑；
 *   * 刻度与阴影按同样的比例变暗，**全黑的地方（明度 0）算出来还是 0**，满足「不要动黑的地方」；
 *   * 不去读原图色相 —— 这张图是灰的，JPEG 压缩给灰像素带的 1~3/255 色偏是噪声，
 *     早先按"原色相 + 目标色相"转，等于给每个像素加一个**随机**色相
 *     （实测：薄荷渲成黄绿、藏蓝渲成品红，十套配色平均下来全糊成灰）。
 *
 * **不要用 `source.clone()` 再改 `copy.image`**：three 的 `Texture.copy()` 里
 * `this.source = source.source` 是**共享**同一个 `Source`，而 `texture.image` 就是
 * `source.data` 的读写口 —— 于是"给副本换图"会把**原图也换掉**。实测症状：
 * 第二套配色开始是把上一套的结果再乘一次，一次比一次黑（原色正常、雪白渲成深灰）。
 * 所以这里新建一张 `CanvasTexture`，只把采样参数照抄过来。
 *
 * 前提：板身贴图必须是灰度的（导出脚本保证）。要是将来换成带颜色的贴图，
 * 这里等于再乘一次配色，得改成别的算法。
 */
function tintTexture(source: THREE.Texture, hex: string): THREE.Texture {
  const { width, height } = imageSize(source.image);
  if (!width || !height || typeof document === "undefined") return source;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return source;
  context.drawImage(source.image as CanvasImageSource, 0, 0);
  const data = context.getImageData(0, 0, width, height);
  const pixels = data.data;
  const target = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  for (let i = 0; i < pixels.length; i += 4) {
    const lum = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) / 255;
    const k = Math.min(1, lum / PAPER_LEVEL);
    pixels[i] = Math.round(target[0] * k * 255);
    pixels[i + 1] = Math.round(target[1] * k * 255);
    pixels[i + 2] = Math.round(target[2] * k * 255);
  }
  context.putImageData(data, 0, 0);
  const copy = new THREE.CanvasTexture(canvas);
  copy.colorSpace = source.colorSpace;
  copy.flipY = source.flipY;
  copy.wrapS = source.wrapS;
  copy.wrapT = source.wrapT;
  copy.magFilter = source.magFilter;
  copy.minFilter = source.minFilter;
  copy.anisotropy = source.anisotropy;
  copy.offset.copy(source.offset);
  copy.repeat.copy(source.repeat);
  copy.center.copy(source.center);
  copy.rotation = source.rotation;
  copy.needsUpdate = true;
  return copy;
}

// **废弃的路子，不要再走回去**：曾经在 `onBeforeCompile` 里给片元加色相补丁。
// uniform 的确设对了、逐像素 A/B 也证明那段 GLSL 会改画面，但角色在场景里就是不变色
// （2026-09-28 实测三次采样完全相同）。配色现在只走上面的贴图像素重算，不碰着色器。

/** 这个槽位当前戴的那件网格名（"none" -> 空串）。 */
export function wornMesh(appearance: Appearance, slot: AccessorySlot): string {
  return ACCESSORIES[slot].find((a) => a.id === appearance.accessories[slot])?.mesh ?? "";
}
