import * as THREE from "three";
import {
  loadCharacter,
  releaseCharacter,
  type LoadedCharacter,
} from "./characterModel";
import type { CharacterId } from "./characters";
import { AutoSitPose } from "./autoSitPose";
import {
  applySitPose,
  blendPoses,
  SIT_POSES,
  STANDING_POSE,
  type SitPoseId,
} from "./sitPoses";
import { findPath, segmentWalkable } from "./navigation";
import { SEAT_HEIGHT } from "./seats";
import { sittingSpot, type SittingSpot } from "./sittingSpots";
import { groundSeatedFeet } from "./seatedFeet";
import { placeSeatedHands } from "./seatedHands";
import { snapStandingPose } from './standingPose';

/** Seconds for sitting down. Standing up is an immediate pose change. */
const SIT_TRANSITION = 0.9;

export class OfficeAvatar {
  root = new THREE.Group();
  private model?: THREE.Group;
  private character?: LoadedCharacter;
  private mixer?: THREE.AnimationMixer;
  private idle?: THREE.AnimationAction;
  private walk?: THREE.AnimationAction;
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
  async load(id: CharacterId) {
    this.stand();
    const token = ++this.token;
    this.report("角色载入中…");
    try {
      const loaded = await loadCharacter(id);
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
      this.bones = loaded.bones;
      this.root.add(loaded.model);
      this.current = undefined;
      this.sitBlend = 0;
      this.sitTarget = 0;
      this.sitting = false;
      this.play(false);
      this.report("已就绪 · 点击地面行走");
    } catch {
      this.report("角色加载失败，请刷新重试");
    }
  }
  /** Choose which seated pose to hold once sitting. */
  setPose(pose: SitPoseId) {
    this.seatedPose = pose;
  }
  private play(moving: boolean) {
    const next = moving ? this.walk : this.idle;
    if (!next || this.current === next) return;
    this.current?.fadeOut(0.18);
    next.reset().fadeIn(0.18).play();
    this.current = next;
  }
  /** Stop the movement clips so the procedural seated pose owns the bones. */
  private stopClips() {
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
      this.root.position.set(seat.stand.x, 0, seat.stand.z);
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
    const target = new THREE.Vector3(seat.stand.x, 0, seat.stand.z);
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
  private poseSit(dt: number) {
    if (!this.model || !this.character) return;
    const pose = blendPoses(
      STANDING_POSE,
      SIT_POSES[this.seatedPose],
      this.sitBlend,
    );
    applySitPose(
      this.root,
      this.bones,
      this.character.rest,
      pose,
      (this.poseTime += dt),
    );
    const target = this.hipHeight(this.sitBlend);
    this.model.position.y =
      this.character.groundY + (target - this.character.restHipHeight);
    if (this.sitBlend >= 0.999) groundSeatedFeet(this.root, this.character, this.seatedPose);
    if (this.sitBlend >= 0.999 && this.seatedAt?.workstation !== undefined) placeSeatedHands(this.root, this.character, this.seatedPose);
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
      const next = this.root.position
        .clone()
        .addScaledVector(direction, dt * 1.65);
      if (segmentWalkable(this.root.position.x, this.root.position.z, next.x, next.z)) {
        this.root.position.copy(next);
        moving = direction.lengthSq() > 0;
      }
      if (moving) this.root.rotation.set(0, Math.atan2(direction.x, direction.z), 0);
    } else if (!this.sitBlend && !this.sitTarget && this.path.length && this.model) {
      let remaining = dt * 1.65;
      const frameStart = this.root.position.clone();
      while (this.path.length && remaining > 0) {
        const direction = this.path[0].clone().sub(this.root.position);
        direction.y = 0;
        const distance = direction.length();
        if (distance <= remaining) {
          this.root.position.x = this.path[0].x;
          this.root.position.z = this.path[0].z;
          remaining -= distance;
          this.path.shift();
        } else {
          this.root.position.addScaledVector(direction, remaining / distance);
          remaining = 0;
        }
      }
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
        this.root.position.set(seat.x, 0, seat.z);
        this.root.rotation.set(0, seat.angle, 0);
        this.sitTarget = 1;
        this.seatedAt = spot;
        this.pendingSeat = null;
      }
    }
    this.moving = moving;
    this.sitting = this.sitTarget === 1 && this.sitBlend >= 0.999;
    const nextPose = this.autoPose.update(dt, this.sitting && this.seatedAt?.workstation !== undefined, this.seatedPose);
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
      this.play(moving);
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

  /** Current motion state, broadcast so other players can see this avatar. */
  getState() {
    const q = this.root.quaternion;
    // XYZ Euler yaw folds past 90 degrees; relay the actual +Z heading.
    const heading = Math.atan2(2 * (q.x * q.z + q.w * q.y), 1 - 2 * (q.x * q.x + q.y * q.y));
    return {
      x: this.root.position.x,
      z: this.root.position.z,
      rot: heading,
      sitting: this.sitting,
      sittingSpot: (this.seatedAt ?? this.pendingSeat)?.id ?? null,
      moving: this.moving,
      pose: this.seatedPose,
    };
  }
}
