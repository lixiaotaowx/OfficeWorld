import { attachSittingSpots } from "./sittingSpots";
import { attachMonitorContext } from './monitorContext';
import MonitorContextMenu from './MonitorContextMenu';
import { disposeResources } from './disposeResources';
import { WallCutaway } from "./wallCutaway";
import { workstationView, updateWorkstationClip } from './workstationView';
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadOfficeAsset } from './officeAsset';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OfficeAvatar } from "./OfficeAvatar";
import { RemoteAvatars, type RemoteState } from "./RemoteAvatars";
import { MonitorScreens } from "./monitorScreens";
import { WORKSTATIONS } from "./seats";
import { bakedAwareMaterial } from "./bakedMaterials";
import { attachMeetingWallPhoto } from "./meetingWallPhoto";
import { installSceneProbe } from "./sceneProbe";
import { pickSceneSurface, SceneClickGesture } from "./scenePicking";
import { SceneLoop, observeSceneVisibility } from "./sceneLoop";
import "./avatar.css";
import { type CharacterId } from "./characters";
import type { Motion, Person } from "./types";
import { NameTags } from "./nameTags";
import { VIEWS, nameTagItems, remoteStates, type View } from "./sceneViews";

// The camera presets and the per-player helpers live in sceneViews.ts; this
// module re-exports the view type so existing importers keep working.
export type { View } from "./sceneViews";

