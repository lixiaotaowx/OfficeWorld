// Renders every other player in the office.
//
// The server relays a throttled motion snapshot per player (see the `motion`
// handler in server.mjs); this keeps one character model per remote player,
// interpolates towards the last received transform so motion looks smooth
// rather than stepping at the network rate, and replays the same walk / idle /
// seated posing the locally controlled avatar uses.
import * as THREE from "three";
import {
  loadCharacter,
  releaseCharacter,
  setCharacterAppearance,
  type LoadedCharacter,
} from "./characterModel";
import { appearanceKey, type Appearance } from "./look";
import { applySitPose, SIT_POSES, type SitPoseId } from "./sitPoses";
import { sittingSpot } from "./sittingSpots";
import { SEAT_HEIGHT } from "./seats";
import { groundSeatedFeet } from "./seatedFeet";
import { placeSeatedHands } from "./seatedHands";
import { snapStandingPose } from './standingPose';
import { updateSeatedAnimation } from './seatedAnimation';

export interface RemoteState {
  y?: number;
  x: number;
  z: number;
  rot: number;
  moving: boolean;
  /** 他在跑（长距离/Shift）：放跑步循环；缺省当成走路（老客户端不发这个字段）。 */
  running?: boolean;
  sitting: boolean;
  sittingSpot?: string | null;
  /** 这个人的配色与配件；变了只改材质与显隐，不重新下载模型。 */
  appearance: Appearance;
  pose?: SitPoseId;
}

interface RemoteEntry {
  id: string;
  /** 当前外观的指纹（`appearanceKey`），用来判断要不要重新套用。 */
  kind: string;
  root: THREE.Group;
  character?: LoadedCharacter;
  current?: THREE.AnimationAction;
  target: RemoteState;
  loading: boolean;
  poseTime: number;
  wasSeated: boolean;
}

/** Beyond this many metres a gap is treated as a jump, not as movement. */
const SNAP_DISTANCE = 3;

export class RemoteAvatars {
  private entries = new Map<string, RemoteEntry>();

  constructor(private world: THREE.Scene) {}

  /** Match the avatar set to the latest snapshot: create, update and remove. */
  sync(states: Map<string, RemoteState>) {
    for (const [id, state] of states) {
      let entry = this.entries.get(id);
      if (!entry) {
        const root = new THREE.Group();
        root.name = `remote:${id}`;
        root.position.set(state.x, state.y ?? 0, state.z);
        root.rotation.y = state.rot;
        this.world.add(root);
        entry = {
          id,
          kind: appearanceKey(state.appearance),
          root,
          target: state,
          loading: false,
          poseTime: 0,
          wasSeated: false,
        };
        this.entries.set(id, entry);
        void this.loadModel(entry);
      } else {
        const key = appearanceKey(state.appearance);
        if (entry.kind !== key) {
          entry.kind = key;
          // 同一个模型里换配色/换配件：只改材质与显隐，别重新下载。
          if (entry.character) setCharacterAppearance(entry.character, state.appearance);
        }
      }
      entry.target = state;
    }
    // Anybody missing from the snapshot has left the office.
    for (const [id, entry] of this.entries) {
      if (states.has(id)) continue;
      this.drop(entry);
      this.entries.delete(id);
    }
  }

  private async loadModel(entry: RemoteEntry) {
    if (entry.loading) return;
    entry.loading = true;
    const kind = entry.kind;
    try {
      const loaded = await loadCharacter(entry.target.appearance);
      // The player may have left, or changed their look, while this decoded.
      if (this.entries.get(entry.id) !== entry || entry.kind !== kind) {
        releaseCharacter(loaded);
        return;
      }
      if (entry.character) {
        entry.root.remove(entry.character.model);
        releaseCharacter(entry.character);
      }
      entry.character = loaded;
      entry.current = undefined;
      entry.root.add(loaded.model);
    } finally {
      entry.loading = false;
    }
  }

  private drop(entry: RemoteEntry) {
    if (entry.character) releaseCharacter(entry.character);
    entry.character = undefined;
    this.world.remove(entry.root);
  }

