// Diagnostic hook exposed on window while developing, and on a deployed build
// only when the page is opened with ?debug=1.
//
// It lives in its own module because OfficeScene was carrying it inline and
// approaching the project's 500 line ceiling.
import * as THREE from "three";
import type { OfficeAvatar } from "./OfficeAvatar";
import type { MonitorScreens } from "./monitorScreens";
import type { RemoteAvatars } from "./RemoteAvatars";
import { WORKSTATIONS } from "./seats";

export interface SceneProbeOptions {
  monitors: () => MonitorScreens | undefined;
  remotes: RemoteAvatars;
  avatar: OfficeAvatar;
  world: THREE.Scene;
  camera: THREE.Camera;
  renderStats?: () => unknown;
}

/**
 * Install `window.__officeDebug`. The monitor probe raycasts from both the
 * camera (what a visitor sees) and the desk chair (what its occupant sees),
 * which is the check that catches a screen being painted onto a hidden face.
 */
export function installSceneProbe(options: SceneProbeOptions) {
  const { monitors, remotes, avatar, world, camera } = options;
  const debugWindow = window as unknown as { __officeDebug?: unknown };
  const probe = {
    get rendering() { return options.renderStats?.(); },
    get monitors() {
      return monitors();
    },
    remotes,
    avatar,
    local: () => avatar.getState(),
    /** The whole scene, so a diagnostic can inspect what was actually built. */
    __scene: world,
    /** Camera used by both member-list and physical-monitor focus checks. */
    __camera: camera,
    probeMonitor: (seatIndex: number) => {
      const target = monitors()?.meshFor(seatIndex);
      const workstation = WORKSTATIONS[seatIndex];
      if (!target || !workstation) return null;
      world.updateMatrixWorld(true);
      const center = new THREE.Box3()
        .setFromObject(target)
        .getCenter(new THREE.Vector3());
      const shot = (from: THREE.Vector3) => {
        const ray = new THREE.Raycaster(
          from,
          center.clone().sub(from).normalize(),
        );
        const first = ray
          .intersectObjects(world.children, true)
          .find((hit) => hit.object.visible);
        return {
          firstHit: first?.object?.name ?? null,
          hitsScreen: first?.object === target,
        };
      };
      return {
        center: [
          +center.x.toFixed(3),
          +center.y.toFixed(3),
          +center.z.toFixed(3),
        ],
        fromCamera: shot(camera.position.clone()),
        // Eye height of somebody sitting at this desk.
        fromChair: shot(
          new THREE.Vector3(workstation.chair.x, 1.2, workstation.chair.z),
        ),
      };
    },
  };
  debugWindow.__officeDebug = probe;
  return () => { if (debugWindow.__officeDebug === probe) delete debugWindow.__officeDebug; };
}
