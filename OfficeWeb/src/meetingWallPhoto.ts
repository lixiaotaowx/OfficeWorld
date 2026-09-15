// The picture on the meeting room's wall display.
//
// The office model ships that panel as a flat dark colour (material "Display
// background"), which reads as a switched-off screen. The user asked for the office
// team photo there instead (2026-09-15), so the panel gets a lit, slightly
// self-emissive material of its own - the room is dim and the picture has to read
// like a screen rather than a poster.
import * as THREE from 'three';

/** Shipped from `public/assets`, so it is served next to the office models. */
export const WALL_PHOTO_URL = '/assets/meeting-wall-photo.jpg';

/**
 * The meeting room's display panel.
 *
 * three.js sanitises glTF node names (spaces and slashes become underscores), so
 * "Meeting / display surface" arrives as "Meeting___display_surface". The bezel is
 * the separate "Meeting / presentation display" node, which keeps its graphite
 * material; matching on "surface" keeps the two apart.
 */
export function isMeetingWallSurfaceName(name: string) {
  const lower = String(name || '').toLowerCase();
  return lower.includes('meeting') && lower.includes('display') && lower.includes('surface');
}

/** The first mesh in the scene that is the meeting room's wall picture. */
export function findMeetingWallSurface(root: THREE.Object3D): THREE.Mesh | undefined {
  let found: THREE.Mesh | undefined;
  root.traverse((object) => {
    if (found || !(object as THREE.Mesh).isMesh) return;
    if (isMeetingWallSurfaceName(object.name)) found = object as THREE.Mesh;
  });
  return found;
}

/**
 * Give the panel its own full-face UVs.
 *
 * The model's UVs come from the bake atlas: they cover u 0.125..0.875 with the face
 * landing in a small part of that range, so painting a photo onto them showed a
 * narrow slice of it. The panel is a flat rectangle, so the photo maps straight onto
 * its local x/y extent instead. Returns false when the geometry has no positions.
 */
export function remapPanelUv(surface: THREE.Mesh) {
  const geometry = surface.geometry as THREE.BufferGeometry;
  const position = geometry?.attributes?.position;
  if (!position) return false;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return false;
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  if (!(width > 0) || !(height > 0)) return false;
  const uv = new THREE.Float32BufferAttribute(position.count * 2, 2);
  for (let index = 0; index < position.count; index += 1) {
    // v = 0 is the top of the image once flipY is off, so the panel's top edge takes v 0.
    uv.setXY(index, (position.getX(index) - box.min.x) / width,
      1 - (position.getY(index) - box.min.y) / height);
  }
  geometry.setAttribute("uv", uv);
  return true;
}

/**
 * Paint the office photo onto that panel. Returns the mesh, or null when the model
 * has no such surface (an older office build), so a missing photo can never break
 * the scene.
 */
export function attachMeetingWallPhoto(root: THREE.Object3D, url = WALL_PHOTO_URL) {
  const surface = findMeetingWallSurface(root);
  if (!surface) return null;
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  // glTF UVs start at the top-left, so a texture loaded by three.js (which flips by
  // default for its own convention) would come out upside down on this panel.
  texture.flipY = false;
  texture.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.3,
    roughness: 0.55,
    metalness: 0,
  });
  material.name = 'Meeting wall photo';
  remapPanelUv(surface);
  // The replaced material is shared with nothing else, but it may still be in use
  // while the texture loads, so it is left for the scene-wide disposal pass.
  surface.material = material;
  return surface;
}