interface Props {
  renderPaused?: boolean;
  onResumeRendering?: () => void;
  /** Keep painting while unfocused, because our screen is being watched. */
  keepRendering?: boolean;
  mySeat: number | null;
  people: Person[];
  /** Our own socket id: we never draw ourselves as a remote avatar. */
  myId: string;
  previews: Record<string, string>;
  /** Latest motion snapshot per player, relayed by the server. */
  motions: Record<string, Motion>;
  view: View;
  focusSeat: { seat: number; nonce: number } | null;
  /** Focus the camera on one person, wherever they are standing or sitting. */
  focusPerson: { id: string; nonce: number } | null;
  onSelect: (seat: number) => void;
  /** Same camera-only action as selecting a member in the side panel. */
  onFocusScreen: (seat: number) => void;
  /** True while the seat picker is up, so clicking a chair claims it. */
  picking: boolean;
  /** Claim a chair by clicking it; only used while `picking` is true. */
  onPick: (seat: number) => void;
  /** Which avatar we wear. Owned by the app so the picker can set it too. */
  character: CharacterId;
  /** Publish our own motion so everybody else can draw us. */
  onMotion: (motion: Motion) => void;
  onSit: (spot: string | null) => Promise<boolean>;
  /** A public seat the office assigned to us (visitors are placed on a sofa). */
  sitSpot?: string | null;
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
export default function OfficeScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const [status, setStatus] = useState("正在载入办公室");
  const [screenMenu, setScreenMenu] = useState<{ x: number; y: number } | null>(null);
  const actor = useRef<OfficeAvatar>();
  const [actorState, setActorState] = useState("角色载入中…");
  const [stats, setStats] = useState("");
  const api = useRef<{
    focus: (v: View) => void;
    screen: (seat: number) => void;
    person: (id: string) => void;
  }>();
  const monitorsRef = useRef<MonitorScreens>();
  const remotesRef = useRef<RemoteAvatars>();
  const loopRef = useRef<SceneLoop>();
  useEffect(() => { loopRef.current?.setPaused(!!props.renderPaused); }, [props.renderPaused]);
  useEffect(() => { loopRef.current?.setBackgroundDraws(!!props.keepRendering); }, [props.keepRendering]);
  const mySeat = props.mySeat;
  useEffect(() => {
    if (!props.people.some(p => p.id === props.myId)) actor.current?.standUp();
  }, [props.people, props.myId]);
  useEffect(() => {
    api.current?.focus(props.view);
  }, [props.view]);
  useEffect(() => {
    if (props.focusSeat) api.current?.screen(props.focusSeat.seat);
  }, [props.focusSeat]);
  useEffect(() => {
    if (props.focusPerson) api.current?.person(props.focusPerson.id);
  }, [props.focusPerson]);
  // The app owns the character choice (the first-visit dialog sets it too), so
  // the avatar simply follows it.
  useEffect(() => {
    const avatar = actor.current;
    void avatar?.load(props.character).then(() => {
      const seat = latest.current.mySeat;
      if (seat != null) avatar.sit(seat);
    });
  }, [props.character]);
  // Push each occupant's broadcast thumbnail onto their own workstation screen.
  // The preview map is the ambient, unreadably small JPEG; nothing here grants
  // access to the real video stream, which still needs an approved request.
  useEffect(() => {
    const monitors = monitorsRef.current;
    if (!monitors) return;
    syncMonitors(monitors, props);
  }, [props.people, props.previews]);
  // The avatar follows whichever desk the server says we hold, so claiming one
  // in the picker walks us over and sits us down.
  const lastSeat = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (lastSeat.current === mySeat) return;
    const first = lastSeat.current === undefined;
    lastSeat.current = mySeat;
    // At startup there is nothing to undo.
    if (first && mySeat === null) return;
    if (mySeat === null) actor.current?.standUp();
    else actor.current?.sit(mySeat);
  }, [mySeat]);
  // The office can place somebody directly (a visiting client is put on a sofa), in
  // which case the avatar walks over and sits down. Applied once per assignment so
  // it never fights the user walking around afterwards.
  const appliedSpot = useRef<string | null>(null);
  useEffect(() => {
    const spot = props.sitSpot ?? null;
    if (!spot || appliedSpot.current === spot) return;
    appliedSpot.current = spot;
    void actor.current?.sitAt(spot);
  }, [props.sitSpot]);
  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor("#c4ccc0");
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // AgX with a small exposure lift is what the bake was verified against in
    // Blender; the baked albedos are tone mapped here rather than in-camera.
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.11;
    el.appendChild(renderer.domElement);
    const world = new THREE.Scene();
    const wallCutaway = new WallCutaway();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
    const avatar = new OfficeAvatar(world, camera, setActorState, id => latest.current.onSit(id));
    actor.current = avatar;
    // Load the character here too: the `[props.character]` effect above runs
    // before this mount effect, so on the first render `actor.current` was
    // still empty and skipped the load. Loading now makes the avatar appear.
    void avatar.load(latest.current.character).then(() => {
      const seat = latest.current.mySeat;
      if (seat != null) avatar.sit(seat);
      else if (latest.current.sitSpot) void avatar.sitAt(latest.current.sitSpot);
    });
    const remotes = new RemoteAvatars(world);
    remotesRef.current = remotes;
    const nameTags = new NameTags();
    const personPosition = (id: string) => {
      const root = id === latest.current.myId ? avatar.root : remotes.objectOf(id);
      return root
        ? ([root.position.x, root.position.y, root.position.z] as [number, number, number])
        : null;
    };
    // Diagnostic hook. Available while developing and on a deployed build only
    // when explicitly asked for with ?debug=1, so it is not exposed by default.
    let removeProbe: (() => void) | undefined;
    // Filled in below; the probe only reads it when a diagnostic asks (the scene's
    // camera travels on its own until a view settles).
    const controlsHolder: { current?: OrbitControls } = {};
    if (
      import.meta.env.DEV ||
      new URLSearchParams(location.search).has("debug")
    ) {
      removeProbe = installSceneProbe({
        monitors: () => monitorsRef.current,
        remotes,
        avatar,
        world,
        camera,
        renderStats: () => loopRef.current?.stats,
        nameTags: () => nameTags.info(),
        personPosition,
        controls: () => controlsHolder.current,
      });
    }
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsHolder.current = controls;
    controls.enableDamping = true;
    controls.mouseButtons = {
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minDistance = 0.45;
    controls.maxDistance = 65;
    const goalPosition = new THREE.Vector3();
    const goalTarget = new THREE.Vector3();
    let traveling = true;
    let focusedWorkstation = false;
    api.current = {
      screen(index) {
        const seat = WORKSTATIONS[index];
        if (!seat) return;
        const panel = monitorsRef.current?.meshFor(index);
        goalTarget.copy(panel ? panel.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(seat.display.x, seat.display.y, seat.display.z));
        goalPosition.copy(workstationView(seat, goalTarget, camera.aspect).position);
        focusedWorkstation = true;
        traveling = true;
      },
      focus(view) {
        focusedWorkstation = false;
        goalPosition.fromArray(VIEWS[view][0]);
        goalTarget.fromArray(VIEWS[view][1]);
        traveling = true;
      },
      person(id) {
        const root = id === latest.current.myId ? avatar.root : remotes.objectOf(id);
        if (!root) return;
        focusedWorkstation = false;
        goalTarget.copy(root.position);
        goalTarget.y += 1.05;
        // Stand off on the side the camera is already on, so the shot does not
        // swing through the room (or through a wall) on its way there.
        const away = camera.position.clone().sub(goalTarget);
        away.y = 0;
        if (away.lengthSq() < 0.04) away.set(0, 0, 1);
        goalPosition.copy(goalTarget).addScaledVector(away.normalize(), 3.4);
        goalPosition.y = goalTarget.y + 0.6;
        traveling = true;
      },
    };
    api.current.focus(latest.current.view);
    camera.position.copy(goalPosition);
    controls.target.copy(goalTarget);
    controls.addEventListener("start", () => {
      traveling = false;
    });
    // Baked surfaces are drawn unlit and skip tone mapping (see
    // bakedMaterials.ts), so the lights only serve the avatars and the few
    // props the bake did not touch. Kept moderate so those do not blow out.
    world.add(new THREE.HemisphereLight(0xffffff, 0x9ca797, 1.1));
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.6);
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
    // Context around the building, not part of it: unlit and muted so it does
    // not compete with the baked room (the office floor is in the baked model).
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshBasicMaterial({ color: 0x9aa396 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    world.add(ground);
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
      tick = 0,
      sinceReport = 0;
    /** Cached remote-avatar map, keyed by the snapshot identities it was built from. */
    let remoteCache: { people: Props['people']; motions: Props['motions']; myId: string;
      states: Map<string, RemoteState> } | null = null;
    const monitors = new MonitorScreens();
    monitorsRef.current = monitors;
    const stopLoading = loadOfficeAsset(
      renderer,
      (gltf) => {
        if (stopped) { disposeResources(gltf.scene); return; }
        gltf.scene.traverse((o) => {
          if (typeof o.userData.seat_index === "number") o.userData.seat = o.userData.seat_index;
          if (!(o instanceof THREE.Mesh)) return;
          const name = o.name.toLowerCase();
          if (name.includes("glass") || name.includes("glazing")) {
            o.material = glass;
            o.castShadow = false;
            o.receiveShadow = false;
            return;
          }
          // Baked faces already carry their own lighting, so they are drawn
          // unlit and take no runtime shadows. Props the bake did not touch
          // keep their own material and are still lit by the scene.
          o.material = bakedAwareMaterial(o.material);
          o.castShadow = false;
          o.receiveShadow = false;
        });
        // Hand every per-seat screen its own material so a thumbnail can be
        // painted on it without touching the other monitors.
        monitors.attach(gltf.scene, screenMat);
        // Chairs carry their seat in their name ("Island_A_Seat_1 approved
        // chair"), not in an extra, so tag the chair object with its seat index
        // for the click-to-select/claim raycast below. A chair is a multi-
        // primitive group in glTF, so tag the group itself, not just its Mesh
        // children (which the raycast actually hits). The DISPLAY panel has the
        // seat_id extra but is hidden and replaced by our own screen quad.
        gltf.scene.traverse((o) => {
          const match = /^(.+?)[ _]approved[ _](chair|monitor)$/.exec(o.name || "");
          if (!match) return;
          const seat = WORKSTATIONS.findIndex((w) => w.id === match[1]);
          if (seat >= 0) {
            o.userData.seat = seat;
            if (match[2] === 'monitor') o.userData.monitorSeat = seat;
          }
        });
        attachSittingSpots(gltf.scene);
        wallCutaway.attach(gltf.scene);
        // The meeting room's wall display shows the office photo (user, 2026-09-15).
        attachMeetingWallPhoto(gltf.scene);
        world.add(gltf.scene);
        // Thumbnails that arrived while the model was still loading.
        syncMonitors(monitors, latest.current);
        setStatus("办公室已就绪");
      },
      (p) => {
        if (p.total)
          setStatus(`正在载入 ${Math.round((p.loaded / p.total) * 100)}%`);
      },
      () => {
        setStatus("模型加载失败，请刷新重试");
      },
    );
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const gesture = new SceneClickGesture();
    const start = (e: PointerEvent) => { if (!latest.current.renderPaused) gesture.start(e); };
    const move = (e: PointerEvent) => gesture.move(e);
    const cancel = () => gesture.cancel();
    const end = (e: PointerEvent) => {
      if (latest.current.renderPaused || !gesture.end(e)) return;
      const r = el.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      ray.near = camera.near;
      const hits = ray.intersectObjects(world.children, true);
      const picked = pickSceneSurface(hits);
      if (picked?.kind === 'monitor') {
        latest.current.onFocusScreen(picked.seat);
        return;
      }
      if (picked?.kind === 'public-seat') {
        void avatar.sitAt(picked.spot);
        return;
      }
      if (picked?.kind === 'seat') {
          const seat = picked.seat;
          if (latest.current.picking) latest.current.onPick(seat);
          else {
            avatar.sit(seat);
            latest.current.onSelect(seat);
          }
          return;
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
    el.addEventListener("pointermove", move);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointerup", end);
    const stopContext = attachMonitorContext(el, camera, world,
      () => latest.current.mySeat, setScreenMenu);
    const resize = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(el);
    const loop = new SceneLoop((dt) => {
      avatar.update(dt);
      sinceReport += dt;
      if (sinceReport >= 0.07) {
        sinceReport = 0;
        latest.current.onMotion(avatar.getState());
      }
    }, (dt) => {
      if (traveling) {
        const blend = 1 - Math.pow(1 - 0.075, dt * 60);
        camera.position.lerp(goalPosition, blend);
        controls.target.lerp(goalTarget, blend);
        if (camera.position.distanceTo(goalPosition) < 0.01) traveling = false;
      }
      controls.dampingFactor = 1 - Math.pow(0.95, dt * 60);
      controls.update();
      updateWorkstationClip(camera, controls.target, focusedWorkstation);
      wallCutaway.update(camera, controls.target, dt);
      // Draw the other players, then tell the server where we are. Reporting is
      // throttled: the server would reject a faster stream anyway.
      // The map is rebuilt only when the snapshots change: doing it every frame
      // allocated a map plus one object per colleague, sixty times a second.
      const people = latest.current.people;
      const motions = latest.current.motions;
      const myId = latest.current.myId;
      if (!remoteCache || remoteCache.people !== people || remoteCache.motions !== motions ||
          remoteCache.myId !== myId) {
        remoteCache = { people, motions, myId, states: remoteStates({ people, motions, myId }) };
      }
      remotes.sync(remoteCache.states);
      remotes.update(dt);
      // Names follow the characters: the tag set only changes when somebody
      // joins, leaves or is renamed, but it is cheap enough to check per frame.
      nameTags.sync(nameTagItems({ people, motions, myId }, avatar, remotes));
      // Sized in CSS pixels, so the display height is what matters here.
      nameTags.render(camera, renderer.domElement.clientHeight);
      renderer.render(world, camera);
      if (++tick % 120 === 0) {
        setStats(`${renderer.info.render.triangles.toLocaleString()} 面`);
      }
    }, () => traveling || avatar.getState().moving || latest.current.people.some(p =>
      p.id !== latest.current.myId && latest.current.motions[p.id]?.moving));
    loopRef.current = loop;
    loop.setPaused(!!latest.current.renderPaused);
    loop.setBackgroundDraws(!!latest.current.keepRendering);
    const stopObserving = observeSceneVisibility(el, loop);
    return () => {
      stopLoading();
      stopContext();
      stopped = true;
      removeProbe?.();
      avatar.dispose();
      remotes.dispose();
      nameTags.dispose();
      remotesRef.current = undefined;
      stopObserving();
      loop.dispose();
      loopRef.current = undefined;
      resize.disconnect();
      controls.dispose();
      wallCutaway.dispose();
      monitors.dispose();
      monitorsRef.current = undefined;
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("pointerup", end);
      disposeResources(world);
      sun.shadow.dispose();
      glass.dispose();
      screenMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="scene-shell">
      <div className="scene" ref={host} />
      {screenMenu && <MonitorContextMenu point={screenMenu} close={() => setScreenMenu(null)} />}
      {props.renderPaused && <div className="scene-paused">
        <p>三维画面已暂停，语音、共享和聊天继续</p>
        <button onClick={props.onResumeRendering}>恢复三维画面</button>
      </div>}
      <div className="scene-corner-status" role="status">{status.includes('失败') ? status : /失败|无法/.test(actorState) ? actorState : ''}</div>
    </div>
  );
}
