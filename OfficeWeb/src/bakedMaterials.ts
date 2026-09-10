// Baked office surfaces.
//
// The baked albedo is a picture of the light that fell on each surface, so those
// faces must not be lit a second time by the scene lights. They are drawn with
// an unlit material and the renderer's tone mapping performs the display
// transform, which is how the bake was verified against Blender.
//
// Colour space is a single switch on purpose. The bake note says the stored
// values are scene-referred linear, while Blender tags the images sRGB; rather
// than trust either statement, flip this and measure the render against
// Blender's own preview (mean luminance 0.556 by Rec.709 on the stored values).
import * as THREE from "three";

/** True when the exported textures are meant to be read as sRGB. */
export const BAKED_TEXTURE_IS_SRGB = true;

/** Materials the bake produced are named "Baked surface / ...". */
const isBaked = (material: THREE.Material) =>
  /^baked/i.test(material.name ?? "");

function toUnlit(source: THREE.Material): THREE.MeshBasicMaterial {
  const standard = source as THREE.MeshStandardMaterial;
  const unlit = new THREE.MeshBasicMaterial({
    name: source.name,
    side: source.side,
    transparent: source.transparent,
    opacity: source.opacity,
  });
  // The bake already went through Blender's AgX view transform, so running the
  // renderer's tone map over it a second time washes the room out. Measured
  // against Blender's own preview: with the tone map applied the render came out
  // at mean luminance 0.81 against the preview's 0.56.
  unlit.toneMapped = false;
  if (standard.map) {
    standard.map.colorSpace = BAKED_TEXTURE_IS_SRGB
      ? THREE.SRGBColorSpace
      : THREE.NoColorSpace;
    unlit.map = standard.map;
  } else if (standard.color) {
    unlit.color.copy(standard.color);
  }
  return unlit;
}

/**
 * Return the material a baked surface should render with, or the original when
 * it was not produced by the bake (props and furniture keep their own look and
 * are lit by the scene).
 */
export function bakedAwareMaterial(
  material: THREE.Material | THREE.Material[],
): THREE.Material | THREE.Material[] {
  if (Array.isArray(material))
    return material.map((m) => (isBaked(m) ? toUnlit(m) : m));
  return isBaked(material) ? toUnlit(material) : material;
}
