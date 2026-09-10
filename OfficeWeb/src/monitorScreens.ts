// Paints each workstation's shared-screen thumbnail onto its monitor mesh.
//
// The preview is the low-resolution JPEG that the server already broadcasts to
// everyone (see Design/WebMedia.md): deliberately too small to read, so it can
// be ambient. The real, smooth video stream still requires an approved request.
//
// Performance rules that matter here:
//   * one canvas + one CanvasTexture per seat, allocated lazily and reused;
//   * a texture is only re-uploaded when its preview string actually changes;
//   * each monitor owns a cloned material, so one screen never repaints another.
import * as THREE from "three";
import { WORKSTATIONS } from "./seats";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 270;

interface ScreenSlot {
  material: THREE.MeshStandardMaterial;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  /** Preview currently uploaded, so identical frames are skipped. */
  shown: string | null;
  /** In-flight decode; only the newest request is kept. */
  pending: string | null;
  loading: boolean;
}

export class MonitorScreens {
  private slots = new Map<number, ScreenSlot>();

  /** Find the per-seat screen meshes in the loaded scene and take them over. */
  attach(scene: THREE.Object3D, base: THREE.MeshStandardMaterial) {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const seatId = object.userData?.seat_id as string | undefined;
      if (!seatId || object.userData?.role !== "shared_screen") return;
      const seat = WORKSTATIONS.find((w) => w.id === seatId);
      // The manager office screen has no claimable seat yet, so it is skipped.
      if (!seat) return;
      if (this.slots.has(seat.index)) return;
      const slot = this.createSlot(base);
      this.slots.set(seat.index, slot);
      // Take the mesh over with its own material instance.
      object.material = slot.material;
      object.userData.monitorSeat = seat.index;
    });
    return this.slots.size;
  }

  private createSlot(base: THREE.MeshStandardMaterial): ScreenSlot {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d")!;
    this.paintIdle(context);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    // glTF UVs put the origin at the top-left, unlike three's default.
    texture.flipY = false;
    const material = base.clone();
    material.map = texture;
    material.emissiveMap = texture;
    // The idle screen material glows a soft green. Left as-is it would tint
    // whatever thumbnail is drawn on it, so take the tint out and let the image
    // carry its own colours, lit strongly enough to read from across the room.
    material.color.set(0xffffff);
    material.emissive.set(0xffffff);
    material.emissiveIntensity = 0.8;
    material.roughness = 0.55;
    material.needsUpdate = true;
    return {
      material,
      canvas,
      context,
      texture,
      shown: null,
      pending: null,
      loading: false,
    };
  }

  private paintIdle(context: CanvasRenderingContext2D) {
    context.fillStyle = "#101a17";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#2f4a40";
    context.fillRect(0, CANVAS_HEIGHT - 18, CANVAS_WIDTH, 18);
  }

  /** Material the scene should use for this seat's monitor, if we own it. */
  materialFor(seatIndex: number) {
    return this.slots.get(seatIndex)?.material;
  }

  /**
   * Diagnostics used by the browser harness: whether this seat's monitor is
   * showing a thumbnail, and the colour of the centre pixel of the canvas it
   * was painted onto (so a test can tell real content from the idle fill).
   */
  previewInfo(seatIndex: number) {
    const slot = this.slots.get(seatIndex);
    if (!slot) return null;
    const { data } = slot.context.getImageData(
      Math.floor(CANVAS_WIDTH / 2),
      Math.floor(CANVAS_HEIGHT / 2),
      1,
      1,
    );
    return {
      hasPreview: Boolean(slot.shown),
      textured: Boolean(slot.material.map),
      pixel: [data[0], data[1], data[2]],
    };
  }

  get seatsWithScreen() {
    return [...this.slots.keys()].sort((a, b) => a - b);
  }

  /**
   * Show `preview` (a JPEG data URL) on a seat's monitor. Passing null returns
   * the screen to its idle state.
   */
  setPreview(seatIndex: number, preview: string | null) {
    const slot = this.slots.get(seatIndex);
    if (!slot) return;
    if (preview === slot.shown) return;
    if (!preview) {
      slot.shown = null;
      slot.pending = null;
      this.paintIdle(slot.context);
      slot.texture.needsUpdate = true;
      return;
    }
    slot.pending = preview;
    if (slot.loading) return;
    this.drain(slot);
  }

  /** Decode one preview at a time so a burst of frames cannot pile up. */
  private drain(slot: ScreenSlot) {
    const next = slot.pending;
    if (!next) {
      slot.loading = false;
      return;
    }
    slot.pending = null;
    slot.loading = true;
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(
        CANVAS_WIDTH / image.width,
        CANVAS_HEIGHT / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      slot.context.fillStyle = "#101a17";
      slot.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      slot.context.drawImage(
        image,
        (CANVAS_WIDTH - width) / 2,
        (CANVAS_HEIGHT - height) / 2,
        width,
        height,
      );
      slot.texture.needsUpdate = true;
      slot.shown = next;
      this.drain(slot);
    };
    image.onerror = () => {
      slot.loading = false;
      this.drain(slot);
    };
    image.src = next;
  }

  dispose() {
    for (const slot of this.slots.values()) {
      slot.texture.dispose();
      slot.material.dispose();
    }
    this.slots.clear();
  }
}
