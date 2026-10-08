// Move-mode handle styling.
//
// three.js TransformControls ships pure-red/green/blue primaries with chunky
// cones, opaque plane slabs and a white centre diamond — outside the office art
// direction and needlessly loud when translate, rotate and scale are all
// attached at once. This module keeps TransformControls as the interaction
// layer (it still owns the invisible pickers) and restyles what is drawn:
//
//   * desaturated axis tones, a warm sand tone for hover;
//   * slim rods with small tapered arrowheads instead of thick blunt cones;
//   * scale heads become cream rounded squares on short stalks, so the muted
//     axis triad belongs to moving and the cream triad to resizing;
//   * a small cream hub marks the pivot;
//   * every drawn handle sits above the part it edits (depthTest off), because a
//     handle buried inside its own geometry cannot be grabbed or read;
//   * a per-frame emphasis pass keeps the hovered axis solid and fades every
//     other axis (and the other gizmos) back, so the handles read as one tool.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export type GizmoKind = 'translate' | 'rotate' | 'scale';
type Axis = 'x' | 'y' | 'z';

/** Desaturated axis tones: legible over the office, never louder than the room. */
export const GIZMO_COLORS = { x: '#c38e88', y: '#97c28e', z: '#92b1c4', active: '#dfc590' } as const;
/**
 * The grabbed axis is the one thing that must never be ambiguous: it switches to
 * a saturated tone (the muted idle palette washes out over pale floors), grows a
 * little and keeps its own hue, so "which axis am I on" is readable at a glance.
 */
export const GIZMO_ACTIVE_COLORS: Record<'x' | 'y' | 'z', string> = {
  x: '#d2603f', y: '#3f9a55', z: '#3579ad' };
/** Resize heads stay neutral: warm cream of the office cabinetry. */
export const GIZMO_HANDLE_COLOR = '#ddd0bd';
/** Hairline that shows the drag axis while a handle is hovered. */
const GUIDE_COLOR = '#e0d3b4';
const GUIDE_OPACITY = .4;
const GUIDE_DRAG_OPACITY = .6;
/** How much the hovered/dragged handle grows to make itself obvious. */
const HOVER_GROW = 1.16;

const AXES: Axis[] = ['x', 'y', 'z'];
const LETTERS: Record<Axis, string> = { x: 'X', y: 'Y', z: 'Z' };
/**
 * Idle opacity per gizmo. Nothing here is ever dimmed by hovering: 用户明确
 * 「没选的其他轴还是看不清 … 其他轴不要变色了」——选中靠饱和色+放大区分，
 * 其余轴始终维持自己这一档，不因为别处被指着就淡下去。
 */
const BASE_OPACITY: Record<GizmoKind, number> = { translate: 1, rotate: .72, scale: 1 };
const HUB_OPACITY = { idle: .45, hover: .85 };
const ROD_RADIUS = .0075;
/** Tip of every handle: the translate arrow and the centre of a scale head. */
const TIP = .54;
/** Scale heads sit on a stalk that starts where the translate rod ends. */
const STEM = { inner: .25, radius: .0045 };
/** Drawn handles stay on top of the part they belong to. */
const RENDER_ORDER = 900;

type MaterialLib = Record<'xAxis' | 'yAxis' | 'zAxis' | 'active', THREE.MeshBasicMaterial>;
type Internals = {
  _gizmo: {
    gizmo: Record<GizmoKind, THREE.Object3D>;
    helper: Record<GizmoKind, THREE.Object3D>;
    materialLib: MaterialLib;
  };
};
type Look = {
  kind: GizmoKind;
  guides: THREE.LineBasicMaterial[];
  axes: Record<Axis, THREE.MeshBasicMaterial>;
  colors: Record<Axis, string>;
  hub?: THREE.MeshBasicMaterial;
};
type Styled = TransformControls & { __gizmoLook?: Look };

