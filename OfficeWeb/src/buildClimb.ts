import * as THREE from 'three';
import { climbAt, traverse } from './navigation';

/**
 * 直梯的攀爬规则（用户：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，就类似于游戏，
 * 以及自动寻路也可以」）。
 *
 * 梯子不能靠 `buildNavigation` 的 0.255m 抬腿高度走上去——真正的爬梯是**抓着往上挪**，
 * 所以这里是一条独立规则：人在梯子柱体里时，`W / ↑` 往上爬、`S / ↓` 往下退，
 * 左右仍然横着挪；爬到顶/底以后继续按那个方向，就迈一步踏上（或退下）平台。
 *
 * 这个模块是纯规则（只做数学 + 用 `traverse` 校验落点），`OfficeAvatar` 每帧调一次，
 * 单测 `test/build-ladder.test.mjs` 直接驱动它，不用起浏览器。
 */

/** 爬梯速度（m/s）：比走路慢，和游戏里爬梯子的手感接近。 */
export const CLIMB_SPEED = 1.15;

export type ClimbStep = {
  position: THREE.Vector3;
  rotationY: number;
  /** 真的挪动了（爬了，或者踏出去了）。 */
  moving: boolean;
  /** 这一帧是在爬梯子，而不是在走。 */
  climbing: boolean;
};

/** 上下两个方向键；W/S 与 ↑/↓ 等价（用户说的"方向键通行"）。 */
export function climbInput(keys: Set<string>) {
  return {
    up: keys.has('KeyW') || keys.has('ArrowUp'),
    down: keys.has('KeyS') || keys.has('ArrowDown'),
  };
}

/**
 * 在梯子上的一帧。返回 `null` 表示"人不在梯子上（或没按上下键）"，交给普通走路处理。
 * `forward` 是相机在水平面上的朝向：踏出梯顶就是朝这个方向迈一步。
 */
export function climbStep(
  position: THREE.Vector3,
  keys: Set<string>,
  forward: THREE.Vector3,
  dt: number,
  speed: number,
): ClimbStep | null {
  const column = climbAt(position.x, position.z, position.y);
  if (!column) return null;
  const { up, down } = climbInput(keys);
  if (!up && !down) return null;
  // 爬的时候**面朝梯子**（梯面法线，由 `buildNavigation` 按人站的那一侧算），不是面朝相机：
  // 相机朝向只用来决定"到顶/到底以后往哪边踏出去"。人正好在梯子中线上时保持原朝向。
  const onLadder = column.faceX || column.faceZ
    ? Math.atan2(column.faceX, column.faceZ)
    : Math.atan2(forward.x, forward.z);
  const next = position.clone();
  if (up && position.y < column.top - 1e-4) {
    next.y = Math.min(column.top, position.y + CLIMB_SPEED * dt);
    return { position: next, rotationY: onLadder, moving: true, climbing: true };
  }
  if (down && position.y > column.bottom + 1e-4) {
    next.y = Math.max(column.bottom, position.y - CLIMB_SPEED * dt);
    return { position: next, rotationY: onLadder, moving: true, climbing: true };
  }
  // 已经在梯顶（还按着上）或梯底（还按着下）：朝那个方向迈出去，落点由 `traverse` 说了算。
  // 这一步算"走"：朝向跟着实际移动方向，和普通走路一致。
  const reach = speed * dt;
  const direction = up ? 1 : -1;
  const target = new THREE.Vector3(
    next.x + forward.x * direction * reach,
    next.y,
    next.z + forward.z * direction * reach,
  );
  const landed = traverse(next, target);
  if (!landed) return { position: next, rotationY: onLadder, moving: false, climbing: true };
  const walkedX = landed.x - next.x, walkedZ = landed.z - next.z;
  const rotationY = Math.hypot(walkedX, walkedZ) > 1e-6 ? Math.atan2(walkedX, walkedZ) : onLadder;
  return { position: landed, rotationY, moving: true, climbing: true };
}
