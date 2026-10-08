import * as THREE from "three";
import {
  findBone,
  loadCharacter,
  releaseCharacter,
  setCharacterAppearance,
  type LoadedCharacter,
} from "./characterModel";
import { DEFAULT_APPEARANCE, type Appearance } from "./look";
import { AutoSitPose } from "./autoSitPose";
import {
  applySitPose,
  blendPoses,
  SIT_POSES,
  STANDING_POSE,
  type SitPoseId,
} from "./sitPoses";
import { findPath, pathLength, traverse } from "./navigation";
import { advancePath } from './avatarPath';
import { SEAT_HEIGHT } from "./seats";
import { sittingSpot, type SittingSpot } from "./sittingSpots";
import { groundSeatedFeet } from "./seatedFeet";
import { placeSeatedHands } from "./seatedHands";
import { snapStandingPose } from './standingPose';
import { updateSeatedAnimation } from './seatedAnimation';

/** Seconds for sitting down. Standing up is an immediate pose change. */
const SIT_TRANSITION = 0.9;
/** 步行 / 跑步速度（m/s）：尺子角色的腿只有 24+13cm，走快了才不显得"板子在飘"。 */
const WALK_SPEED = 1.65;
const RUN_SPEED = 3.1;
/** 路径比这还长就跑起来（点击远处地面时不必慢慢挪）。 */
const RUN_DISTANCE = 4;

/** 坐姿几何的诊断读数（`src/sitDiagnostics.ts` 也用它）。 */
export interface SitDiagnostics {
  sitBlend: number;
  sitTarget: number;
  seatHeight: number;
  seatedOffset: number | null;
  seatedClipHip: number;
  usingSeatedClip: boolean;
  restHipHeight: number;
  groundY: number;
  modelY: number;
  hasHips: boolean;
}

export class OfficeAvatar {
  root = new THREE.Group();
  private model?: THREE.Group;
  private character?: LoadedCharacter;
  private mixer?: THREE.AnimationMixer;
  private idle?: THREE.AnimationAction;
  private walk?: THREE.AnimationAction;
  private run?: THREE.AnimationAction;
  private current?: THREE.AnimationAction;
  private path: THREE.Vector3[] = [];
  private bones = new Map<string, THREE.Bone>();
  private keys = new Set<string>();
  private moving = false;
  private token = 0;
  private disposed = false;
  private clock = new THREE.Clock();
  private lastState = "";
  // Sitting down blends toward 1; standing resets the pose directly to 0.
  private sitBlend = 0;
  private sitTarget = 0;
  private sitting = false;
  private seatedPose: SitPoseId = "standard";
  private autoPose = new AutoSitPose();
  private pendingSeat: SittingSpot | null = null;
  private seatedAt: SittingSpot | null = null;
  private sitRequest = 0;
  private hasReservation = false;
  private seatHeight = SEAT_HEIGHT;
  private poseTime = 0;
  /** 坐姿下髋部相对模型原点的高度，加载后实测一次（见 measureSeatedOffset）。 */
  private seatedOffset: number | null = null;
  /** 已授权的坐姿动作（`坐姿打字_Type`）；有它就用它，没有才退回程序化摆姿势。 */
  private seatedClip?: THREE.AnimationAction;
  /** 当前移动速度（m/s）：决定放走路还是跑步循环。 */
  private speed = 0;
  /** 坐姿动作里髋部自身的世界高度（实测），用来把工位高度对齐过去。 */
  private seatedClipHip = 0;

