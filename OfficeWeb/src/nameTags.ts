// A name tag above every character's head.
//
// Drawn into a canvas and carried by a sprite parented to the avatar's root, so
// it follows the model with no per-frame work. Its size is fixed **on screen**
// (CSS pixels, not metres): the same name reads the same whether you are looking
// at the whole office or standing next to somebody. Colours match the right-hand
// directory (自己 lime, 成员 ivory, 访客 amber) so the scene and the list read as
// the same thing, and distant tags fade instead of turning into clutter.
import * as THREE from "three";

export type NameTagKind = "me" | "employee" | "visitor";

export interface NameTagItem {
  id: string;
  name: string;
  kind: NameTagKind;
  /** 在座 (green dot) or 离桌 (red dot); see src/presenceInput.ts. */
  atDesk: boolean;
  /** The avatar root the tag hangs from. */
  object: THREE.Object3D;
  /** Height above the avatar's feet; seated characters need a lower tag. */
  height: number;
}

/**
 * On-screen height of the pill, in CSS pixels. It is fixed: the tag is sized
 * against the display, not against the world, so a name stays the same size
 * whether you are looking at the whole office or standing next to somebody.
 */
const TAG_PIXELS = 24;
const CANVAS_HEIGHT = 80;
const PAD = 20;
const BORDER = 3;
/** Room around the pill for its drop shadow, in canvas pixels. */
const INSET = 6;
const FONT = '600 42px "Noto Sans CJK SC", "Microsoft YaHei", sans-serif';
const MAX_CHARS = 12;
/** Full opacity up close, faint but still readable right across the office. */
const FADE_NEAR = 7;
const FADE_FAR = 34;
const FADE_MIN = 0.38;
/** Vertical field of view used when a camera cannot be asked for one. */
const FALLBACK_FOV = 40;
/**
 * How far above the Head bone the tag hangs, in metres.
 *
 * **That alone is not enough for the ruler character** (2026-09-28 用户：
 * 「名字挡着帽子了 提高一下字」): its Head bone sits at 1.08m while the板/帽子顶到
 * 1.38~1.72m，所以固定 +0.36 正好压在帽子上。`crownTop()` 量一次"头顶最高点"，
 * 取两者更高的那个。
 */
const HEAD_GAP = 0.36;
/**
 * Clearance between the top of the head/hat and the middle of the pill.
 *
 * The pill is a fixed 24 CSS pixels tall on screen, so at office-wide distances
 * its bottom half is ~0.13m of world space: 0.26 keeps the whole pill clear of
 * the hat instead of only its centre.
 */
const CROWN_GAP = 0.26;

const SKINS: Record<NameTagKind, { bg: string; fg: string; border: string }> = {
  me: { bg: "#d7ed9d", fg: "#26312b", border: "#a9c274" },
  employee: { bg: "#f4f7ee", fg: "#26312b", border: "#8ea47c" },
  visitor: { bg: "#f3dfae", fg: "#5b3d0f", border: "#c08f2c" },
};

/** Room reserved on the left of the pill for the 在座 / 离桌 dot. */
const DOT_AREA = 34;
const DOT_RADIUS = 9;
const DOT_X = DOT_AREA / 2 + 2;
const DOT_AT_DESK = "#3f9d4f";
const DOT_AWAY = "#cf4a38";

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paint(name: string, kind: NameTagKind, atDesk: boolean): HTMLCanvasElement {
  const label = name.length > MAX_CHARS ? `${name.slice(0, MAX_CHARS - 1)}…` : name;
  const skin = SKINS[kind];
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = FONT;
  const width = Math.ceil(measure.measureText(label).width) + PAD * 2 + DOT_AREA;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.font = FONT;
  ctx.lineWidth = BORDER * 2;
  ctx.fillStyle = skin.bg;
  ctx.strokeStyle = skin.border;
  rounded(ctx, INSET, INSET, width - INSET * 2, CANVAS_HEIGHT - INSET * 2,
    (CANVAS_HEIGHT - INSET * 2) / 2);
  // A soft shadow keeps an ivory tag readable against a pale wall.
  ctx.shadowColor = "rgba(18, 28, 20, 0.45)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.stroke();
  // 在座 / 离桌 dot, then the name centred in the space that is left.
  ctx.beginPath();
  ctx.arc(DOT_X, CANVAS_HEIGHT / 2, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = atDesk ? DOT_AT_DESK : DOT_AWAY;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(24, 32, 22, 0.28)";
  ctx.stroke();
  ctx.fillStyle = skin.fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, DOT_AREA + (width - DOT_AREA) / 2, CANVAS_HEIGHT / 2 + 1);
  return canvas;
}

