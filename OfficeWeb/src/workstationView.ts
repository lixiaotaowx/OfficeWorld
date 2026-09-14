import * as THREE from 'three';
import type { Workstation } from './seats';

/** Keep the whole monitor, desk and adjacent office in frame, including portrait viewports. */
export function workstationView(seat: Workstation, panel: THREE.Vector3, aspect: number) {
  const direction = new THREE.Vector3(seat.chair.x - panel.x, 0, seat.chair.z - panel.z).normalize();
  const distance = 2.15 * Math.max(1, 0.85 / Math.max(0.3, aspect));
  const target = panel.clone();
  const position = target.clone().addScaledVector(direction, distance);
  // Look over a seated colleague's head rather than straight through it.
  position.y += distance * 0.65;
  return { position, target };
}

/** A temporary foreground section: preserve 1.25m around the focused desk. */
export function updateWorkstationClip(camera: THREE.PerspectiveCamera, target: THREE.Vector3, active: boolean) {
  const depth = target.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3()));
  const near = active ? Math.max(0.1, depth - 1.25) : 0.1;
  if (Math.abs(camera.near - near) < 0.001) return;
  camera.near = near;
  camera.updateProjectionMatrix();
}
