import { updateBuildFlags } from './buildArchitecture';
import { buildEnvironment } from './buildEnvironment';
import { useBuildEditor } from './useBuildEditor';
import { attachMonitorContext } from './monitorContext';
import { disposeResources } from './disposeResources';
import { workstationView, updateWorkstationClip } from './workstationView';
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OfficeAvatar } from "./OfficeAvatar";
import { RemoteAvatars, type RemoteState } from "./RemoteAvatars";
import { MonitorScreens, syncMonitors } from "./monitorScreens";
import { WORKSTATIONS, workstationAt } from "./seats";
import { installSceneProbe } from "./sceneProbe";
import { pickSceneSurface, SceneClickGesture } from "./scenePicking";
import { SceneLoop, observeSceneVisibility } from "./sceneLoop";
import "./avatar.css";
import { type Appearance } from "./look";
import type { Motion, Person } from "./types";
import { NameTags } from "./nameTags";
import { VIEWS, nameTagItems, remoteStates, type View } from "./sceneViews";

// The camera presets and the per-player helpers live in sceneViews.ts; this
// module re-exports the view type so existing importers keep working.
export type { View } from "./sceneViews";

interface Props {
  accountId: string;
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
  /** 我们的配色与配件；住在 App 里，所以捏人面板也能改。 */
  appearance: Appearance;
  /** Publish our own motion so everybody else can draw us. */
  onMotion: (motion: Motion) => void;
  onSit: (spot: string | null) => Promise<boolean>;
  /** A public seat the office assigned to us (visitors are placed on a sofa). */
  sitSpot?: string | null;
  /** 打开"切换屏幕"菜单：画面里右键自己的显示器，或成员列表里右键自己。 */
  onOpenScreenMenu?: (point: { x: number; y: number }) => void;
}

