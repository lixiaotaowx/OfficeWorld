import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { findPath, walkable } from "./navigation";
import { WORKSTATIONS } from "./seats";
export class OfficeAvatar {
  root = new THREE.Group();
  private model?: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private idle?: THREE.AnimationAction;
  private walk?: THREE.AnimationAction;
  private current?: THREE.AnimationAction;
  private path: THREE.Vector3[] = [];
  private sitting = false;
  private pendingSeat: number | null = null;
  private seatedAt: number | null = null;
  private bones = new Map<string, THREE.Bone>();
  private keys = new Set<string>();
  private token = 0;
  private disposed = false;
  private clock = new THREE.Clock();
  private lastState = "";
  constructor(
    private world: THREE.Scene,
    private camera: THREE.Camera,
    private report: (text: string) => void,
  ) {
    this.root.position.set(4, 0, 4);
    this.root.name = "Controlled avatar";
    world.add(this.root);
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    window.addEventListener("blur", this.blur);
    void this.load("woman");
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
      this.keys.add(e.code);
    }
  };
  private keyup = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private blur = () => this.keys.clear();
  async load(kind: "woman" | "man") {
    const token = ++this.token;
    this.report("角色载入中…");
    try {
      const gltf = await new GLTFLoader().loadAsync(
        `/assets/characters/${kind}.glb`,
      );
      if (this.disposed || token !== this.token) return;
      if (this.model) {
        this.root.remove(this.model);
        this.mixer?.stopAllAction();
        this.release(this.model);
      }
      const model = gltf.scene;
      this.model = model;
      this.root.add(model);
      this.bones.clear();
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const scale = 1.72 / (box.max.y - box.min.y);
      model.scale.multiplyScalar(scale);
      model.position.y = -box.min.y * scale;
      model.traverse((o) => {
        if (o instanceof THREE.Bone) this.bones.set(o.name, o);
        if (o instanceof THREE.Mesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      this.mixer = new THREE.AnimationMixer(model);
      this.idle = this.mixer.clipAction(
        gltf.animations.find((a) => a.name === "Idle_Neutral") ||
          gltf.animations.find((a) => a.name === "Idle")!,
      );
      this.walk = this.mixer.clipAction(
        gltf.animations.find((a) => a.name === "Walk")!,
      );
      this.current = undefined;
      this.play(false);
      this.report("已就绪 · 点击地面行走");
    } catch {
      this.report("角色加载失败，请刷新重试");
    }
  }
  private play(moving: boolean) {
    const next = moving ? this.walk : this.idle;
    if (!next || this.current === next) return;
    this.current?.fadeOut(0.18);
    next.reset().fadeIn(0.18).play();
    this.current = next;
  }
  private stand() {
    if (this.sitting && this.seatedAt !== null) {
      const seat = WORKSTATIONS[this.seatedAt];
      this.root.position.set(seat.stand.x, 0, seat.stand.z);
    }
    this.sitting = false;
    this.seatedAt = null;
    this.pendingSeat = null;
    if (this.model) this.model.position.y = 0;
  }
  moveTo(target: THREE.Vector3) {
    this.stand();
    this.path = findPath(this.root.position, target);
    if (!this.path.length) this.report("这里无法到达，请点击通道");
  }
  sit(seatIndex: number) {
    if (!this.model) return;
    this.stand();
    const seat = WORKSTATIONS[seatIndex];
    const target = new THREE.Vector3(seat.stand.x, 0, seat.stand.z);
    this.path = findPath(this.root.position, target);
    if (this.path.length) {
      this.pendingSeat = seatIndex;
      this.report(`正在走向 ${seatIndex + 1} 号工位`);
    } else this.report("无法到达这个工位，请先走到附近通道");
  }
  standUp() {
    this.stand();
    this.path = [];
    this.report("已起身");
  }
  private aimBone(name: string, childName: string, desired: THREE.Vector3) {
    const bone = this.bones.get(name),
      child = this.bones.get(childName);
    if (!bone || !child || !bone.parent) return;
    this.root.updateMatrixWorld(true);
    const from = child
      .getWorldPosition(new THREE.Vector3())
      .sub(bone.getWorldPosition(new THREE.Vector3()))
      .normalize();
    const to = desired
      .clone()
      .applyQuaternion(this.root.quaternion)
      .normalize();
    const delta = new THREE.Quaternion().setFromUnitVectors(from, to);
    const world = bone
      .getWorldQuaternion(new THREE.Quaternion())
      .premultiply(delta);
    bone.quaternion.copy(
      bone.parent
        .getWorldQuaternion(new THREE.Quaternion())
        .invert()
        .multiply(world),
    );
  }
  private poseSit() {
    if (!this.model) return;
    for (const side of ["L", "R"]) {
      this.aimBone(
        `UpperLeg.${side}`,
        `LowerLeg.${side}`,
        new THREE.Vector3(0, -0.08, 1),
      );
      this.aimBone(
        `LowerLeg.${side}`,
        `Foot.${side}`,
        new THREE.Vector3(0, -1, 0.08),
      );
      this.aimBone(
        `UpperArm.${side}`,
        `LowerArm.${side}`,
        new THREE.Vector3(side === "L" ? 0.13 : -0.13, -1, 0.12),
      );
      this.aimBone(
        `LowerArm.${side}`,
        `Wrist.${side}`,
        new THREE.Vector3(0, -0.1, 1),
      );
    }
    this.root.updateMatrixWorld(true);
    const hips = this.bones.get("Hips");
    if (hips)
      this.model.position.y +=
        0.58 - hips.getWorldPosition(new THREE.Vector3()).y;
  }
  update() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    let moving = false;
    if (this.keys.size && this.model) {
      this.stand();
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
      if (walkable(next.x, next.z)) {
        this.root.position.copy(next);
        moving = direction.lengthSq() > 0;
      }
      if (moving) this.root.rotation.y = Math.atan2(direction.x, direction.z);
    } else if (this.path.length && this.model) {
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
        const i = this.pendingSeat,
          seat = WORKSTATIONS[i].chair;
        this.root.position.set(seat.x, 0, seat.z);
        this.root.rotation.y = seat.angle;
        this.sitting = true;
        this.seatedAt = i;
        this.pendingSeat = null;
      }
    }
    this.play(moving);
    this.mixer?.update(dt);
    if (this.sitting) this.poseSit();
    const state = this.sitting
      ? `已坐在 ${this.seatedAt! + 1} 号工位`
      : moving
        ? "行走中"
        : "待机 · 点击地面或 WASD 行走";
    if (state !== this.lastState && this.model) {
      this.report(state);
      this.lastState = state;
    }
  }
  private release(model: THREE.Object3D) {
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }
  dispose() {
    this.disposed = true;
    this.token++;
    this.mixer?.stopAllAction();
    if (this.model) this.release(this.model);
    this.world.remove(this.root);
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    window.removeEventListener("blur", this.blur);
  }
}
