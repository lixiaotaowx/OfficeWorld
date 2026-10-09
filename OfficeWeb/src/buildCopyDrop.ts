import * as THREE from 'three';
import type { BuildPart } from './buildTypes';

/**
 * 移动模式 Shift+D 复制后，副本跟着鼠标走的位置计算。
 *
 * 纯函数、不碰场景：拖拽只改 x/z，y 由手柄负责（世界横竖两轴）。
 * 视线太平（射线几乎平行于参考面）时交点会飞到天边，那一帧返回 undefined，
 * 调用方保持上一帧位置——禁止让副本被甩到几百米外。
 */
export type DropPlane = 'ground' | 'vertical';
export type DropPoint = { x: number; y: number; z: number };
export type DropSource = Pick<BuildPart, 'x' | 'y' | 'z'>;

const PARALLEL = 0.18;
const GRID = 0.25;

const snapDown = (value: number) => Math.floor(value / GRID) * GRID;
/** 保留原件的小数偏置，再按 25 厘米取整：非整格原点也不会跳半格。 */
const align = (value: number, origin: number) => {
  const bias = origin - snapDown(origin);
  return Math.round((value - bias) / GRID) * GRID + bias;
};

export function copyDropPoint(
  part: DropSource, ray: THREE.Ray, plane: DropPlane = 'ground',
): DropPoint | undefined {
  const axis = plane === 'ground' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  if (Math.abs(ray.direction.dot(axis)) < PARALLEL) return undefined;
  const constant = plane === 'ground' ? -part.y : -part.x;
  const point = ray.intersectPlane(new THREE.Plane(axis, constant), new THREE.Vector3());
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) return undefined;
  return {
    x: align(point.x, part.x),
    y: part.y,
    z: align(point.z, part.z),
  };
}

/** 落点离原件不到半个格子：用户没真的拖走，第一次复制就原位放下（Blender 同样原位落地）。 */
export function keepsOriginalSpot(part: DropSource, point: DropPoint) {
  return Math.hypot(point.x - part.x, point.z - part.z) < GRID / 2;
}

export { align as alignDrop, GRID as DROP_GRID };