export default function OfficeScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const builder = useBuildEditor(props.accountId);
  const latest = useRef(props);
  latest.current = props;
  const [status, setStatus] = useState("正在载入办公室");
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
  // 换配色/换配件只套用材质与显隐，**不重新加载模型**（捏人时每点一下都会变）。
  useEffect(() => {
    actor.current?.applyAppearance(props.appearance);
  }, [props.appearance]);
  // Push each occupant's broadcast thumbnail onto their own workstation screen.
  // The preview map is the ambient, unreadably small JPEG; nothing here grants
  // access to the real video stream, which still needs an approved request.
  useEffect(() => {
    const monitors = monitorsRef.current;
    if (!monitors) return;
    syncMonitors(monitors, props);
  }, [props.people, props.previews, builder.revision]);
  // The avatar follows whichever desk the server says we hold, so claiming one
  // in the picker walks us over and sits us down.
  const lastSeat = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if(mySeat!==null && mySeat>=9 && builder.revision<0)return;
    if (lastSeat.current === mySeat) return;
    const first = lastSeat.current === undefined;
    lastSeat.current = mySeat;
    // At startup there is nothing to undo.
    if (first && mySeat === null) return;
    if (mySeat === null) actor.current?.standUp();
    else actor.current?.sit(mySeat);
  }, [mySeat,builder.revision]);
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor("#c7d8ee");
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // AgX with a small exposure lift is what the bake was verified against in
    // Blender; the baked albedos are tone mapped here rather than in-camera.
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.11;
    el.appendChild(renderer.domElement);
    const world = new THREE.Scene();
    world.fog = new THREE.Fog('#c7d8ee', 40, 85);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
    const avatar = new OfficeAvatar(world, camera, setActorState, id => latest.current.onSit(id));
    actor.current = avatar;
    // Load the character here too: the appearance effect above runs before this
    // mount effect, so on the first render `actor.current` was still empty and
    // skipped the load. Loading now makes the avatar appear.
    void avatar.load(latest.current.appearance).then(() => {
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
        sendMotion: motion => latest.current.onMotion(motion as Motion),
        canvasSize: () => ({
          width: renderer.domElement.clientWidth || 1,
          height: renderer.domElement.clientHeight || 1,
        }),
        setPartVisible: (name, visible) => {
          let found = false;
          avatar.root.traverse(object => {
            const mesh = object as THREE.Mesh;
            if (mesh.isMesh && mesh.name === name) { mesh.visible = visible; found = true; }
          });
          return found;
        },
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
    controls.maxDistance = Infinity;
    const goalPosition = new THREE.Vector3();
    const goalTarget = new THREE.Vector3();
    let traveling = true;
    let focusedWorkstation = false;
    api.current = {
      screen(index) {
        const seat = workstationAt(index);
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
    world.add(new THREE.HemisphereLight(0xfff6eb, 0xa5b6df, 1.75));
    const sun = new THREE.DirectionalLight(0xffeed9, 2.3);
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
    buildEnvironment(world);
    monitors.attachBoxScreens(world, screenMat);
    syncMonitors(monitors, latest.current);
    const buildController = builder.attach(world, camera, renderer.domElement, box => {
      focusedWorkstation=false;
      box.getCenter(goalTarget);
      const away=camera.position.clone().sub(controls.target).normalize();
      const span=Math.max(...box.getSize(new THREE.Vector3()).toArray(),1.5);
      goalPosition.copy(goalTarget).addScaledVector(away,span*2.3/Math.min(1,Math.max(.35,camera.aspect)));
      traveling=true;
    }, locked => { controls.enabled=!locked; if(locked)controls.dispatchEvent({type:'start'}); },
    target => avatar.teleportTo(target,target.heading),
    () => ({x:avatar.root.position.x, z:avatar.root.position.z}));
    const refreshBuild = () => buildController.refresh();
    const leaveBuild = () => buildController.leave();
    controls.addEventListener('change',refreshBuild);
    el.addEventListener('pointerleave',leaveBuild);
    setStatus('方块空间已就绪');
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const gesture = new SceneClickGesture();
    const start = (e: PointerEvent) => { if (!latest.current.renderPaused) gesture.start(e); };
    const move = (e: PointerEvent) => { gesture.move(e); buildController.move(e); };
    const cancel = () => gesture.cancel();
    const end = (e: PointerEvent) => {
      if (latest.current.renderPaused || !gesture.end(e)) return;
      if (buildController.click(e)) return;
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
      if (picked?.kind === 'surface' && picked.hit.face && picked.hit.face.normal.y > 0.9) {
        avatar.moveTo(picked.hit.point);
        return;
      }
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
      () => latest.current.mySeat, point => latest.current.onOpenScreenMenu?.(point));
    const resize = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(el);
    const loop = new SceneLoop((dt) => {
      avatar.update(dt);
      updateBuildFlags(world,performance.now()/1000);
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
      controls.maxPolarAngle = buildController.isEditing() ? Math.PI * .95 : Math.PI * .47;
      controls.update();
      const viewDistance=camera.position.distanceTo(controls.target);
      const far=Math.max(150,camera.position.length()+controls.target.length()+viewDistance*4);
      if(Math.abs(camera.far-far)>1){camera.far=far;camera.updateProjectionMatrix();}
      if(world.fog instanceof THREE.Fog) {
        world.fog.near=Math.max(40,viewDistance*2);
        world.fog.far=Math.max(85,viewDistance*4);
      }
      updateWorkstationClip(camera, controls.target, focusedWorkstation && !buildController.isEditing());

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
      buildController.dispose();
      controls.removeEventListener('change',refreshBuild);
      el.removeEventListener('pointerleave',leaveBuild);
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

      monitors.dispose();
      monitorsRef.current = undefined;
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("pointerup", end);
      disposeResources(world);
      sun.shadow.dispose();

      screenMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="scene-shell">
      <div className="scene" ref={host} />
      {!props.renderPaused && builder.ui}
      {props.renderPaused && <div className="scene-paused">
        <p>三维画面已暂停，语音、共享和聊天继续</p>
        <button onClick={props.onResumeRendering}>恢复三维画面</button>
      </div>}
      <div className="scene-corner-status" role="status">{status.includes('失败') ? status : /失败|无法/.test(actorState) ? actorState : ''}</div>
    </div>
  );
}
