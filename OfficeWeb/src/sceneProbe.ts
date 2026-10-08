// Diagnostic hook exposed on window while developing, and on a deployed build
// only when the page is opened with ?debug=1.
//
// It lives in its own module because OfficeScene was carrying it inline and
// approaching the project's 500 line ceiling.
import * as THREE from "three";
import type { OfficeAvatar } from "./OfficeAvatar";
import type { MonitorScreens } from "./monitorScreens";
import type { RemoteAvatars } from "./RemoteAvatars";
import { WORKSTATIONS, workstationAt } from "./seats";

export interface SceneProbeOptions {
  monitors: () => MonitorScreens | undefined;
  remotes: RemoteAvatars;
  avatar: OfficeAvatar;
  world: THREE.Scene;
  camera: THREE.Camera;
  renderStats?: () => unknown;
  /** Name tags currently worn, one per character. */
  nameTags?: () => unknown;
  /** World position of a person, for the camera-focus check. */
  personPosition?: (id: string) => [number, number, number] | null;
  /** Orbit controls, so a screenshot check can aim the camera at any wall. */
  controls?: () => { target: THREE.Vector3 } | undefined;
  /** 上报一份运动快照（测试用：直接构造"他在跑"来验远端动画，不用等他真的跑起来）。 */
  sendMotion?: (motion: unknown) => void;
  /** 画布尺寸（CSS 像素），`__pick` 换算屏幕坐标要用。 */
  canvasSize?: () => { width: number; height: number };
  /** 测试用：按名字显示/隐藏自己角色身上的网格（排查"这块几何是什么"）。 */
  setPartVisible?: (name: string, visible: boolean) => boolean;
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
    /** Aim the camera at a specific spot (used by screenshot checks). */
    controls: () => options.controls?.(),
    /** Name tags above heads, and where any person stands. */
    get nameTags() { return options.nameTags?.(); },
    personPosition: (id: string) => options.personPosition?.(id) ?? null,
    /** 测试用：把一份运动快照交给正常的上报通道。 */
    __sendMotion: (motion: unknown) => options.sendMotion?.(motion),
    /** 测试用：显示/隐藏自己角色身上的某个网格，用来确认"这块几何是什么"。 */
    __setPartVisible: (name: string, visible: boolean) => options.setPartVisible?.(name, visible) ?? false,
    /**
     * 测试用：只留自己角色（把场景里其它东西全藏起来），这样截图/取像素就一定是角色本身。
     * 返回被藏起来的数量；再调一次 `__isolate(false)` 恢复。
     */
    __isolate: (on = true) => {
      let hidden = 0;
      for (const child of world.children) {
        if (child === avatar.root) continue;
        child.visible = !on;
        if (on) hidden++;
      }
      return hidden;
    },
    /** 自己角色身上的网格清单（名字 + 当前可见性）。 */
    __parts: () => {
      const rows: { name: string; visible: boolean; material: (string | null)[] }[] = [];
      avatar.root.traverse(object => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh && !(mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh) return;
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        rows.push({ name: mesh.name, visible: mesh.visible !== false,
          material: list.map(m => m?.name ?? null) });
      });
      return rows;
    },
    /**
     * 屏幕坐标 → 场景物体（测试/排查用）。`x`,`y` 是相对画布的 CSS 像素。
     * 返回命中的第一个可见物体的名字、材质名与颜色，以及命中点的世界坐标。
     */
    __pick: (x: number, y: number) => {
      const rect = options.canvasSize?.() ?? { width: 1, height: 1 };
      const ndc = new THREE.Vector2((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.camera = camera as THREE.PerspectiveCamera;
      ray.setFromCamera(ndc, camera as THREE.PerspectiveCamera);
      const hits = ray.intersectObjects(world.children, true).filter(hit => hit.object.visible);
      const first = hits[0];
      if (!first) return { hit: null };
      const mesh = first.object as THREE.Mesh;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      return {
        hit: mesh.name,
        material: mats.map(m => m?.name ?? null),
        color: mats.map(m => (m as THREE.MeshStandardMaterial)?.color?.getHexString?.() ?? null),
        point: [+first.point.x.toFixed(3), +first.point.y.toFixed(3), +first.point.z.toFixed(3)],
        parent: mesh.parent?.name ?? null,
      };
    },
    probeMonitor: (seatIndex: number) => {
      const target = monitors()?.meshFor(seatIndex);
      const workstation = workstationAt(seatIndex);
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
        // Sprites (the name tags) refuse to cast, but three still reads this.
        ray.camera = camera;
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
