import * as THREE from 'three';
import { stepOff, traverse } from './navigation';
import { climbStep } from './buildClimb';

/**
 * 走路（WASD / 方向键）与爬梯的一帧。
 *
 * 从 `OfficeAvatar.update()` 里搬出来的：那个文件已经贴着 500 行上限，而且"按键 → 位移"这段
 * 逻辑本来就该能脱离浏览器场景测试（`test/build-ladder.test.mjs` 里有自由行走/爬梯的用例）。
 * 相机的水平朝向既是行走方向，也是"在梯子上踏出去"的方向。
 */
export type WalkResult = {
  position: THREE.Vector3;
  rotationY: number;
  moving: boolean;
  /** 这一脚踩空了（前方没有地面）：位置已经挪到边缘外，接下来交给 `avatarFall` 下落。 */
  falling?: boolean;
};

/** 会被"走路"接管的按键（`OfficeAvatar` 的 keydown 用它，别在别处再抄一份）。 */
export const MOVEMENT_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

/** 相机朝向在水平面上的投影（长度 0 时退回 +Z，避免 atan2(0,0) 乱转）。 */
export function heading(camera: THREE.Camera) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 1e-12) forward.set(0, 0, 1);
  return forward.normalize();
}

/** 按住的键 → 世界坐标里的行走方向（未归一化前可能是零向量）。 */
export function walkDirection(keys: Set<string>, forward: THREE.Vector3) {
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
  const direction = new THREE.Vector3();
  if (keys.has('KeyW') || keys.has('ArrowUp')) direction.add(forward);
  if (keys.has('KeyS') || keys.has('ArrowDown')) direction.sub(forward);
  if (keys.has('KeyD') || keys.has('ArrowRight')) direction.add(right);
  if (keys.has('KeyA') || keys.has('ArrowLeft')) direction.sub(right);
  return direction.normalize();
}

export function walkStep(
  position: THREE.Vector3,
  keys: Set<string>,
  camera: THREE.Camera,
  dt: number,
  speed: number,
): WalkResult {
  const forward = heading(camera);
  const direction = walkDirection(keys, forward);
  const rotationY = direction.lengthSq() > 0 ? Math.atan2(direction.x, direction.z) : 0;
  const climb = climbStep(position, keys, forward, dt, speed);
  if (climb) return { position: climb.position, rotationY: climb.rotationY, moving: climb.moving };
  if (direction.lengthSq() === 0) return { position, rotationY, moving: false };
  const next = position.clone().addScaledVector(direction, dt * speed);
  const supported = traverse(position, next);
  if (supported) return { position: supported, rotationY, moving: true };
  // 走到边缘外面：水平方向没有挡住身体的东西、脚下又没有地面 → 允许踏空（重力在 `avatarFall`）。
  if (stepOff(position, next.x, next.z)) {
    return { position: new THREE.Vector3(next.x, position.y, next.z), rotationY, moving: true, falling: true };
  }
  return { position, rotationY, moving: false };
}