interface Entry {
  sprite: THREE.Sprite;
  texture: THREE.CanvasTexture;
  material: THREE.SpriteMaterial;
  /** Name + kind, so the canvas is only redrawn when either actually changes. */
  drawn: string;
  parent: THREE.Object3D;
  name: string;
  kind: NameTagKind;
  atDesk: boolean;
  /** Width / height of the painted pill, so the sprite is not stretched. */
  aspect: number;
  head?: THREE.Object3D;
}

export class NameTags {
  private entries = new Map<string, Entry>();
  private worldPosition = new THREE.Vector3();
  private projected = new THREE.Vector3();
  private corner = new THREE.Vector3();
  /** Last measured on-screen height, in CSS pixels, for the diagnostics hook. */
  private pixels = 0;

  /**
   * World Y of the highest point of this character **including the hat it is
   * wearing**, or `-Infinity` when it has no meshes yet (model still loading).
   * Cheap enough for the render loop: it walks the handful of meshes and their
   * cached bounding boxes.
   */
  private crownTop(object: THREE.Object3D): number {
    let high = -Infinity;
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh && !(mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh) return;
      if (mesh.visible === false) return;
      const geometry = mesh.geometry as THREE.BufferGeometry | undefined;
      if (!geometry) return;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box) return;
      for (let i = 0; i < 8; i++) {
        this.corner.set(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        );
        this.corner.applyMatrix4(mesh.matrixWorld);
        if (this.corner.y > high) high = this.corner.y;
      }
    });
    return high;
  }

  /** Match the tag set to the current cast: create, repaint, re-parent, drop. */
  sync(items: NameTagItem[]) {
    const seen = new Set<string>();
    for (const item of items) {
      seen.add(item.id);
      const drawn = `${item.name}:${item.kind}:${item.atDesk ? "desk" : "away"}`;
      let entry = this.entries.get(item.id);
      if (!entry) {
        const canvas = paint(item.name, item.kind, item.atDesk);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          // Fixed size on the display: three.js multiplies the scale by the view
          // distance, which cancels perspective, so `render()` can size the tag
          // in CSS pixels instead of metres.
          sizeAttenuation: false,
          // Tags stay legible over desks, plants and monitors; a name you have
          // to orbit the camera to read is worse than useless.
          depthTest: false,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 25;
        // A name tag is an overlay, not scenery: it must never take part in
        // picking. (Sprite.raycast also needs `raycaster.camera`, which the
        // diagnostics' plain `new Raycaster(origin, direction)` has not set, so
        // leaving them pickable made those raycasts throw.)
        sprite.raycast = () => {};
        item.object.add(sprite);
        entry = { sprite, texture, material, drawn, parent: item.object, name: item.name,
          kind: item.kind, atDesk: item.atDesk, aspect: canvas.width / canvas.height };
        this.entries.set(item.id, entry);
      } else {
        if (entry.drawn !== drawn) {
          const canvas = paint(item.name, item.kind, item.atDesk);
          entry.texture.image = canvas;
          entry.texture.needsUpdate = true;
          entry.aspect = canvas.width / canvas.height;
          entry.drawn = drawn;
          entry.name = item.name;
          entry.kind = item.kind;
          entry.atDesk = item.atDesk;
        }
        if (entry.parent !== item.object) {
          entry.parent.remove(entry.sprite);
          item.object.add(entry.sprite);
          entry.parent = item.object;
        }
      }
      entry.sprite.position.set(0, item.height, 0);
      // Model loading is asynchronous. Resolve again until its head exists.
      let ancestor = entry.head;
      while (ancestor && ancestor !== item.object) ancestor = ancestor.parent ?? undefined;
      if (!ancestor) {
        entry.head = undefined;
        item.object.traverse(object => {
          if ((object as THREE.Bone).isBone && /^(mixamorig:?Head|Head)$/.test(object.name)) {
            entry!.head = object;
          }
        });
      }
      if (entry.head) {
        entry.head.getWorldPosition(this.worldPosition);
        // Follow the animated head, including its forward lean while seated.
        this.worldPosition.y += HEAD_GAP;
        // …but never let the pill sit on top of a hat: hang it above whatever is
        // actually the highest bit of this character right now.
        const crown = this.crownTop(item.object);
        if (Number.isFinite(crown)) this.worldPosition.y = Math.max(this.worldPosition.y, crown + CROWN_GAP);
        item.object.worldToLocal(this.worldPosition);
        entry.sprite.position.copy(this.worldPosition);
      }
      entry.sprite.visible = true;
    }
    for (const [id, entry] of this.entries) {
      if (seen.has(id)) continue;
      entry.parent.remove(entry.sprite);
      entry.material.dispose();
      entry.texture.dispose();
      this.entries.delete(id);
    }
  }

  /**
   * Size every tag to `TAG_PIXELS` CSS pixels tall on this display and fade the
   * distant ones. Called from the render loop with the canvas height, so a
   * resize or a different field of view keeps the same on-screen size.
   */
  render(camera: THREE.Camera, viewportHeight: number) {
    const fov = (camera as THREE.PerspectiveCamera).fov || FALLBACK_FOV;
    // A non-attenuated sprite occupies scale / (2 tan(fov/2)) of the viewport.
    const unit = (TAG_PIXELS * 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)) /
      Math.max(1, viewportHeight);
    this.pixels = unit * Math.max(1, viewportHeight) /
      (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    for (const entry of this.entries.values()) {
      entry.sprite.scale.set(unit * entry.aspect, unit, 1);
      entry.sprite.getWorldPosition(this.worldPosition);
      this.projected.copy(this.worldPosition).project(camera);
      const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
      const marginX = TAG_PIXELS * entry.aspect / Math.max(1, viewportHeight * aspect);
      const marginY = TAG_PIXELS / Math.max(1, viewportHeight);
      // Hide whole pills outside the view, rather than leaving clipped names at its edges.
      entry.sprite.visible = this.projected.z > -1 && this.projected.z < 1 &&
        Math.abs(this.projected.x) < 1 - marginX && Math.abs(this.projected.y) < 1 - marginY;
      const distance = camera.position.distanceTo(
        this.worldPosition,
      );
      const t = (distance - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
      entry.material.opacity = THREE.MathUtils.clamp(1 - t * (1 - FADE_MIN), FADE_MIN, 1);
    }
  }

  /** Diagnostics for the browser harness. */
  info() {
    return [...this.entries].map(([id, entry]) => ({
      id,
      name: entry.name,
      kind: entry.kind,
      /** 在座 / 离桌, for the browser harness. */
      atDesk: entry.atDesk,
      y: Math.round(entry.sprite.position.y * 100) / 100,
      opacity: Math.round(entry.material.opacity * 100) / 100,
      /** False once the tag is sized against the display, not the world. */
      screenSpace: entry.material.sizeAttenuation === false,
      scaleY: Math.round(entry.sprite.scale.y * 10000) / 10000,
      pixels: Math.round(this.pixels * 10) / 10,
    }));
  }

  dispose() {
    for (const entry of this.entries.values()) {
      entry.parent.remove(entry.sprite);
      entry.material.dispose();
      entry.texture.dispose();
    }
    this.entries.clear();
  }
}
