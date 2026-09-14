import * as THREE from 'three';
import { fitMonitorInset, SCREEN_SURFACE_GAP } from './monitorSurface';

const SIDE_BORDER = 0.005;
const TOP_BORDER = 0.004;
const BOTTOM_BORDER = 0.006;

/** Enlarge the physical opening by moving both rings of its inset corners.
 * This edits a geometry clone, not an overlay or the source GLB. The outer
 * housing, rear mount and stand retain every original vertex and proportion.
 */
export function narrowMonitorBezel(
  shell: THREE.Object3D,
  seed: THREE.Vector3,
  frame: THREE.Quaternion,
) {
  if (shell.userData.narrowBezel) return shell.userData.narrowBezel;
  const inset = fitMonitorInset(shell, seed, frame);
  if (!inset) return null;
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(frame);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(frame);
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(frame);
  const origin = inset.center.clone().addScaledVector(normal, -SCREEN_SURFACE_GAP);
  const meshes: THREE.Mesh[] = [];
  shell.traverse(object => { if (object instanceof THREE.Mesh) meshes.push(object); });
  const tolerance = 0.00002;
  const points: { mesh: THREE.Mesh; index: number; world: THREE.Vector3; x: number; y: number; depth: number }[] = [];
  let left = Infinity, rightEdge = -Infinity, bottom = Infinity, top = -Infinity;
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute('position');
    for (let index = 0; index < position.count; index++) {
      const world = new THREE.Vector3().fromBufferAttribute(position, index).applyMatrix4(mesh.matrixWorld);
      const delta = world.clone().sub(origin);
      const x = delta.dot(right), y = delta.dot(up), depth = delta.dot(normal);
      // Front opening and lip only. Excludes the forward foot and rear mount.
      if (depth < -tolerance || depth > .01 || Math.abs(y) > inset.height * .55) continue;
      points.push({ mesh, index, world, x, y, depth });
      left = Math.min(left, x); rightEdge = Math.max(rightEdge, x);
      bottom = Math.min(bottom, y); top = Math.max(top, y);
    }
  }
  const oldHalfWidth = inset.width / 2, oldHalfHeight = inset.height / 2;
  if (!Number.isFinite(left) || rightEdge - left <= inset.width || top - bottom <= inset.height) return null;
  const newLeft = left + SIDE_BORDER, newRight = rightEdge - SIDE_BORDER;
  const newBottom = bottom + BOTTOM_BORDER, newTop = top - TOP_BORDER;
  const corners = points.filter(point =>
    Math.abs(Math.abs(point.x) - oldHalfWidth) < tolerance &&
    Math.abs(Math.abs(point.y) - oldHalfHeight) < tolerance);
  // Only adapt a verified rectangular inset with both lip/depth rings.
  const locations = new Set(corners.map(point =>
    [point.x, point.y, point.depth].map(value => Math.round(value / tolerance)).join(',')));
  if (locations.size !== 8 || newLeft >= -oldHalfWidth || newRight <= oldHalfWidth ||
      newBottom >= -oldHalfHeight || newTop <= oldHalfHeight) return null;
  const originals: { mesh: THREE.Mesh; geometry: THREE.BufferGeometry }[] = [];
  for (const mesh of new Set(corners.map(point => point.mesh))) {
    originals.push({ mesh, geometry: mesh.geometry });
    mesh.geometry = mesh.geometry.clone();
  }
  for (const point of corners) {
    const x = point.x < 0 ? newLeft : newRight;
    const y = point.y < 0 ? newBottom : newTop;
    const world = point.world.clone().addScaledVector(right, x - point.x).addScaledVector(up, y - point.y);
    const local = point.mesh.worldToLocal(world);
    point.mesh.geometry.getAttribute('position').setXYZ(point.index, local.x, local.y, local.z);
  }
  for (const { mesh } of originals) {
    mesh.geometry.getAttribute('position').needsUpdate = true;
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  }
  const report = {
    oldSize: [inset.width, inset.height], newSize: [newRight - newLeft, newTop - newBottom],
    border: { left: SIDE_BORDER, right: SIDE_BORDER, top: TOP_BORDER, bottom: BOTTOM_BORDER },
    changedVertices: corners.length,
  };
  // Keep source geometry available for inspection and safe restoration.
  shell.userData.narrowBezel = report;
  shell.userData.restoreBezel = () => {
    for (const { mesh, geometry } of originals) { mesh.geometry.dispose(); mesh.geometry = geometry; }
    delete shell.userData.narrowBezel;
    delete shell.userData.restoreBezel;
  };
  return report;
}
