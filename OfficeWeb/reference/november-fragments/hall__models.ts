import { COMPACT_MODEL_FILE, compactKnownModel } from './compactModel';\
import { SharedResourcePool } from '../sharedResourcePool';\
import { disposeResources } from '../disposeResources';\
const files = new Map<string, Promise<THREE.Object3D>>();\
const modelParts = new WeakMap<THREE.Object3D, {disposed: boolean}>();\
const files = new Map<string, SharedResourcePool<THREE.Object3D>>();\
const modelParts = new WeakMap<THREE.Object3D, {disposed: boolean; release?: () => void}>();\
export function releaseModelPart(root: THREE.Object3D) {\
  const state=modelParts.get(root);if(!state)return false;if(state.disposed)return true;\
  state.disposed=true;disposeOwnedModelResources(root);root.clear();return true;\
  state.disposed=true;try { disposeOwnedModelResources(root);root.clear(); } finally { state.release?.();state.release=undefined; } return true;\
const load = (file: string) => {\
const load = (file: string) => {\
  const url=`/api/build?modelFile=${encodeURIComponent(file)}`;\
  if (!files.has(file)) files.set(file, file===COURT_FILE ? loadCourt(url,file) : file===COMPACT_MODEL_FILE ? loadCompactModel(url,file) : loader.loadAsync(url).then(g => g.scene));\
  return files.get(file)!;\
  let pool=files.get(file);\
  if(!pool) { pool=new SharedResourcePool(() => file===COURT_FILE ? loadCourt(url,file) : file===COMPACT_MODEL_FILE ? loadCompactModel(url,file) : loader.loadAsync(url).then(g => g.scene), disposeResources);files.set(file,pool); }\
  return pool.acquire();\
};\
export function makeModelPart(part: WorldPart, model: WorldModel | undefined, onLoad: () => void = () => {}, loadModel = load): THREE.Group {\
export function makeModelPart(part: WorldPart, model: WorldModel | undefined, onLoad: () => void = () => {}, loadModel?: (file: string) => Promise<THREE.Object3D>): THREE.Group {\
  const root = new THREE.Group(); root.name = 'part:' + part.id;\
  const state={disposed:false};modelParts.set(root,state);\
  const state: {disposed: boolean; release?: () => void}={disposed:false};modelParts.set(root,state);\
  if (model) void loadModel(model.file).then(scene => { if(state.disposed)return;root.remove(stand);disposeOwnedModelResources(stand);root.add(fitted(scene, model.size, model.file));onLoad(); })\
  if (model) void (loadModel ? loadModel(model.file).then(value=>({value,release:()=>{}})) : load(model.file)).then(lease => {\
    if(state.disposed) { lease.release();return; }\
    state.release=lease.release;\
    try { const placed=fitted(lease.value, model.size, model.file);root.remove(stand);disposeOwnedModelResources(stand);root.add(placed);onLoad(); }\
    catch (error) { state.release=undefined;lease.release();throw error; }\
  })\
