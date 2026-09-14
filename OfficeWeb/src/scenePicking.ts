import * as THREE from 'three';

/** Raycasts include invisible parents and clipped-away wall triangles. */
function isRendered(hit: THREE.Intersection) {
  let node: THREE.Object3D | null = hit.object;
  while (node) {
    if (!node.visible) return false;
    node = node.parent;
  }
  if (!(hit.object instanceof THREE.Mesh)) return true;
  const materials = hit.object.material;
  const material: THREE.Material | undefined = Array.isArray(materials)
    ? materials[hit.face?.materialIndex ?? 0] : materials;
  if (!material || !material.visible || (material.transparent && material.opacity === 0)) return false;
  const planes = material.clippingPlanes;
  if (planes?.length) {
    const outside = (plane: THREE.Plane) => plane.distanceToPoint(hit.point) < 0;
    if (material.clipIntersection ? planes.every(outside) : planes.some(outside)) return false;
  }
  return true;
}

/** Only the nearest rendered object may respond; never click through a desk. */
export function pickSceneSurface(hits: THREE.Intersection[]) {
  const hit = hits.find(isRendered);
  if (!hit) return null;
  let node: THREE.Object3D | null = hit.object;
  while (node) {
    if (typeof node.userData.monitorSeat === 'number') {
      return { kind: 'monitor' as const, seat: node.userData.monitorSeat as number, hit };
    }
    const spots = node.userData.sittingSpots as { id: string; chair: { x: number; z: number } }[] | undefined;
    if (spots?.length) {
      const closest = [...spots].sort((a, b) =>
        Math.hypot(a.chair.x - hit.point.x, a.chair.z - hit.point.z)
        - Math.hypot(b.chair.x - hit.point.x, b.chair.z - hit.point.z))[0];
      return { kind: 'public-seat' as const, seat: null, spot: closest.id, hit };
    }
    if (typeof node.userData.seat === 'number') {
      return { kind: 'seat' as const, seat: node.userData.seat as number, hit };
    }
    node = node.parent;
  }
  return { kind: 'surface' as const, seat: null, hit };
}

type Pointer = Pick<PointerEvent, 'button' | 'pointerId' | 'clientX' | 'clientY'>;

/** A drag returning to its start is still a drag; release can fire only once. */
export class SceneClickGesture {
  private down: { id: number; x: number; y: number; dragged: boolean } | null = null;
  start(event: Pointer) {
    this.down = event.button === 0
      ? { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false } : null;
  }
  move(event: Pointer) {
    if (!this.down || this.down.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - this.down.x, event.clientY - this.down.y) > 5) this.down.dragged = true;
  }
  end(event: Pointer) {
    this.move(event);
    const click = this.down && this.down.id === event.pointerId && event.button === 0 && !this.down.dragged;
    this.down = null;
    return Boolean(click);
  }
  cancel() { this.down = null; }
}