  constructor(
    private world: THREE.Scene,
    private camera: THREE.Camera,
    private report: (text: string) => void,
    private reserve: (id: string | null) => Promise<boolean>,
  ) {
    this.root.position.set(4, 0, 4);
    this.root.name = "Controlled avatar";
    world.add(this.root);
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    window.addEventListener("blur", this.blur);
    // The model is loaded by the caller, which owns the character choice.
  }
  private keydown = (e: KeyboardEvent) => {
    if (
      (e.target as HTMLElement)?.closest(
        "input,textarea,select,[contenteditable]",
      )
    )
      return;
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.code)
    ) {
      e.preventDefault();
      this.stand();
      this.keys.add(e.code);
    }
  };
  private keyup = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private blur = () => this.keys.clear();
  async load(appearance: Appearance = DEFAULT_APPEARANCE) {
    this.stand();
    const token = ++this.token;
    this.report("角色载入中…");
    try {
      const loaded = await loadCharacter(appearance);
      if (this.disposed || token !== this.token) {
        releaseCharacter(loaded);
        return;
      }
      if (this.character) {
        this.root.remove(this.character.model);
        releaseCharacter(this.character);
      }
      this.character = loaded;
      this.model = loaded.model;
      this.mixer = loaded.mixer;
      this.idle = loaded.idle;
      this.walk = loaded.walk;
      this.run = loaded.run;
      this.bones = loaded.bones;
      this.root.add(loaded.model);
      this.current = undefined;
      this.sitBlend = 0;
      this.sitTarget = 0;
      this.sitting = false;
      this.seatedOffset = null;   // 换了模型，坐姿偏移要重新实测
      this.play(false);
      this.report("已就绪 · 点击地面行走");
    } catch {
      this.report("角色加载失败，请刷新重试");
    }
  }
  /**
   * 换配色/换配件：模型、动画、坐姿全不动，只改材质与配件显隐。
   * 捏人面板每点一下都会走这里，所以绝不能重新加载模型。
   */
  applyAppearance(appearance: Appearance) {
    if (this.character) setCharacterAppearance(this.character, appearance);
    else void this.load(appearance);
  }
  /** Choose which seated pose to hold once sitting. */
  setPose(pose: SitPoseId) {
    if (pose !== this.seatedPose) this.seatedOffset = null;   // 换姿势要重量偏移
    this.seatedPose = pose;
  }
  private play(moving: boolean, running = false) {
    // 长距离移动用跑步循环（用户 2026-09-23：「动作库都可以直接用」）：这块板子腿很短，
    // 走完整间办公室太慢；跑步那条是自带的循环动作，接上就能用。
    const next = moving ? (running && this.run ? this.run : this.walk) : this.idle;
    if (!next || this.current === next) return;
    this.current?.fadeOut(0.18);
    next.reset().fadeIn(0.18).play();
    this.current = next;
  }
  /** Stop the movement clips so the seated pose (授权动作或程序化) owns the bones. */
  private stopClips() {
    // 坐姿动作本身就是 `this.current`，不能连它一起停掉。
    if (this.current === this.seatedClip) return;
    this.current?.stop();
    this.current = undefined;
  }
  private stand(release = true) {
    const wasSeated = this.sitBlend > 0 || this.sitTarget > 0;
    if (release) {
      this.sitRequest++;
      if (this.hasReservation) void this.reserve(null);
      this.hasReservation = false;
    }
    // Switch straight to the chair's walkway position, clear of its geometry.
    if (this.seatedAt !== null) {
      const seat = this.seatedAt;
      this.root.position.set(seat.stand.x, seat.stand.y ?? 0, seat.stand.z);
    }
    this.path = [];
    this.sitBlend = 0;
    this.sitTarget = 0;
    this.seatedAt = null;
    this.pendingSeat = null;
    this.sitting = false;
    this.moving = false;
    if (wasSeated && this.character) this.current = snapStandingPose(this.character);
  }
  moveTo(target: THREE.Vector3) {
    this.stand();
    this.path = findPath(this.root.position, target);
    if (!this.path.length) this.report("这里无法到达，请点击通道");
  }
  sit(seatIndex: number) {
    void this.sitAt(`desk-${seatIndex}`);
  }
  async sitAt(id: string) {
    const seat = sittingSpot(id);
    if (!this.model || !seat || this.disposed) return false;
    const request = ++this.sitRequest;
    this.hasReservation = true;
    const accepted = await this.reserve(id);
    if (request !== this.sitRequest || this.disposed || !accepted) return false;
    this.stand(false);
    const target = new THREE.Vector3(seat.stand.x, seat.stand.y ?? 0, seat.stand.z);
    this.path = findPath(this.root.position, target);
    if (!this.path.length) {
      this.stand();
      this.report("无法到达这个座位，请先走到附近通道");
      return false;
    }
    this.pendingSeat = seat;
    this.seatedPose = seat.workstation === undefined ? 'relax' : 'standard';
    this.report(`正在走向 ${seat.label}`);
    return true;
  }
  standUp() {
    this.stand();
    this.path = [];
    this.report("已起身");
  }
  /** World Y to place the hips at for the current blend. */
  private hipHeight(blend: number) {
    const pose = blendPoses(STANDING_POSE, SIT_POSES[this.seatedPose], blend);
    const eased = blend * blend * (3 - 2 * blend);
    return (
      (this.character?.restHipHeight ?? 0) +
      (this.seatHeight - (this.character?.restHipHeight ?? 0)) * eased +
      pose.hipDrop * eased
    );
  }
  /**
   * 坐姿下"髋部相对模型原点"的高度**实测一次**。
   *
   * 不能再靠 `seatHeight - restHipHeight` 这种差值：姿势会把腿折起来，髋部相对模型原点
   * 的位置**随骨架而变**。旧角色（Quaternius）下那个差值刚好成立，换成尺子角色（Mixamo）
   * 后坐姿反而把整个人抬高了 0.58m（实测：站姿髋 0.601 → 坐姿 1.178）。
   * 所以：把坐姿摆到模型上量一次，之后每帧都用这个偏移把髋部放到工位高度。
   */
  private measureSeatedOffset(): number | null {
    const character = this.character;
    if (!character) return null;
    const model = character.model;
    const previousY = model.position.y;
    const previousRootY = this.root.position.y;
    try {
      // 先把 root 归零，量到的就是"相对模型原点"的纯几何偏移。
      this.root.position.y = 0;
      model.position.y = 0;
      applySitPose(this.root, this.bones, character.rest, SIT_POSES[this.seatedPose], 0);
      this.root.updateMatrixWorld(true);
      const hips = findBone(this.bones, "Hips");
      if (!hips) return null;
      return hips.getWorldPosition(new THREE.Vector3()).y;
    } catch {
      return null;
    } finally {
      model.position.y = previousY;
      this.root.position.y = previousRootY;
      this.root.updateMatrixWorld(true);
    }
  }
  private stopSeatedClip() {
    if (!this.seatedClip) return;
    this.seatedClip.fadeOut(0.25);
    if (this.current === this.seatedClip) this.current = undefined;
  }
  private poseSit(dt: number) {
    if (!this.model || !this.character) return;
    if (this.sitBlend >= .999) {
      const seated = updateSeatedAnimation(this.character, this.seatHeight, dt);
      if (seated) {
        this.current = this.seatedClip = seated.action;
        this.seatedClipHip = seated.hip;
        return;
      }
    }
    const pose = blendPoses(
      STANDING_POSE,
      SIT_POSES[this.seatedPose],
      this.sitBlend,
    );
    // 先用（可能是程序化的）姿势把骨骼摆好：起身/落座是插值过渡，那一段继续用它。
    applySitPose(
      this.root,
      this.bones,
      this.character.rest,
      pose,
      (this.poseTime += dt),
    );
    if (this.sitBlend >= 0.999) {
      // 没有坐姿动作（别的模型）才退回程序化 + IK。
      this.stopSeatedClip();
      if (this.seatedOffset === null) this.seatedOffset = this.measureSeatedOffset();
      const target = this.hipHeight(this.sitBlend);
      const localHips = this.seatedOffset
        ?? (this.character.restHipHeight - this.character.groundY);
      // root 的 y 是这个人脚下的地面高度；模型偏移 = 目标髋高 - 该姿势下髋部相对原点的高度。
      this.model.position.y = target - localHips;
      groundSeatedFeet(this.root, this.character, this.seatedPose);
      if (this.seatedAt?.workstation !== undefined) {
        placeSeatedHands(this.root, this.character, this.seatedPose);
      }
      return;
    }
    // 过渡中（坐下 / 起身）
    this.stopSeatedClip();
    const target = this.hipHeight(this.sitBlend);
    const localHips = this.seatedOffset
      ?? (this.character.restHipHeight - this.character.groundY);
    this.model.position.y = target - localHips;
  }
  update(elapsed?: number) {
    const dt = Math.min(elapsed ?? this.clock.getDelta(), 0.1);
    let moving = false;
    // Blend only while sitting down; standing can move on its first frame.
    if (this.sitBlend < this.sitTarget) {
      const step = dt / SIT_TRANSITION;
      this.sitBlend = Math.min(1, this.sitBlend + step);
    }
    if (!this.sitBlend && !this.sitTarget && this.keys.size && this.model) {
      this.path = [];
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0),
      );
      const direction = new THREE.Vector3();
      if (this.keys.has("KeyW") || this.keys.has("ArrowUp"))
        direction.add(forward);
      if (this.keys.has("KeyS") || this.keys.has("ArrowDown"))
        direction.sub(forward);
      if (this.keys.has("KeyD") || this.keys.has("ArrowRight"))
        direction.add(right);
      if (this.keys.has("KeyA") || this.keys.has("ArrowLeft"))
        direction.sub(right);
      direction.normalize();
      // 按 Shift 跑（尺子腿短，走太慢）；路径行走也按距离自动跑。
      const speed = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")
        ? RUN_SPEED : WALK_SPEED;
      this.speed = speed;
      const next = this.root.position
        .clone()
        .addScaledVector(direction, dt * speed);
      const supported = traverse(this.root.position, next);
      if (supported) {
        this.root.position.copy(supported);
        moving = direction.lengthSq() > 0;
      }
      if (moving) this.root.rotation.set(0, Math.atan2(direction.x, direction.z), 0);
    } else if (!this.sitBlend && !this.sitTarget && this.path.length && this.model) {
      // 路很长就跑：先量整条路的长度（点击远处地面时不必让一块板子慢慢挪）。
      const speed = pathLength(this.root.position, this.path) > RUN_DISTANCE ? RUN_SPEED : WALK_SPEED;
      this.speed = speed;
      const frameStart = this.root.position.clone();
      advancePath(this.root.position, this.path, dt * speed);
      const traveled = this.root.position.clone().sub(frameStart);
      moving = traveled.lengthSq() > 0.00000001;
      if (moving) {
        const rotation = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          Math.atan2(traveled.x, traveled.z),
        );
        this.root.quaternion.slerp(rotation, Math.min(1, dt * 12));
      }
      if (!this.path.length && this.pendingSeat !== null) {
        const spot = this.pendingSeat, seat = spot.chair;
        this.seatHeight = spot.height;
        this.root.position.set(seat.x, seat.y ?? 0, seat.z);
        this.root.rotation.set(0, seat.angle, 0);
        this.sitTarget = 1;
        this.seatedAt = spot;
        this.pendingSeat = null;
      }
    }
    this.moving = moving;
    this.sitting = this.sitTarget === 1 && this.sitBlend >= 0.999;
    const nextPose = this.seatedClip?.isRunning()
      ? undefined   // 用授权动作时不切姿势变体（动作里已经是坐姿了）
      : this.autoPose.update(dt, this.sitting && this.seatedAt?.workstation !== undefined, this.seatedPose);
    if (nextPose) this.setPose(nextPose);
    const controlling = this.sitBlend > 0.001 || this.sitTarget === 1;
    if (controlling && this.model) {
      // While seated, furniture orientation owns the heading, not the walk-in path.
      if (this.seatedAt) this.root.rotation.set(0, this.seatedAt.chair.angle, 0);
      // The procedural seated pose is the sole bone writer while seated or
      // tweening, so stop any movement clip before it can fight the pose.
      if (this.current) this.stopClips();
      this.poseSit(dt);
    } else if (this.model) {
      if (this.current === undefined) this.play(false);
      this.play(moving, this.speed > WALK_SPEED + 0.01);
      this.speed = moving ? this.speed : 0;
      this.mixer?.update(dt);
      this.model.position.y = this.character?.groundY ?? 0;
    }
    const state = this.sitting
      ? `已坐在 ${this.seatedAt?.label}`
      : this.sitBlend > 0.001
        ? "入座中…"
        : moving
          ? "行走中"
          : "待机 · 点击地面或 WASD 行走";
    if (state !== this.lastState && this.model) {
      this.report(state);
      this.lastState = state;
    }
  }
  dispose() {
    this.stand();
    this.disposed = true;
    this.token++;
    if (this.character) {
      releaseCharacter(this.character);
      this.character = undefined;
    }
    this.world.remove(this.root);
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    window.removeEventListener("blur", this.blur);
  }

  /** 坐姿几何的诊断读数（`?debug=1` 的探针用它查"坐到椅子上没有"）。
   *  实现细节在 `sitPoses.ts` / `seatedFeet.ts`，这里只把数字拼出来。 */
  sitDiagnostics(): SitDiagnostics {
    return {
      sitBlend: +this.sitBlend.toFixed(3),
      sitTarget: this.sitTarget,
      seatHeight: +this.seatHeight.toFixed(3),
      seatedOffset: this.seatedOffset === null ? null : +this.seatedOffset.toFixed(3),
      seatedClipHip: +this.seatedClipHip.toFixed(3),
      usingSeatedClip: Boolean(this.seatedClip?.isRunning()),
      restHipHeight: +(this.character?.restHipHeight ?? 0).toFixed(3),
      groundY: +(this.character?.groundY ?? 0).toFixed(3),
      modelY: +(this.model?.position.y ?? 0).toFixed(3),
      hasHips: Boolean(findBone(this.bones, "Hips")),
    };
  }

  /** Current motion state, broadcast so other players can see this avatar. */
  getState() {
    const q = this.root.quaternion;
    // XYZ Euler yaw folds past 90 degrees; relay the actual +Z heading.
    const heading = Math.atan2(2 * (q.x * q.z + q.w * q.y), 1 - 2 * (q.x * q.x + q.y * q.y));
    return {
      x: this.root.position.x,
      y: this.root.position.y,
      z: this.root.position.z,
      rot: heading,
      sitting: this.sitting,
      sittingSpot: (this.seatedAt ?? this.pendingSeat)?.id ?? null,
      moving: this.moving,
      /** 长距离/Shift 时在跑：远端据此放跑步循环，不然我跑着他还在慢慢走。 */
      running: this.moving && this.speed > WALK_SPEED + 0.01,
      pose: this.seatedPose,
    };
  }
}


