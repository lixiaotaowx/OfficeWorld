export const COMPACT_MODEL_SHA256 = '5f40ccf0310c842ef39a28e301af0731616973f2b35f4a50c8f895f2820e1eea';\
export const COMPACT_TEXTURES = [\
  '/assets/ruler-model-5f40ccf0-color.ktx2',\
  '/assets/ruler-model-5f40ccf0-normal.ktx2',\
  '/assets/ruler-model-5f40ccf0-material.ktx2',\
] as const;\
export function compactKnownModel(scene: THREE.Object3D, file: string, hash: string): boolean {\
}\
\
/** Replace all three verified maps together; never leave a partially converted material. */\
export async function compressKnownModelTextures(scene: THREE.Object3D, file: string, hash: string,\
  load: (url: string) => Promise<THREE.CompressedTexture>): Promise<boolean> {\
  if (file !== COMPACT_MODEL_FILE || hash !== COMPACT_MODEL_SHA256) return false;\
  const meshes: THREE.Mesh[] = [];\
  scene.traverse(o => { const mesh=o as THREE.Mesh; if(mesh.isMesh) meshes.push(mesh); });\
  if (meshes.length !== 1 || Array.isArray(meshes[0].material)) return false;\
  const m = meshes[0].material as THREE.MeshStandardMaterial;\
  if (!m.isMeshStandardMaterial || !m.map || !m.normalMap || !m.roughnessMap || m.metalnessMap !== m.roughnessMap) return false;\
  const originals = [m.map, m.normalMap, m.roughnessMap];\
  if (new Set(originals).size !== 3 || originals.some(t => t.image?.width !== 1024 || t.image?.height !== 1024)) return false;\
  const compressed: THREE.CompressedTexture[] = [];\
  try {\
    for (const url of COMPACT_TEXTURES) {\
      const texture=await load(url); compressed.push(texture);\
      if (!texture.isCompressedTexture || texture.image?.width !== 1024 || texture.image?.height !== 1024 || texture.mipmaps.length !== 11) throw Error('Unexpected compressed texture');\
    }\
  } catch { for (const texture of compressed) texture.dispose(); return false; }\
  compressed.forEach((texture,i) => {\
    const original=originals[i];\
    texture.colorSpace=original.colorSpace; texture.flipY=original.flipY;\
    texture.wrapS=original.wrapS; texture.wrapT=original.wrapT;\
    texture.magFilter=original.magFilter; texture.minFilter=original.minFilter;\
    texture.anisotropy=original.anisotropy; texture.channel=original.channel;\
    texture.offset.copy(original.offset); texture.repeat.copy(original.repeat); texture.center.copy(original.center);\
    texture.rotation=original.rotation; texture.matrixAutoUpdate=original.matrixAutoUpdate; texture.matrix.copy(original.matrix);\
  });\
  [m.map,m.normalMap,m.roughnessMap,m.metalnessMap]=[compressed[0],compressed[1],compressed[2],compressed[2]];\
  m.needsUpdate=true;\
  for (const original of originals) { original.dispose(); (original.image as {close?:()=>void}|undefined)?.close?.(); }\
  return true;\
}\