const ORIENT: Record<Axis, THREE.Matrix4> = {
  x: new THREE.Matrix4().makeRotationZ(-Math.PI / 2),
  y: new THREE.Matrix4(),
  z: new THREE.Matrix4().makeRotationX(Math.PI / 2),
};

function material(color: THREE.ColorRepresentation, opacity: number) {
  return new THREE.MeshBasicMaterial({
    // depthTest off: handles stay readable instead of sinking into their part.
    color, opacity, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
}

/** One slim rod spanning the whole axis so the arrow reads as double-ended. */
function rodGeometry(axis: Axis, radius: number) {
  const geometry = new THREE.CylinderGeometry(radius, radius, (TIP - .15) * 2, 16);
  geometry.applyMatrix4(ORIENT[axis]);
  return geometry;
}

/** Tapered head on the rod tip, blunt enough not to read as a needle. */
function arrowGeometry(axis: Axis, end: 1 | -1) {
  const geometry = new THREE.CylinderGeometry(.009, .03, .15, 16);
  geometry.translate(0, TIP - .075, 0);
  if (end < 0) geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
  geometry.applyMatrix4(ORIENT[axis]);
  return geometry;
}

/** Soft square scale head, sitting just inside the arrow tip. */
function headGeometry(axis: Axis, end: 1 | -1) {
  const geometry = new RoundedBoxGeometry(.048, .048, .048, 3, .008);
  geometry.translate(0, (TIP - .038) * end, 0);
  geometry.applyMatrix4(ORIENT[axis]);
  return geometry;
}

/** Short cream stalk carrying a scale head, past the end of the translate rod. */
function stemGeometry(axis: Axis, end: 1 | -1) {
  const outer = TIP - .038 + .024;
  const geometry = new THREE.CylinderGeometry(STEM.radius, STEM.radius, outer - STEM.inner, 12);
  geometry.translate(0, (STEM.inner + outer) / 2, 0);
  if (end < 0) geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
  geometry.applyMatrix4(ORIENT[axis]);
  return geometry;
}

/** The gizmo group holds one flat mesh per part, several of them per axis name. */
function dropNamed(group: THREE.Object3D, name: string) {
  for (const child of [...group.children]) {
    if (child.name !== name) continue;
    (child as THREE.Mesh).geometry?.dispose();
    group.remove(child);
  }
}

function addNamed(group: THREE.Object3D, name: string, geometries: THREE.BufferGeometry[], material: THREE.Material) {
  for (const geometry of geometries) {
    const mesh = new THREE.Mesh(geometry, material);
    // Names must stay X/Y/Z: TransformControls highlights handles by name.
    mesh.name = name;
    group.add(mesh);
  }
}

/** Rod plus tapered tips: a slim double-ended arrow instead of blunt cones. */
function rebuildAxis(group: THREE.Object3D, axis: Axis, kind: Exclude<GizmoKind, 'rotate'>,
  material: THREE.MeshBasicMaterial) {
  // Scale heads share the axis line with the translate arrows: the middle of the
  // rod is already drawn by them, so only the outer stalks are added.
  const parts = kind === 'translate'
    ? [rodGeometry(axis, ROD_RADIUS), arrowGeometry(axis, 1), arrowGeometry(axis, -1)]
    : [stemGeometry(axis, 1), stemGeometry(axis, -1), headGeometry(axis, 1), headGeometry(axis, -1)];
  dropNamed(group, LETTERS[axis]);
  addNamed(group, LETTERS[axis], parts, material);
}

/** The centre diamond becomes a small cream hub that marks the pivot. */
function reshapeHub(group: THREE.Object3D, hub: THREE.MeshBasicMaterial) {
  dropNamed(group, 'XYZ');
  addNamed(group, 'XYZ', [new THREE.SphereGeometry(.032, 16, 12)], hub);
}

/** Hover guide lines: warm hairline instead of the default white scratch. */
function tintGuides(group: THREE.Object3D) {
  const lines: THREE.LineBasicMaterial[] = [];
  group.traverse(child => {
    if (!(child as THREE.Line).isLine) return;
    const line = (child as THREE.Line).material as THREE.LineBasicMaterial;
    line.color.set(GUIDE_COLOR);
    line.opacity = GUIDE_OPACITY;
    lines.push(line);
  });
  return lines;
}

/** Handles grow while grabbed; the scale must be applied before the handle's own
 *  matrix is composed, so it hangs off each mesh instead of the post-update pass
 *  (the gizmo resets every handle's scale at the start of each frame). */
function emphasizeHandles(group: THREE.Object3D, control: TransformControls) {
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) continue;
    const compose = mesh.updateMatrixWorld.bind(mesh);
    mesh.updateMatrixWorld = (force?: boolean) => {
      if (control.axis && control.axis === mesh.name) mesh.scale.multiplyScalar(HOVER_GROW);
      compose(force);
    };
  }
}

