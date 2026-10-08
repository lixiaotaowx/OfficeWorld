import * as THREE from 'three';
import { findBone, type LoadedCharacter } from './characterModel';

const calibration = new WeakMap<LoadedCharacter, number>();
/** Start once, then advance continuously. Local and remote avatars share this path. */
export function updateSeatedAnimation(character: LoadedCharacter, height: number, dt: number) {
  const action = character.action('坐姿打字_Type');
  if (!action) return null;
  if (!action.isRunning()) {
    character.mixer.stopAllAction();
    action.reset().stopFading().setEffectiveWeight(1).setLoop(THREE.LoopRepeat, Infinity).play();
    character.mixer.update(0);
  }
  let hip = calibration.get(character);
  if (hip === undefined) {
    const bone = findBone(character.bones, 'Hips');
    const root = character.model.parent;
    const point = bone?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3();
    if (root) root.worldToLocal(point);
    hip = point.y - character.model.position.y;
    calibration.set(character, hip);
  }
  character.mixer.update(dt);
  character.model.position.y = height - hip;
  return { action, hip };
}
