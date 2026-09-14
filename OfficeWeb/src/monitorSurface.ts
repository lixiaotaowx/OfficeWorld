import * as THREE from "three";

/** One millimetre avoids coplanar flicker without exposing a floating panel. */
export const SCREEN_SURFACE_GAP = 0.001;

/**
 * Intersect the monitor at display height. Its overall bounding box also
 * contains the protruding foot, so that box must never define screen depth.
 * Inputs and output use world space, including nested/rotated model nodes.
 */
export function findMonitorSurface(
  shell: THREE.Object3D,
  displayCenter: THREE.Vector3,
  frontNormal: THREE.Vector3,
): THREE.Vector3 | null {
  const hit = findSurfaceHit(shell, displayCenter, frontNormal);
  return hit ? hit.point.clone().addScaledVector(frontNormal.clone().normalize(), SCREEN_SURFACE_GAP) : null;
}

function findSurfaceHit(
  shell: THREE.Object3D,
  displayCenter: THREE.Vector3,
  frontNormal: THREE.Vector3,
) {
  shell.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(shell);
  const normal = frontNormal.clone().normalize();
  const reach = bounds.getSize(new THREE.Vector3()).length()
    + bounds.getCenter(new THREE.Vector3()).distanceTo(displayCenter);
  const ray = new THREE.Raycaster(
    displayCenter.clone().addScaledVector(normal, reach),
    normal.clone().negate(),
    0,
    reach * 2,
  );
  const normalMatrix = new THREE.Matrix3();
  const hitNormal = new THREE.Vector3();
  const hit = ray.intersectObject(shell, true).find(candidate => {
    if (!candidate.face) return false;
    normalMatrix.getNormalMatrix(candidate.object.matrixWorld);
    hitNormal.copy(candidate.face.normal).applyMatrix3(normalMatrix).normalize();
    return hitNormal.dot(normal) > 0.9;
  });
  return hit ?? null;
}

/** Measure the connected, planar display inset, excluding bevels and stand.
 * Vertex positions weld UV seams for connectivity without changing the model.
 * The frame's axes are world-space unit vectors, so tilted/scaled imports work.
 */
export function fitMonitorInset(
  shell: THREE.Object3D,
  displayCenter: THREE.Vector3,
  frame: THREE.Quaternion,
) {
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(frame);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(frame);
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(frame);
  const hit = findSurfaceHit(shell, displayCenter, normal);
  if (!hit || !(hit.object instanceof THREE.Mesh) || hit.faceIndex == null) return null;
  const geometry = hit.object.geometry as THREE.BufferGeometry;
  const positions = geometry.getAttribute('position');
  const index = geometry.index;
  const count = index ? index.count : positions.count;
  const epsilon = 0.00001;
  const faces = new Map<number, { points: THREE.Vector3[]; keys: string[]; area: number }>();
  const neighbors = new Map<string, number[]>();
  for (let offset = 0; offset < count; offset += 3) {
    const points = [0, 1, 2].map(corner => new THREE.Vector3()
      .fromBufferAttribute(positions, index ? index.getX(offset + corner) : offset + corner)
      .applyMatrix4(hit.object.matrixWorld));
    if (points.some(point => Math.abs(point.clone().sub(hit.point).dot(normal)) > epsilon)) continue;
    const cross = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
    const area = cross.length() / 2;
    if (area < 1e-12 || cross.normalize().dot(normal) < 0.999) continue;
    const keys = points.map(point => point.toArray().map(value => Math.round(value / epsilon)).join(','));
    const face = offset / 3;
    faces.set(face, { points, keys, area });
    for (const key of keys) neighbors.set(key, [...(neighbors.get(key) ?? []), face]);
  }
  const pending = [hit.faceIndex], visited = new Set<number>();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, area = 0;
  while (pending.length) {
    const id = pending.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const face = faces.get(id);
    if (!face) continue;
    area += face.area;
    for (const point of face.points) {
      const delta = point.clone().sub(hit.point);
      const x = delta.dot(right), y = delta.dot(up);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    for (const key of face.keys) pending.push(...(neighbors.get(key) ?? []));
  }
  const width = maxX - minX, height = maxY - minY;
  // A disconnected/irregular part must not be covered with a guessed rectangle.
  if (!Number.isFinite(width) || width <= 0 || height <= 0 || area / (width * height) < 0.995) return null;
  return {
    width, height,
    center: hit.point.clone().addScaledVector(right, (minX + maxX) / 2)
      .addScaledVector(up, (minY + maxY) / 2).addScaledVector(normal, SCREEN_SURFACE_GAP),
  };
}
