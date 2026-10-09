import * as THREE from 'three';

/**
 * 传送点的粒子条：一根细的光点柱往上冒（用户：「传送点要有粒子条往上出现，简约的做一个，注意性能」）。
 *
 * 性能做法（别改成每个点一份几何/一个定时器）：
 * - **所有传送点共用同一份几何和材质**，每帧只更新一次共享的 `position`/`color` 顶点属性（18 个点）；
 *   每个传送点只是多挂一个 `Points`（一次 draw call），没有任何逐帧分配、没有定时器、没有阴影。
 * - 不吃拾取（`raycast=()=>{}`）、不参与碰撞、不投影，`frustumCulled=false`（包围盒是空的，见下）。
 * - **必须挂一个空包围盒**：否则 `Box3.setFromObject` 会把粒子柱算进去，目录实测尺寸/选中框/
 *   旋转环半径全被撑大（流动箭头的晕壳就是这么踩过的）。
 */
export const BEAM_POINTS = 18;
/** 细柱：直径约 0.7m，从底座上方升到 2.3m 左右再淡出。 */
const BEAM_RADIUS = 0.35;
const BEAM_BOTTOM = 0.24;
const BEAM_HEIGHT = 2.05;
/** 每秒上升的圈数（相位）。 */
const BEAM_RISE = 0.42;

let shared: THREE.BufferGeometry | undefined;
let material: THREE.PointsMaterial | undefined;

function beamGeometry() {
  if (shared) return shared;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(BEAM_POINTS * 3);
  const colors = new Float32Array(BEAM_POINTS * 3);
  for (let i = 0; i < BEAM_POINTS; i++) {
    // 黄金角 + 两档半径：不用随机数也能散得均匀，而且每次构建结果一致（测试可断言）。
    const angle = i * 2.399963;
    const radius = BEAM_RADIUS * (i % 3 === 0 ? 0.45 : i % 3 === 1 ? 0.75 : 1);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = BEAM_BOTTOM;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 1;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  shared = geometry;
  return geometry;
}

/** 共用的一份亮青材质（传送点本来就"点了就去"，所以只有这一种）。 */
export function teleportBeamMaterial() {
  if (material) return material;
  material = new THREE.PointsMaterial({
    size: 0.11, sizeAttenuation: true, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, toneMapped: false,
  });
  material.color.set('#9df2e4');
  return material;
}

/** 给一块传送点挂上粒子条（`buildArchitecture` 建部件时调一次）。 */
export function createTeleportBeam(root: THREE.Object3D) {
  const points = new THREE.Points(beamGeometry(), teleportBeamMaterial());
  points.name = 'teleport-beam';
  points.frustumCulled = false;
  points.raycast = () => {};
  (points as THREE.Points & { boundingBox?: THREE.Box3 }).boundingBox = new THREE.Box3();
  points.userData.noBuildCollision = true;
  points.userData.teleportBeam = true;
  root.add(points);
  root.userData.teleportBeam = points;
  return points;
}

/**
 * 每帧一次：共享几何的 y 与亮度按相位走一圈。世界上一块传送点都没有时直接返回（零开销）。
 */
export function updateTeleportBeams(world: THREE.Object3D, time: number) {
  let geometry: THREE.BufferGeometry | undefined;
  for (const child of world.children) {
    const points = child.userData.teleportBeam as THREE.Points | undefined;
    if (points) { geometry = points.geometry; break; }
  }
  if (!geometry) return;
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const color = geometry.getAttribute('color') as THREE.BufferAttribute;
  for (let i = 0; i < BEAM_POINTS; i++) {
    const phase = (time * BEAM_RISE + i / BEAM_POINTS) % 1;
    position.setY(i, BEAM_BOTTOM + phase * BEAM_HEIGHT);
    // 上下都淡：加法混合下"暗"就是看不见，不用逐点 alpha。
    const shade = 0.2 + 0.8 * Math.sin(Math.PI * phase);
    color.setXYZ(i, shade, shade, shade);
  }
  position.needsUpdate = true;
  color.needsUpdate = true;
}
