import { fixtureFor } from './buildFixtures';
import { buildArchitecture } from './buildArchitecture';
import * as THREE from 'three';
import type { BuildPart } from './buildTypes';
import { propFurniture } from './buildPropFurniture';
import { propDetails } from './buildPropDetails';
import { tiltContents } from './buildOrientation';
import { createArch } from './buildArch';
import { buildColor } from './buildColors';

// Shared boxes; only the explicitly requested arch opening uses a curved extrusion.
const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = new Map<string, THREE.MeshStandardMaterial>();
export function box(parent: THREE.Object3D, color: string, size: number[], position: number[], glow = false) {
  const key = color + glow;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({
    color:buildColor(color), roughness: 0.85, ...(glow ? { emissive: buildColor(color), emissiveIntensity: 0.65 } : {}),
  }));
  const mesh = new THREE.Mesh(geometry, materials.get(key));
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
// 传送点的面板要"发亮"（青色辉光）而不是跟着色板走：单独一份材质并缓存复用。
let teleportMaterial: THREE.MeshStandardMaterial | undefined;
function teleportPad(root: THREE.Group, size: number[], position: number[]) {
  teleportMaterial ||= new THREE.MeshStandardMaterial({
    color: '#bfeee6', emissive: '#2fa79a', emissiveIntensity: 0.85, roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geometry, teleportMaterial);
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = mesh.receiveShadow = true;
  root.add(mesh);
  return mesh;
}
export function createPart(part: BuildPart) {
  const root = new THREE.Group();
  root.name = `build-${part.id}`;
  root.userData.buildId = part.id;
  const c = part.color;
  const b = (size: number[], p: number[], color = c, glow = false) => box(root, color, size, p, glow);
  const fixture=fixtureFor(part);
  if(fixture) for(const [size,position,color,yaw] of fixture.boxes){
    const mesh=b(size as number[],position as number[],part.color===fixture.color ? color as string : part.color);
    mesh.rotation.y=typeof yaw==='number'?yaw:0;
  }
  else if (!buildArchitecture(part.kind,root,b) && !propFurniture(part.kind,b) && !propDetails(part.kind,b)) switch (part.kind) {
    case 'small': b([0.5,0.5,0.5], [0,0.25,0]); break;
    case 'floor': b([4,0.25,4], [0,0.125,0]); break;
    case 'wall': b([4,3,0.25], [0,1.5,0]); break;
    case 'pillar': b([0.5,3,0.5], [0,1.5,0]); break;
    case 'beam': b([4,0.5,0.5], [0,0.25,0]); break;
    case 'window':
      b([4,0.75,0.25], [0,0.375,0]);
      b([4,0.5,0.25], [0,2.75,0]);
      for (const x of [-1.75,1.75]) b([0.5,1.75,0.25], [x,1.625,0]);
      break;
    case 'door':
      for (const x of [-1.25,1.25]) b([0.5,2.5,0.3], [x,1.25,0]);
      b([3,0.5,0.3], [0,2.75,0]);
      break;
    case 'arch':
      if(!materials.has(c+'false')) materials.set(c+'false',new THREE.MeshStandardMaterial({color:c,roughness:.85}));
      root.add(createArch(materials.get(c+'false')!));
      break;
    case 'stairs':
      for (let i = 0; i < 4; i++) b([2,(i+1)*0.25,0.5], [0,(i+1)*0.125,0.75-i*0.5]);
      break;
    case 'desk':
    case 'table':
      b([2,0.15,1], [0,0.725,part.kind === 'desk' ? -0.4 : 0]);
      for (const x of [-0.85,0.85]) b([0.15,0.65,0.9], [x,0.325,part.kind === 'desk' ? -0.4 : 0]);
      if (part.kind === 'desk') {
        b([0.8,0.48,0.1], [0,1.18,-0.58], '#596679');
        b([0.7,0.36,0.025], [0,1.18,-0.515], '#b9c9df');
        b([0.12,0.2,0.15], [0,0.9,-0.58], '#596679');
        b([0.7,0.15,0.7], [0,0.5,0.6], '#b4c5a0');
        b([0.7,0.5,0.1], [0,0.85,0.9], '#b4c5a0');
        for (const x of [-0.25,0.25]) b([0.1,0.5,0.6], [x,0.25,0.6]);
      }
      break;
    case 'chair':
      b([0.75,0.15,0.75], [0,0.5,0]);
      b([0.75,0.5,0.12], [0,0.75,-0.315]);
      for (const x of [-0.25,0.25]) b([0.12,0.45,0.6], [x,0.225,0]);
      break;
    case 'sofa':
      b([2,0.45,1], [0,0.225,0]);
      b([2,0.55,0.2], [0,0.725,-0.4]);
      for (const x of [-0.9,0.9]) b([0.2,0.3,0.8], [x,0.6,0.1]);
      b([1.5,0.13,0.75], [0,0.5,0.1], '#f3dfc5');
      break;
    case 'shelf':
      for (const x of [-0.675,0.675]) b([0.15,2,0.5], [x,1,0]);
      for (let y = 0.08; y < 2; y += 0.62) b([1.5,0.12,0.5], [0,y,0]);
      for (let i = 0; i < 8; i++) b([0.18,0.4,0.3], [-0.45+(i%4)*0.27,0.33+Math.floor(i/4)*0.62,0], ['#e9b8b5','#b4c5a0','#b9c9df'][i%3]);
      break;
    case 'tree':
      b([0.75,0.5,0.75], [0,0.25,0], '#f3dfc5');
      b([0.22,1.6,0.22], [0,1.15,0], '#c69770');
      b([1.3,0.8,1.3], [0,1.9,0]);
      b([0.75,0.6,0.75], [-0.35,2.2,0.2], '#c8d3a4');
      break;
    case 'planter':
      b([0.5,0.3,0.5], [0,0.15,0], '#f3dfc5');
      b([0.35,0.5,0.35], [0,0.5,0], '#b4c5a0');
      break;
    case 'lamp':
      b([0.5,0.2,0.5], [0,0.1,0]);
      b([0.36,0.5,0.36], [0,0.45,0], '#ffe3a1', true);
      b([0.5,0.05,0.5], [0,0.725,0]);
      break;
    case 'screen':
      b([2.5,1.5,0.18], [0,1.25,0], '#596679');
      b([2.3,1.3,0.04], [0,1.25,0.11]);
      b([1.5,0.15,0.5], [0,0.075,0]);
      b([0.2,0.6,0.2], [0,0.3,0]);
      break;
    case 'chest':
      // Leave 2cm between the bands' top/bottom faces and the wooden surfaces.
      b([1,0.53,0.75], [0,0.285,0]);
      b([1,0.14,0.75], [0,0.66,0]);
      for (const x of [-0.32,0.32]) b([0.09,0.75,0.77], [x,0.375,0], '#f3dfc5');
      b([0.15,0.18,0.06], [0,0.52,0.405], '#ffe3a1', true);
      break;
    default: b([1,1,1], [0,0.5,0]);
  }
  // 传送点：底座/立柱跟着色板，唯一发光的面板用专属材质——它要在场景里认得出。
  if (part.kind === 'teleport-pad') teleportPad(root, [1.24, 0.08, 1.24], [0, 0.21, 0]);
  if (part.scale) {
    const scaled = new THREE.Group();
    for (const child of [...root.children]) scaled.add(child);
    scaled.scale.fromArray(part.scale); root.add(scaled);
    // 可攀爬柱体也要跟着缩放，否则放大/缩小后的梯子爬不上去。
    root.userData.buildScale = part.scale;
  }
  tiltContents(root,part);
  root.position.set(part.x, part.y, part.z);
  root.rotation.y = part.rotation * Math.PI / 2;
  return root;
}
