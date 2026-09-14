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
import { WORKSTATIONS, type Workstation } from "./seats";
import { findMonitorSurface, fitMonitorInset } from "./monitorSurface";
import { narrowMonitorBezel } from "./monitorBezel";

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
  revision: number;
  /** Desk label, drawn on the placeholder. */
  label: string;
  /** The screen plane itself, used by the visibility probe. */
  mesh?: THREE.Mesh;
}

export class MonitorScreens {
  private slots = new Map<number, ScreenSlot>();
  private disposed = false;

  /** Find the per-seat screen meshes in the loaded scene and take them over. */
  attach(scene: THREE.Object3D, base: THREE.MeshStandardMaterial) {
    // The visible monitor models ship separately from the flat screen plane and
    // the plane may be buried inside them. Index the actual models so each
    // clean image plane can be fitted to its front surface at display height.
    // three.js sanitises glTF node names, turning spaces and slashes into
    // underscores, so "Island_A_Seat_1 approved monitor" arrives here as
    // "Island_A_Seat_1_approved_monitor". Accept either separator.
    const shells = new Map<number, THREE.Object3D>();
    scene.traverse((object) => {
      const match = /^(.+?)[ _]approved[ _]monitor$/.exec(object.name || "");
      if (!match) return;
      const seat = WORKSTATIONS.find((w) => w.id === match[1]);
      if (seat) shells.set(seat.index, object);
    });

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const seatId = object.userData?.seat_id as string | undefined;
      if (!seatId || object.userData?.role !== "shared_screen") return;
      const seat = WORKSTATIONS.find((w) => w.id === seatId);
      // Ignore decorative displays that do not belong to a workstation.
      if (!seat) return;
      if (this.slots.has(seat.index)) return;
      const slot = this.createSlot(base, seat.label);
      const quad = this.buildScreen(
        scene,
        object,
        shells.get(seat.index),
        seat,
        slot.material,
      );
      if (!quad) {
        slot.texture.dispose();
        slot.material.dispose();
        return;
      }
      quad.userData.monitorSeat = seat.index;
      quad.userData.seat = seat.index;
      // Match the physical display, not a fixed 16:9 canvas stretched onto it.
      const geometry = quad.geometry as THREE.PlaneGeometry;
      slot.canvas.height = Math.round(CANVAS_WIDTH * geometry.parameters.height / geometry.parameters.width);
      this.paintIdle(slot.context, slot.label);
      slot.texture.needsUpdate = true;
      slot.mesh = quad;
      this.slots.set(seat.index, slot);
      // The authored panel is a 266 vertex shape whose UVs are not a single
      // image mapping, which is exactly why reusing it showed one green stripe
      // instead of the screen content. Hide it and use our own quad.
      object.visible = false;
    });
    return this.slots.size;
  }

  /**
   * Build a clean screen quad for one desk.
   *
   * The authored panel supplies orientation and a raycast seed. The actual
   * model's connected display inset supplies size and centre, preserving the
   * physical bezel. A clean PlaneGeometry maps the complete image once.
   */
  private buildScreen(
    scene: THREE.Object3D,
    panel: THREE.Object3D,
    shell: THREE.Object3D | undefined,
    seat: Workstation,
    material: THREE.Material,
  ): THREE.Mesh | null {
    scene.updateMatrixWorld(true);
    if (!shell) return null;
    const panelBox = new THREE.Box3().setFromObject(panel);
    const panelCenter = panelBox.getCenter(new THREE.Vector3());
    const panelSize = panelBox.getSize(new THREE.Vector3());

    // The thinnest dimension of a flat panel is the axis it faces along.
    const thin: "x" | "y" | "z" =
      panelSize.x <= panelSize.y && panelSize.x <= panelSize.z
        ? "x"
        : panelSize.y <= panelSize.z
          ? "y"
          : "z";
    if (thin === "y") return null; // a floor panel, not a screen

    // A screen is upright: the other horizontal axis is its width, y its height.
    const other: "x" | "z" = thin === "x" ? "z" : "x";
    const width = Math.max(panelSize[other], panelSize.y);
    const height = Math.min(panelSize[other], panelSize.y);

    const worldQuaternion = panel.getWorldQuaternion(new THREE.Quaternion());

    // Several desks ship their panel facing away from the desk's own chair, so
    // turn the quad around when its normal points the wrong way: otherwise the
    // person sitting there sees the back of the screen (and a raycast, which
    // honours material.side, thinks the monitor is in front of it).
    const toChair = new THREE.Vector3(
      seat.chair.x - panelCenter.x,
      0,
      seat.chair.z - panelCenter.z,
    ).normalize();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion);
    if (normal.dot(toChair) < 0)
      worldQuaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
      );
    normal.set(0, 0, 1).applyQuaternion(worldQuaternion);
    narrowMonitorBezel(shell, panelCenter, worldQuaternion);
    const inset = fitMonitorInset(shell, panelCenter, worldQuaternion);
    const worldPosition = inset?.center ?? findMonitorSurface(shell, panelCenter, normal);
    if (!worldPosition) return null;

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(inset?.width ?? width, inset?.height ?? height), material);
    quad.userData.fittedInset = Boolean(inset);
    quad.name = `seatScreen_${seat.id}`;
    // Express the world transform in the scene's own space.
    const local = new THREE.Matrix4()
      .compose(worldPosition, worldQuaternion, new THREE.Vector3(1, 1, 1))
      .premultiply(new THREE.Matrix4().copy(scene.matrixWorld).invert());
    local.decompose(quad.position, quad.quaternion, quad.scale);
    scene.add(quad);
    quad.updateMatrixWorld(true);
    return quad;
  }


  private createSlot(
    base: THREE.MeshStandardMaterial,
    label: string,
  ): ScreenSlot {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d")!;
    this.paintIdle(context, label);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    // Screens use our PlaneGeometry, not the imported glTF UV layout.
    texture.flipY = true;
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
      revision: 0,
      label,
    };
  }

  /**
   * Placeholder shown whenever a desk has nothing to show: its label plus a
   * border, so an idle workstation still reads as a live screen.
   */
  private paintIdle(context: CanvasRenderingContext2D, label: string) {
    const { width, height } = context.canvas;
    context.fillStyle = "#0f1a16";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#26443a";
    context.lineWidth = 6;
    context.strokeRect(7, 7, width - 14, height - 14);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#4d8a70";
    context.font = "600 40px system-ui, sans-serif";
    context.fillText(label, width / 2, height / 2 - 18);
    context.fillStyle = "#2f5245";
    context.font = "400 22px system-ui, sans-serif";
    context.fillText("未共享屏幕", width / 2, height / 2 + 30);
  }

  /** Material the scene should use for this seat's monitor, if we own it. */
  materialFor(seatIndex: number) {
    return this.slots.get(seatIndex)?.material;
  }

  /** The screen plane for a seat, so a test can check if it is occluded. */
  meshFor(seatIndex: number) {
    return this.slots.get(seatIndex)?.mesh;
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
      Math.floor(slot.canvas.width / 2),
      Math.floor(slot.canvas.height / 2),
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
    if (preview === slot.shown && !slot.loading && !slot.pending) return;
    slot.revision++;
    if (!preview) {
      slot.shown = null;
      slot.pending = null;
      this.paintIdle(slot.context, slot.label);
      slot.texture.needsUpdate = true;
      return;
    }
    slot.pending = preview;
    if (slot.loading) return;
    this.drain(slot);
  }

  /** Decode one preview at a time so a burst of frames cannot pile up. */
  private drain(slot: ScreenSlot) {
    if (this.disposed) return;
    const next = slot.pending;
    if (!next) {
      slot.loading = false;
      return;
    }
    slot.pending = null;
    slot.loading = true;
    const revision = slot.revision;
    const image = new Image();
    image.onload = () => {
      if (this.disposed) return;
      if (revision !== slot.revision) { this.drain(slot); return; }
      const canvasWidth = slot.canvas.width, canvasHeight = slot.canvas.height;
      const scale = Math.min(
        canvasWidth / image.width,
        canvasHeight / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      slot.context.fillStyle = "#101a17";
      slot.context.fillRect(0, 0, canvasWidth, canvasHeight);
      slot.context.drawImage(
        image,
        (canvasWidth - width) / 2,
        (canvasHeight - height) / 2,
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
    this.disposed = true;
    for (const slot of this.slots.values()) {
      slot.texture.dispose();
      slot.material.dispose();
      // The screen quads are ours, so they leave the scene with us.
      slot.mesh?.geometry.dispose();
      slot.mesh?.removeFromParent();
      slot.pending = null;
      slot.shown = null;
      slot.canvas.width = 0;
      slot.canvas.height = 0;
    }
    this.slots.clear();
  }
}
