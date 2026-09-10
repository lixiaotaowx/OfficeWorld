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
  /** Desk label, drawn on the placeholder. */
  label: string;
  /** The screen plane itself, used by the visibility probe. */
  mesh?: THREE.Mesh;
}

export class MonitorScreens {
  private slots = new Map<number, ScreenSlot>();

  /** Find the per-seat screen meshes in the loaded scene and take them over. */
  attach(scene: THREE.Object3D, base: THREE.MeshStandardMaterial) {
    // The visible monitor models ship separately from the flat screen plane and
    // the plane is buried inside them, so index the models first and push each
    // plane out to the monitor's front face afterwards.
    const shells = new Map<number, THREE.Object3D>();
    scene.traverse((object) => {
      const match = /^(.+) approved monitor$/.exec(object.name || "");
      if (!match) return;
      const seat = WORKSTATIONS.find((w) => w.id === match[1]);
      if (seat) shells.set(seat.index, object);
    });

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const seatId = object.userData?.seat_id as string | undefined;
      if (!seatId || object.userData?.role !== "shared_screen") return;
      const seat = WORKSTATIONS.find((w) => w.id === seatId);
      // The manager office screen has no claimable seat yet, so it is skipped.
      if (!seat) return;
      if (this.slots.has(seat.index)) return;
      const slot = this.createSlot(base, seat.label);
      this.slots.set(seat.index, slot);
      // Take the mesh over with its own material instance.
      object.material = slot.material;
      object.userData.monitorSeat = seat.index;
      slot.mesh = object;
      this.moveInFrontOfShell(scene, object, shells.get(seat.index), seat);
    });
    return this.slots.size;
  }

  /**
   * Slide the flat screen plane out of the monitor body. Measured from the
   * asset: the plane is 0.006 thick and sits inside a 0.168 deep monitor, so
   * without this the thumbnail is painted onto a surface nobody can see.
   */
  private moveInFrontOfShell(
    scene: THREE.Object3D,
    plane: THREE.Object3D,
    shell: THREE.Object3D | undefined,
    seat: Workstation,
  ) {
    if (!shell) return;
    scene.updateMatrixWorld(true);
    const planeBox = new THREE.Box3().setFromObject(plane);
    const shellBox = new THREE.Box3().setFromObject(shell);
    const planeCenter = planeBox.getCenter(new THREE.Vector3());
    const shellCenter = shellBox.getCenter(new THREE.Vector3());
    const planeSize = planeBox.getSize(new THREE.Vector3());
    const shellSize = shellBox.getSize(new THREE.Vector3());

    // The thinnest dimension of a flat plane is the axis it faces along.
    const axis: "x" | "y" | "z" =
      planeSize.x <= planeSize.y && planeSize.x <= planeSize.z
        ? "x"
        : planeSize.y <= planeSize.z
          ? "y"
          : "z";

    // Face the person sitting down, i.e. out of the monitor's front. A monitor
    // screen is upright, so the axis is horizontal (x or z).
    const pick = (v: THREE.Vector3, fallback: number) =>
      axis === "x" ? v.x : axis === "z" ? v.z : fallback;
    const chairCoord = pick(
      new THREE.Vector3(seat.chair.x, seat.display.y, seat.chair.z),
      seat.display.y,
    );
    const planeCoord = pick(planeCenter, planeCenter.y);
    const shellCenterCoord = pick(shellCenter, shellCenter.y);
    const shellSizeCoord = pick(shellSize, shellSize.y);

    const towardChair = Math.sign(chairCoord - planeCoord) || 1;
    const front = shellCenterCoord + towardChair * (shellSizeCoord / 2 + 0.012);
    const delta = front - planeCoord;
    if (Math.abs(delta) < 0.004) return;

    const worldDelta = new THREE.Vector3();
    if (axis === "x") worldDelta.x = delta;
    else if (axis === "z") worldDelta.z = delta;
    else worldDelta.y = delta;
    // Convert the world offset into the plane's parent space.
    const parent = plane.parent;
    if (parent) {
      const inverse = new THREE.Quaternion();
      parent.getWorldQuaternion(inverse);
      worldDelta.applyQuaternion(inverse.invert());
    }
    plane.position.add(worldDelta);
    plane.updateMatrixWorld(true);
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
      label,
    };
  }

  /**
   * Placeholder shown whenever a desk has nothing to show: its label plus a
   * border, so an idle workstation still reads as a live screen.
   */
  private paintIdle(context: CanvasRenderingContext2D, label: string) {
    context.fillStyle = "#0f1a16";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.strokeStyle = "#26443a";
    context.lineWidth = 6;
    context.strokeRect(7, 7, CANVAS_WIDTH - 14, CANVAS_HEIGHT - 14);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#4d8a70";
    context.font = "600 40px system-ui, sans-serif";
    context.fillText(label, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 18);
    context.fillStyle = "#2f5245";
    context.font = "400 22px system-ui, sans-serif";
    context.fillText("未共享屏幕", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
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
