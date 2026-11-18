const textureCache = new WeakMap<THREE.Texture, Map<string, THREE.Texture>>();\
const tintUsers = new WeakMap<THREE.Texture, number>();\
const materialTint = new WeakMap<THREE.Material, { source: THREE.Texture; key: string; texture: THREE.Texture }>();\
\
/** A colour can be freed as soon as no character uses it. */\
export function releaseMaterialTint(material: THREE.Material) {\
  const binding = materialTint.get(material); if (!binding) return;\
  materialTint.delete(material);\
  const remaining = (tintUsers.get(binding.texture) || 1) - 1;\
  if (remaining > 0) { tintUsers.set(binding.texture, remaining); return; }\
  tintUsers.delete(binding.texture);\
  const variants = textureCache.get(binding.source);\
  if (variants?.get(binding.key) === binding.texture) variants.delete(binding.key);\
  if (variants && !variants.size) textureCache.delete(binding.source);\
  if (binding.texture !== binding.source) binding.texture.dispose();\
}\
    if (!cached) {\
      cached = tintTexture(source, hex);\
      variants.set(hex, cached);\
    }\
    const previous = materialTint.get(material);\
    if (!previous || previous.texture !== cached || previous.source !== source || previous.key !== hex) {\
      releaseMaterialTint(material);\
      // Reinsert if releasing the previous colour removed this source's last map.\
      if (!textureCache.has(source)) textureCache.set(source, variants);\
      variants.set(hex, cached);\
      tintUsers.set(cached, (tintUsers.get(cached) || 0) + 1);\
      materialTint.set(material, { source, key: hex, texture: cached });\
    }\
    material.map = cached;\
    // Keep recent choices without retaining every full-size canvas indefinitely.\
    if (variants.size > 4) {\
      const oldest = variants.keys().next().value!;\
      const unused = variants.get(oldest);\
      variants.delete(oldest);\
      if (unused && unused !== source && unused !== cached) unused.dispose();\
    }\
    const source=material.userData.lookSource as THREE.Texture|undefined;\
    if (!source) continue;\
    releaseMaterialTint(material);\
    releaseTintVariants(source, material.map);\
