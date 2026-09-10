import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OfficeAvatar } from "./OfficeAvatar";
import { RemoteAvatars, type RemoteState } from "./RemoteAvatars";
import { MonitorScreens } from "./monitorScreens";
import { WORKSTATIONS } from "./seats";
import "./avatar.css";
import type { CharacterKind } from "./characterModel";
import type { Motion, Person } from "./types";

export type View = "overview" | "desks" | "meeting" | "lounge";
interface Props {
  people: Person[];
  /** Our own socket id: we never draw ourselves as a remote avatar. */
  myId: string;
  previews: Record<string, string>;
  /** Latest motion snapshot per player, relayed by the server. */
  motions: Record<string, Motion>;
  selected: number;
  view: View;
  onSelect: (seat: number) => void;
  /** Claim a workstation server-side; resolves false if someone else has it. */
  onClaimSeat: (seat: number | null) => Promise<boolean>;
  /** Publish our own motion so everybody else can draw us. */
  onMotion: (motion: Motion) => void;
  onCharacter: (kind: CharacterKind) => void;
}

/** Everyone except us is drawn from the last snapshot the server relayed. */
function remoteStates(state: {
  people: Person[];
  motions: Record<string, Motion>;
  myId: string;
}): Map<string, RemoteState> {
  const out = new Map<string, RemoteState>();
  for (const person of state.people) {
    if (person.id === state.myId) continue;
    const motion = state.motions[person.id];
    if (!motion) continue;
    out.set(person.id, { ...motion, character: person.character });
  }
  return out;
}

/** Paint every occupied workstation's screen with its occupant's thumbnail. */
function syncMonitors(
  monitors: MonitorScreens,
  state: { people: Person[]; previews: Record<string, string> },
) {
  for (const workstation of WORKSTATIONS) {
    const occupant = state.people.find((p) => p.seat === workstation.index);
    const preview = occupant ? state.previews[occupant.id] : undefined;
    monitors.setPreview(workstation.index, preview ?? null);
  }
}
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
  const monitorsRef = useRef<MonitorScreens>();
  const remotesRef = useRef<RemoteAvatars>();
  useEffect(() => {
    api.current?.focus(props.view);
  }, [props.view]);
  // Push each occupant's broadcast thumbnail onto their own workstation screen.
  // The preview map is the ambient, unreadably small JPEG; nothing here grants
  // access to the real video stream, which still needs an approved request.
  useEffect(() => {
    const monitors = monitorsRef.current;
    if (!monitors) return;
    syncMonitors(monitors, props);
  }, [props.people, props.previews]);
  // The avatar follows the seat the server says we hold, so claiming a desk
  // from the sidebar and clicking "坐到 N 号工位" behave identically.
  const lastSeat = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    const seat = props.people.find((p) => p.id === props.myId)?.seat ?? null;
    if (lastSeat.current === seat) return;
    const first = lastSeat.current === undefined;
    lastSeat.current = seat;
    // At startup there is nothing to undo.
    if (first && seat === null) return;
    if (seat === null) actor.current?.standUp();
    else actor.current?.sit(seat);
  }, [props.people, props.myId]);
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
    const remotes = new RemoteAvatars(world);
    remotesRef.current = remotes;
    if (import.meta.env.DEV) {
      // `monitors` is created further down, once the model starts loading, so
      // it has to be resolved lazily.
      (window as unknown as { __officeDebug?: unknown }).__officeDebug = {
        get monitors() {
          return monitorsRef.current;
        },
        remotes,
        local: () => avatar.getState(),
      };
    }
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
      tick = 0,
      sinceReport = 0;
    const clock = new THREE.Clock();
    const monitors = new MonitorScreens();
    monitorsRef.current = monitors;
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
        });
        // Hand every per-seat screen its own material so a thumbnail can be
        // painted on it without touching the other monitors.
        monitors.attach(gltf.scene, screenMat);
        world.add(gltf.scene);
        // Thumbnails that arrived while the model was still loading.
        syncMonitors(monitors, latest.current);
        setStatus("白模已就绪");
      },
      (p) => {
        if (p.total)
          setStatus(`正在载入 ${Math.round((p.loaded / p.total) * 100)}%`);
      },
      () => setStatus("模型加载失败，请刷新重试"),
    );
    const markers: THREE.Mesh[] = [];
    WORKSTATIONS.forEach((workstation) => {
      const i = workstation.index;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.045, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x608673 }),
      );
      ring.rotation.x = -Math.PI / 2;
      // Marker sits on the real chair, taken from the authored asset.
      ring.position.set(workstation.chair.x, 0.83, workstation.chair.z);
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
      const dt = Math.min(clock.getDelta(), 0.05);
      if (traveling) {
        camera.position.lerp(goalPosition, 0.075);
        controls.target.lerp(goalTarget, 0.075);
        if (camera.position.distanceTo(goalPosition) < 0.01) traveling = false;
      }
      controls.update();
      avatar.update();
      // Draw the other players, then tell the server where we are. Reporting is
      // throttled: the server would reject a faster stream anyway.
      remotes.sync(
        remoteStates({
          people: latest.current.people,
          motions: latest.current.motions,
          myId: latest.current.myId,
        }),
      );
      remotes.update(dt);
      sinceReport += dt;
      if (sinceReport >= 0.07) {
        sinceReport = 0;
        const me = avatar.getState();
        latest.current.onMotion({
          x: me.x,
          z: me.z,
          rot: me.rot,
          moving: me.moving,
          sitting: me.sitting,
        });
      }
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
      if (++tick % 120 === 0) {
        setStats(`${renderer.info.render.triangles.toLocaleString()} 面`);
      }
    }
    animate();
    return () => {
      stopped = true;
      avatar.dispose();
      remotes.dispose();
      remotesRef.current = undefined;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      monitors.dispose();
      monitorsRef.current = undefined;
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
              latest.current.onCharacter(kind);
            }}
          >
            <option value="woman">女角色</option>
            <option value="man">男角色</option>
          </select>
        </label>
        <button
          onClick={() => void props.onClaimSeat(props.selected)}
          title="占用工位后角色会自动走过去坐下"
        >
          坐到 {props.selected + 1} 号工位
        </button>
        <button onClick={() => void props.onClaimSeat(null)}>起身</button>
        <span role="status">{actorState}</span>
      </div>
      <div className="scene-help">
        左键 / WASD 行走 · 中键旋转 · 滚轮朝鼠标缩放 · Shift＋中键平移
      </div>
    </div>
  );
}
