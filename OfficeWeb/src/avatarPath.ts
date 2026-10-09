import * as THREE from 'three';
import { climbAt, traverse } from './navigation';

/**
 * Recheck every frame against the latest collaborative build, including height.
 *
 * 梯子那一段要**顺着爬**：`traverse` 在梯子里只保持当前高度（梯子不是地面），
 * 所以光靠水平走是上不去的，这里先把高度挪到路径点的高度，再继续横着走。
 */
export function advancePath(position: THREE.Vector3, path: THREE.Vector3[], distance: number) {
  while (path.length && distance > 0) {
    const node = path[0];
    if (climbAt(position.x, position.z, position.y)) {
      const rise = node.y - position.y;
      if (Math.abs(rise) > 1e-3) {
        const used = Math.min(Math.abs(rise), distance);
        position.y += Math.sign(rise) * used;
        distance -= used;
        if (Math.abs(node.y - position.y) > 1e-3) return;
        path.shift();
        continue;
      }
    }
    const direction = node.clone().sub(position);
    direction.y = 0;
    const length = direction.length();
    const target = length <= distance
      ? node
      : position.clone().addScaledVector(direction, distance / Math.max(length, 1e-6));
    const next = traverse(position, target);
    if (!next) { path.length = 0; return; }
    position.copy(next);
    if (length <= distance) { distance -= length; path.shift(); }
    else return;
  }
}
