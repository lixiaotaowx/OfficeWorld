import * as THREE from 'three';
import publicSeats from '../public-seats.json';
import { WORKSTATIONS, SEAT_HEIGHT } from './seats';

export interface SittingSpot {
  id: string;
  label: string;
  family: string;
  chair: { x: number; y?: number; z: number; angle: number };
  stand: { x: number; y?: number; z: number };
  height: number;
  workstation?: number;
}

export const SITTING_SPOTS: SittingSpot[] = [
  ...WORKSTATIONS.map(w => ({
    id: `desk-${w.index}`, label: `${w.index + 1} 号工位`, family: 'desk',
    chair: w.chair, stand: w.stand, height: SEAT_HEIGHT, workstation: w.index,
  })),
  ...publicSeats,
];
let buildSeats: SittingSpot[] | undefined;
export function setBuildSeats(spots: SittingSpot[]) { buildSeats = spots; }
export const sittingSpot = (id?: string | null) => (buildSeats ?? SITTING_SPOTS).find(s => s.id === id);

/** Tag complete furniture, including backs, arms and legs, without altering the model. */
export function attachSittingSpots(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);
  scene.traverse(node => {
    const name = node.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    let family = '';
    if (name.startsWith('lounge continuous curved')) family = 'sofa';
    else if (/^lounge (seat|back|left arm|right arm)/.test(name)) family = 'armchair';
    else if (name.startsWith('coffee stool')) family = 'coffee';
    else if (name.startsWith('collaboration stool')) family = 'collaboration';
    else if (name.startsWith('meeting chair north')) family = 'meeting-north';
    else if (name.startsWith('meeting chair south')) family = 'meeting-south';
    else if (name.startsWith('manager visitor chair')) family = 'visitor';
    if (!family) return;
    const candidates = SITTING_SPOTS.filter(s => s.family === family);
    const center = new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
    candidates.sort((a, b) => Math.hypot(a.chair.x - center.x, a.chair.z - center.z)
      - Math.hypot(b.chair.x - center.x, b.chair.z - center.z));
    // A continuous sofa has several independently occupied places.
    node.userData.sittingSpots = family === 'sofa' ? candidates : candidates.slice(0, 1);
  });
}
