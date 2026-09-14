import * as THREE from 'three';
import { pickSceneSurface } from './scenePicking';

export function attachMonitorContext(el: HTMLElement, camera: THREE.Camera,
  world: THREE.Scene, ownSeat: () => number | null,
  open: (point: { x: number; y: number }) => void) {
  let down: { x: number; y: number; dragged: boolean } | undefined;
  const ray = new THREE.Raycaster();
  const start = (event: PointerEvent) => {
    down = event.button === 2 ? { x: event.clientX, y: event.clientY, dragged: false } : undefined;
  };
  const move = (event: PointerEvent) => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) down.dragged = true;
  };
  const end = (event: PointerEvent) => {
    move(event);
    const click = down && !down.dragged && event.button === 2;
    down = undefined;
    if (!click || !window.officeDesktop || ownSeat() == null) return;
    const box = el.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((event.clientX - box.left) / box.width * 2 - 1,
      -(event.clientY - box.top) / box.height * 2 + 1), camera);
    ray.near = camera instanceof THREE.PerspectiveCamera ? camera.near : 0;
    const hit = pickSceneSurface(ray.intersectObjects(world.children, true));
    if (hit?.kind === 'monitor' && hit.seat === ownSeat()) open({ x: event.clientX, y: event.clientY });
  };
  const cancel = () => { down = undefined; };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', cancel);
  return () => {
    el.removeEventListener('pointerdown', start);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', end);
    el.removeEventListener('pointercancel', cancel);
  };
}
