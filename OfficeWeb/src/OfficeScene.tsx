import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OfficeAvatar } from "./OfficeAvatar";
import "./avatar.css";
import type { Person } from "./types";

export type View = "overview" | "desks" | "meeting" | "lounge";
interface Props {
  people: Person[];
  previews: Record<string, string>;
  selected: number;
  view: View;
  onSelect: (seat: number) => void;
}
const seats = Array.from({ length: 8 }, (_, i) => ({
  x: (i < 4 ? 1.1268 : 0.8) + (i % 4 < 2 ? -0.86 : 0.86),
  z: -(i < 4 ? -3.8 : 1) + (i % 2 === 0 ? 0.65 : -0.65),
}));
const views: Record<View, [number[], number[]]> = {
  overview: [
    [19, 23, 29],
    [0.5, 0, -0.5],
  ],
  desks: [
    [8, 12, 15],
    [0.6, 0.5, 1.8],
  ],
  meeting: [
    [12, 9, 5],
    [4.1, 1, -5.8],
  ],
  lounge: [
    [4, 10, 13],
    [-6, 0, 0],
  ],
};
export default function OfficeScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const [status, setStatus] = useState("正在载入办公室");
  const actor = useRef<OfficeAvatar>();
  const [actorState, setActorState] = useState("角色载入中…");
  const [character, setCharacter] = useState<"woman" | "man">("woman");
  const [stats, setStats] = useState("");
  const api = useRef<{ focus: (v: View) => void }>();
  useEffect(() => {
    api.current?.focus(props.view);
  }, [props.view]);
  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor("#e9ede8");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);
    const world = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
    const avatar = new OfficeAvatar(world, camera, setActorState);
    actor.current = avatar;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.mouseButtons = {
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minDistance = 5;
    controls.maxDistance = 65;
    const goalPosition = new THREE.Vector3();
    const goalTarget = new THREE.Vector3();
    let traveling = true;
    api.current = {
      focus(view) {
        goalPosition.fromArray(views[view][0]);
        goalTarget.fromArray(views[view][1]);
        traveling = true;
      },
    };
    api.current.focus(latest.current.view);
    camera.position.copy(goalPosition);
    controls.target.copy(goalTarget);
    controls.addEventListener("start", () => {
      traveling = false;
    });
    world.add(new THREE.HemisphereLight(0xffffff, 0x9ca797, 2));
    const sun = new THREE.DirectionalLight(0xfff2dd, 3);
    sun.position.set(-12, 22, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -23,
      right: 23,
      top: 23,
      bottom: -23,
      near: 0.1,
      far: 70,
    });
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 4;
    world.add(sun);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({ color: 0xe9ede8, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    ground.receiveShadow = true;
    world.add(ground);
    const white = new THREE.MeshStandardMaterial({
      color: 0xf5f4ef,
      roughness: 0.82,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: 0xbfcfc7,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      roughness: 0.25,
    });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xb8cfc1,
      emissive: 0x7eaa95,
      emissiveIntensity: 0.12,
    });
    let stopped = false,
      frame = 0,
      tick = 0;
    const screenMeshes: THREE.Mesh[] = [];
    new GLTFLoader().load(
      "/assets/office-white.glb",
      (gltf) => {
        if (stopped) return;
        gltf.scene.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          const name = o.name.toLowerCase();
          o.material =
            name.includes("glass") || name.includes("glazing")
              ? glass
              : o.userData.role === "shared_screen"
                ? screenMat
                : white;
          o.castShadow = o.material !== glass;
          o.receiveShadow = true;
          if (o.userData.role === "shared_screen") screenMeshes.push(o);
        });
        world.add(gltf.scene);
        setStatus("白模已就绪");
      },
      (p) => {
        if (p.total)
          setStatus(`正在载入 ${Math.round((p.loaded / p.total) * 100)}%`);
      },
      () => setStatus("模型加载失败，请刷新重试"),
    );
    const markers: THREE.Mesh[] = [];
    seats.forEach((seat, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.045, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x608673 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(seat.x, 0.83, seat.z);
      ring.userData.seat = i;
      world.add(ring);
      markers.push(ring);
    });
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = [0, 0];
    const start = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = [e.clientX, e.clientY];
    };
    const end = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const r = el.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(world.children, true);
      for (const hit of hits) {
        if (hit.object.userData.seat !== undefined) {
          latest.current.onSelect(hit.object.userData.seat);
          return;
        }
        const id = hit.object.userData.seat_id as string | undefined;
        if (id?.startsWith("Island")) {
          latest.current.onSelect(
            (id.includes("_B_") ? 4 : 0) + Number(id.slice(-1)) - 1,
          );
          return;
        }
      }
      const point = new THREE.Vector3();
      if (
        ray.ray.intersectPlane(
          new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
          point,
        )
      ) {
        avatar.moveTo(point);
      }
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", end);
    const resize = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(el);
    function animate() {
      frame = requestAnimationFrame(animate);
      if (traveling) {
        camera.position.lerp(goalPosition, 0.075);
        controls.target.lerp(goalTarget, 0.075);
        if (camera.position.distanceTo(goalPosition) < 0.01) traveling = false;
      }
      controls.update();
      avatar.update();
      markers.forEach((m, i) => {
        (m.material as THREE.MeshBasicMaterial).color.setHex(
          i === latest.current.selected
            ? 0xe3a760
            : latest.current.people.some((p) => p.seat === i)
              ? 0x397866
              : 0xa1b4a7,
        );
        m.scale.setScalar(i === latest.current.selected ? 1.25 : 1);
      });
      renderer.render(world, camera);
      if (++tick % 120 === 0)
        setStats(`${renderer.info.render.triangles.toLocaleString()} 面`);
    }
    animate();
    return () => {
      stopped = true;
      avatar.dispose();
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointerup", end);
      world.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
        }
      });
      white.dispose();
      glass.dispose();
      screenMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="scene-shell">
      <div className="scene" ref={host} />
      <div className="scene-status">
        <span className="dot" />
        {status}
        <span>{stats}</span>
      </div>
      <div className="actor-controls">
        <label>
          我的角色{" "}
          <select
            aria-label="选择角色"
            value={character}
            onChange={(e) => {
              const kind = e.target.value as "woman" | "man";
              setCharacter(kind);
              void actor.current?.load(kind);
            }}
          >
            <option value="woman">女角色</option>
            <option value="man">男角色</option>
          </select>
        </label>
        <button onClick={() => actor.current?.sit(latest.current.selected)}>
          坐到 {props.selected + 1} 号工位
        </button>
        <button onClick={() => actor.current?.standUp()}>起身</button>
        <span role="status">{actorState}</span>
      </div>
      <div className="scene-help">
        左键 / WASD 行走 · 中键旋转 · 滚轮朝鼠标缩放 · Shift＋中键平移
      </div>
    </div>
  );
}
