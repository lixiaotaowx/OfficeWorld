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
}

/**
 * Install `window.__officeDebug`. The monitor probe raycasts from both the
 * camera (what a visitor sees) and the desk chair (what its occupant sees),
 * which is the check that catches a screen being painted onto a hidden face.
 */
export function installSceneProbe(options: SceneProbeOptions) {
  const { monitors, remotes, avatar, world, camera } = options;
  (window as unknown as { __officeDebug?: unknown }).__officeDebug = {
    get monitors() {
      return monitors();
    },
    remotes,
    local: () => avatar.getState(),
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
}