export function styleGizmo(control: TransformControls, kind: GizmoKind) {
  const { gizmo, helper, materialLib } = (control as unknown as Internals)._gizmo;
  control.setColors(GIZMO_COLORS.x, GIZMO_COLORS.y, GIZMO_COLORS.z, GIZMO_COLORS.active);
  const axes: Record<Axis, THREE.MeshBasicMaterial> = {
    x: materialLib.xAxis, y: materialLib.yAxis, z: materialLib.zAxis };
  const colors: Record<Axis, string> = { x: GIZMO_COLORS.x, y: GIZMO_COLORS.y, z: GIZMO_COLORS.z };
  const hub = kind === 'translate' ? material('#ffeccd', HUB_OPACITY.idle) : undefined;
  for (const axis of AXES) {
    if (kind === 'scale') {
      axes[axis] = material(GIZMO_HANDLE_COLOR, BASE_OPACITY.scale);
      colors[axis] = GIZMO_HANDLE_COLOR;
    }
    axes[axis].opacity = BASE_OPACITY[kind];
    axes[axis].depthTest = true; axes[axis].depthWrite = false;
    // Rotation rings keep their geometry; only move and scale are rebuilt.
    if (kind !== 'rotate') rebuildAxis(gizmo[kind], axis, kind, axes[axis]);
  }
  if (kind === 'translate' && hub) reshapeHub(gizmo[kind], hub);
  emphasizeHandles(gizmo[kind], control);
  const guides = tintGuides(helper[kind]);
  // Picking runs through the invisible picker meshes, so the drawn handles must
  // never answer a scene-wide raycast themselves.
  for (const group of [gizmo[kind], helper[kind]]) {
    group.traverse(child => {
      child.raycast = () => {};
      child.renderOrder = RENDER_ORDER;
    });
  }
  (control as Styled).__gizmoLook = { kind, guides, axes, colors, hub };
}

/** Called after each helper update: the grabbed axis turns saturated, the rest
 *  keep exactly their idle look (no dimming — 用户要求"其他轴不要变色"). */
export function applyGizmoLook(control: TransformControls) {
  const look = (control as Styled).__gizmoLook;
  if (!look) return;
  const grabbed = AXES.find(axis => control.axis === LETTERS[axis]);
  const dragging = Boolean((control as unknown as { dragging?: boolean }).dragging);
  for (const axis of AXES) {
    const axisMaterial = look.axes[axis];
    const active = axis === grabbed;
    axisMaterial.opacity = active ? 1 : BASE_OPACITY[look.kind];
    // TransformControls also brightens the two axes of a plane picker; the
    // visible planes are gone, so only an exact axis hover may change colour.
    axisMaterial.color.set(active ? GIZMO_ACTIVE_COLORS[axis] : look.colors[axis]);
  }
  for (const line of look.guides) {
    line.color.set(grabbed ? GIZMO_ACTIVE_COLORS[grabbed] : GUIDE_COLOR);
    line.opacity = dragging ? GUIDE_DRAG_OPACITY : GUIDE_OPACITY;
  }
  if (look.hub) look.hub.opacity = control.axis === 'XYZ' ? HUB_OPACITY.hover : HUB_OPACITY.idle;
}
