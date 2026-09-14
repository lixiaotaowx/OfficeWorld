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
  type LoadedCharacter,
} from "./characterModel";
import type { CharacterId } from "./characters";
import { applySitPose, SIT_POSES, type SitPoseId } from "./sitPoses";
import { sittingSpot } from "./sittingSpots";
import { SEAT_HEIGHT } from "./seats";
import { groundSeatedFeet } from "./seatedFeet";
import { placeSeatedHands } from "./seatedHands";
import { snapStandingPose } from './standingPose';

export interface RemoteState {
  x: number;
  z: number;
  rot: number;
  moving: boolean;
  sitting: boolean;
  sittingSpot?: string | null;
  character: CharacterId;
  pose?: SitPoseId;
}

interface RemoteEntry {
  id: string;
  kind: CharacterId;
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
        root.position.set(state.x, 0, state.z);
        root.rotation.y = state.rot;
        this.world.add(root);
        entry = {
          id,
          kind: state.character,
          root,
          target: state,
          loading: false,
          poseTime: 0,
          wasSeated: false,
        };
        this.entries.set(id, entry);
        void this.loadModel(entry);
      } else if (entry.kind !== state.character) {
        entry.kind = state.character;
        void this.loadModel(entry);
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
      const loaded = await loadCharacter(kind);
      // The player may have left, or switched character, while this decoded.
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
        entry.root.position.set(target.x, 0, target.z);
      } else if (distance > 0.001) {
        const step = Math.min(1, dt * 8);
        entry.root.position.x += dx * step;
        entry.root.position.z += dz * step;
      }
      // Turn the short way round.
      const turn = Math.atan2(
        Math.sin(target.rot - entry.root.rotation.y),
        Math.cos(target.rot - entry.root.rotation.y),
      );
      entry.root.rotation.y += turn * Math.min(1, dt * 10);

      const character = entry.character;
      if (!character) continue;
      if (target.sitting) {
        entry.wasSeated = true;
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
        const action = target.moving ? character.walk : character.idle;
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
      z: Math.round(entry.root.position.z * 100) / 100,
      sitting: entry.target.sitting,
    }));
  }

  dispose() {
    for (const entry of this.entries.values()) this.drop(entry);
    this.entries.clear();
  }
}
