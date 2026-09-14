import type { LoadedCharacter } from './characterModel';

/** Leave the procedural seated skeleton in one frame, without clip fade-in. */
export function snapStandingPose(character: LoadedCharacter, moving = false) {
  character.mixer.stopAllAction();
  for (const [name, rest] of character.rest) {
    const bone = character.bones.get(name);
    if (!bone) continue;
    bone.position.copy(rest.position);
    bone.quaternion.copy(rest.quaternion);
  }
  const action = moving ? character.walk : character.idle;
  action.reset().stopFading().setEffectiveWeight(1).play();
  character.mixer.update(0);
  character.model.position.y = character.groundY;
  character.model.updateMatrixWorld(true);
  return action;
}
