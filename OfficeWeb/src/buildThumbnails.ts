import * as THREE from 'three';
import { createPart } from './buildMeshes';
import { catalog } from './buildTypes';

const cache = new Map<string, Record<string,string>>();
export function buildThumbnails(color: string, category?: string) {
  const key = color + ':' + (category || 'all');
  if (cache.has(key)) return cache.get(key)!;
  const images: Record<string,string> = {};
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(120,100);
  renderer.setClearColor(0,0);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff,0x9aa6be,2.3));
  const sun = new THREE.DirectionalLight(0xfff2e4,2.1);
  sun.position.set(-3,5,4);
  scene.add(sun);
  const camera = new THREE.OrthographicCamera(-2,2,1.67,-1.67,0.1,30);
  for (const item of catalog) {
    if (category && item.category !== category) continue;
    const object = createPart({ id:'thumbnail',kind:item.id,color,x:0,y:0,z:0,rotation:0,version:0 });
    scene.add(object);
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const extent = Math.max(size.x,size.y,size.z)*1.0;
    camera.left = -extent;
    camera.right = extent;
    camera.top = extent/1.2;
    camera.bottom = -extent/1.2;
    camera.position.copy(center).add(new THREE.Vector3(4,3,5));
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    images[item.id] = renderer.domElement.toDataURL('image/png');
    scene.remove(object);
  }
  renderer.dispose();
  renderer.forceContextLoss();
  cache.set(key,images);
  return images;
}
