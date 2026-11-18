export type Surface = 'paint' | 'wood' | 'metal' | 'fabric' | 'plaster';\
export type Surface = 'paint' | 'wood' | 'metal' | 'fabric' | 'plaster' | 'water';\
    const value = surface === 'wood' ? 229 + grain * 13 + noise * 10\
    // Periodic crossed ripples tile cleanly; narrow bright ridges read as water\
    // even with no reflection probe. Keep this static to avoid a render loop.\
    const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;\
    const ripple = Math.sin(u * 3 + Math.sin(v * 2)) + Math.sin(v * 4 + Math.cos(u * 2));\
    const water = 176 + ripple * 14 + 48 * Math.pow(Math.max(0, 1 - Math.abs(ripple) * 2), 4);\
    const value = surface === 'water' ? water : surface === 'wood' ? 229 + grain * 13 + noise * 10\
export function surfaceParameters(surface: Surface): THREE.MeshStandardMaterialParameters {\
  if (surface === 'water') return { roughness: .16, metalness: .12, map: texture(surface), bumpMap: texture(surface), bumpScale: .025 };\