  update(dt: number) {
    for (const entry of this.entries.values()) {
      const target = entry.target;
      const dx = target.x - entry.root.position.x;
      const dz = target.z - entry.root.position.z;
      const distance = Math.hypot(dx, dz);
      if ((entry.wasSeated && !target.sitting) || distance > SNAP_DISTANCE) {
        entry.root.position.set(target.x, target.y ?? 0, target.z);
      } else if (distance > 0.001) {
        const step = Math.min(1, dt * 8);
        entry.root.position.x += dx * step;
        entry.root.position.z += dz * step;
      }
      // Turn the short way round.
      entry.root.position.y += ((target.y ?? 0)-entry.root.position.y)*Math.min(1,dt*14);
      const turn = Math.atan2(
        Math.sin(target.rot - entry.root.rotation.y),
        Math.cos(target.rot - entry.root.rotation.y),
      );
      entry.root.rotation.y += turn * Math.min(1, dt * 10);

      const character = entry.character;
      if (!character) continue;
      if (target.sitting) {
        entry.wasSeated = true;
        const seat = sittingSpot(target.sittingSpot);
        if (seat) entry.root.rotation.set(0, seat.chair.angle, 0);
        const seated = updateSeatedAnimation(character, seat?.height ?? SEAT_HEIGHT, dt);
        if (seated) { entry.current = seated.action; continue; }
        // Stop any clip and let the shared seated pose own the bones, exactly
        // like the local avatar, so colleagues sit identically.
        if (entry.current) {
          entry.current.stop();
          entry.current = undefined;
        }
        const spot = sittingSpot(target.sittingSpot);
        // Use the same seat heading as the local avatar; stale walking rotations
        // must not leave a seated colleague sideways during interpolation.
        if (spot) entry.root.rotation.set(0, spot.chair.angle, 0);
        const pose = SIT_POSES[target.pose ?? "standard"];
        applySitPose(
          entry.root,
          character.bones,
          character.rest,
          pose,
          (entry.poseTime += dt),
        );
        character.model.position.y =
          character.groundY +
          ((spot?.height ?? SEAT_HEIGHT) + pose.hipDrop - character.restHipHeight);
        groundSeatedFeet(entry.root, character, pose.id);
        if (spot?.workstation !== undefined) placeSeatedHands(entry.root, character, pose.id);
      } else {
        if (entry.wasSeated) {
          entry.current = snapStandingPose(character, target.moving);
          entry.wasSeated = false;
        }
        // 跑还是走由对方广播的 `running` 决定；老客户端不带这个字段就当走路。
        const action = target.moving
          ? (target.running && character.run ? character.run : character.walk)
          : character.idle;
        if (entry.current !== action) {
          entry.current?.fadeOut(0.18);
          action.reset().fadeIn(0.18).play();
          entry.current = action;
        }
        character.mixer.update(dt);
        character.model.position.y = character.groundY;
      }
    }
  }

  /**
   * One remote avatar's scene root: the name tag hangs from it, and focusing a
   * person in the directory reads its position.
   */
  objectOf(id: string) {
    return this.entries.get(id)?.root;
  }

  /** How many remote avatars exist, and how many have finished loading. */
  get counts() {
    let loaded = 0;
    for (const entry of this.entries.values()) if (entry.character) loaded++;
    return { avatars: this.entries.size, loaded };
  }

  /** Diagnostics for the browser harness. */
  snapshot() {
    return [...this.entries.values()].map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      loaded: Boolean(entry.character),
      x: Math.round(entry.root.position.x * 100) / 100,
      y: Math.round(entry.root.position.y * 100) / 100,
      z: Math.round(entry.root.position.z * 100) / 100,
      sitting: entry.target.sitting,
      /** 对方广播的"在跑"（远端会放跑步循环）。 */
      running: entry.target.running === true,
      /** 此刻远端实际在放哪条：走路 / 跑步 / 待机。 */
      clip: entry.current === entry.character?.run ? "run"
        : entry.current === entry.character?.walk ? "walk"
        : entry.current === entry.character?.idle ? "idle" : "pose",
    }));
  }

  dispose() {
    for (const entry of this.entries.values()) this.drop(entry);
    this.entries.clear();
  }
}

