import type * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

/** Keep compressed mip levels for context restoration; release decoder workers. */
export function loadOfficeAsset(
  renderer: THREE.WebGLRenderer,
  loaded: (gltf: GLTF) => void,
  progress: (event: ProgressEvent) => void,
  failed: () => void,
) {
  const draco = new DRACOLoader().setDecoderPath('/assets/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  // Tiered UASTC preserves baked gradients while keeping textures GPU-compressed.
  const mode = new URLSearchParams(location.search).get('textures');
  const supportsCompression = mode !== 'original' && mode !== 'webp' && [
    'WEBGL_compressed_texture_astc', 'EXT_texture_compression_bptc',
    'WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_etc',
  ].some(extension => renderer.extensions.has(extension));
  const ktx = supportsCompression
    ? new KTX2Loader().setTranscoderPath('/assets/basis/').setWorkerLimit(2).detectSupport(renderer)
    : null;
  if (ktx) loader.setKTX2Loader(ktx);
  const original = mode === 'original' ? '/assets/office-baked.glb?v=20260913-monitor-uv2'
    : '/assets/office-balanced.glb?v=20260914-memory';
  const compressed = mode === 'compact' ? '/assets/office-baked-ktx2.glb?v=20260913-memory255'
    : '/assets/office-balanced-gpu.glb?v=20260914-memory';
  let cancelled = false;
  const fetch = async () => {
    try {
      let gltf: GLTF;
      try {
        gltf = await loader.loadAsync(supportsCompression ? compressed : original, progress);
      } catch (error) {
        if (!supportsCompression || cancelled) throw error;
        console.warn('GPU compression unavailable; loading resized web textures.', error);
        gltf = await loader.loadAsync(original, progress);
      }
      loaded(gltf);
    } catch { if (!cancelled) failed(); }
    finally { draco.dispose(); ktx?.dispose(); }
  };
  void fetch();
  // Let in-flight decode complete so its result can be disposed by the caller.
  // Terminating workers mid-task leaves their promises (and buffers) pending.
  return () => { cancelled = true; };
}
