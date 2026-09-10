import * as THREE from "three";

// Seat transforms live in seats.ts so the ring markers, the avatar and the
// monitor thumbnail all agree. Re-exported here for existing importers.
export { chairSeats } from "./seats";

// Walkable floor with clearance around desks and fixed furniture.
const obstacles = [
  [-0.95, 3.2, 2.6, 5],
  [-1.25, 2.85, -2.2, 0.2],
  [-9.6, -5.7, -0.9, 3.2],
  [-10, -8, -6.5, -2.1],
  [5.4, 8.7, 0.3, 3.7],
  [2, 5.6, -6.9, -4.8],
  [7.3, 10.4, -6.8, -4.8],
  // Rear glass partitions, leaving the meeting doorway near its left edge.
  [2.25, 10.9, -4, -3.65],
  [6.35, 6.8, -8.2, -3.6],
  [1, 1.3, -8.2, -4.7],
];
export function walkable(x: number, z: number) {
  return (
    x > -9.5 &&
    x < 10.4 &&
    z > -7.8 &&
    z < 6.05 &&
    !obstacles.some(
      ([a, b, c, d]) =>
        x > a - 0.15 && x < b + 0.15 && z > c - 0.15 && z < d + 0.15,
    )
  );
}
const STEP = 0.28;
export function findPath(
  start: THREE.Vector3,
  target: THREE.Vector3,
): THREE.Vector3[] {
  if (!walkable(target.x, target.z)) return [];
  const key = (x: number, z: number) => `${x},${z}`;
  let sx = Math.round(start.x / STEP),
    sz = Math.round(start.z / STEP);
  // A valid continuous position can round into a blocked grid cell.
  if (!walkable(sx * STEP, sz * STEP)) {
    const candidates: { x: number; z: number; distance: number }[] = [];
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const x = sx + dx,
          z = sz + dz;
        if (walkable(x * STEP, z * STEP)) {
          candidates.push({
            x,
            z,
            distance: Math.hypot(x * STEP - start.x, z * STEP - start.z),
          });
        }
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    if (!candidates.length) return [];
    sx = candidates[0].x;
    sz = candidates[0].z;
  }
  const tx = Math.round(target.x / STEP),
    tz = Math.round(target.z / STEP);
  type Node = { x: number; z: number; g: number; f: number; parent?: Node };
  const open: Node[] = [{ x: sx, z: sz, g: 0, f: 0 }];
  const best = new Map<string, number>();
  let result: Node | undefined;
  for (let count = 0; open.length && count < 12000; count++) {
    open.sort((a, b) => a.f - b.f);
    const n = open.shift()!;
    if (Math.hypot(n.x - tx, n.z - tz) < 1.5) {
      result = n;
      break;
    }
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const x = n.x + dx,
        z = n.z + dz,
        g = n.g + Math.hypot(dx, dz),
        k = key(x, z);
      if (
        !walkable(x * STEP, z * STEP) ||
        !walkable(n.x * STEP, z * STEP) ||
        !walkable(x * STEP, n.z * STEP)
      )
        continue;
      if ((best.get(k) ?? Infinity) <= g) continue;
      best.set(k, g);
      open.push({ x, z, g, f: g + Math.hypot(x - tx, z - tz), parent: n });
    }
  }
  if (!result) return [];
  const path = [target.clone()];
  for (let n: Node | undefined = result; n?.parent; n = n.parent)
    path.unshift(new THREE.Vector3(n.x * STEP, 0, n.z * STEP));
  return path;
}
