import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** A broad softbox reflection gives eyes and frames a readable curved surface. */
export function portraitLighting(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, .04);
  room.dispose();
  generator.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = .45;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x919aa5, 1.4));
  const key = new THREE.DirectionalLight(0xfff6e9, 2.5);
  key.position.set(-2, 3, 4);
  const fill = new THREE.DirectionalLight(0xe5edff, .65);
  fill.position.set(3, 1, 2);
  scene.add(key, fill);
  return () => environment.dispose();
}
