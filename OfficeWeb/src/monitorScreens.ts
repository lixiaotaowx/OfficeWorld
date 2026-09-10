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
      // The manager office screen has no claimable seat yet, so it is skipped.
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
      if (!quad) return;
      quad.userData.monitorSeat = seat.index;
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
   * Size and orientation come from the authored panel (world bounding box and
   * world quaternion, so any tilt is preserved), but the geometry is a plain
   * PlaneGeometry whose UVs map the whole canvas, and it is pushed out to the
   * monitor's front face because the authored panel ships buried inside the
   * monitor body.
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
    const shellBox = new THREE.Box3().setFromObject(shell);
    const panelCenter = panelBox.getCenter(new THREE.Vector3());
    const shellCenter = shellBox.getCenter(new THREE.Vector3());
    const panelSize = panelBox.getSize(new THREE.Vector3());
    const shellSize = shellBox.getSize(new THREE.Vector3());

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

    // Slide it out of the monitor, towards whoever sits down there.
    const towardChair = Math.sign(seat.chair[thin] - panelCenter[thin]) || 1;
    const worldPosition = panelCenter.clone();
    worldPosition[thin] =
      shellCenter[thin] + towardChair * (shellSize[thin] / 2 + 0.012);
    const worldQuaternion = panel.getWorldQuaternion(new THREE.Quaternion());

    // Several desks ship their panel facing away from the desk's own chair, so
    // turn the quad around when its normal points the wrong way: otherwise the
    // person sitting there sees the back of the screen (and a raycast, which
    // honours material.side, thinks the monitor is in front of it).
    const toChair = new THREE.Vector3(
      seat.chair.x - worldPosition.x,
      0,
      seat.chair.z - worldPosition.z,
    ).normalize();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion);
    if (normal.dot(toChair) < 0)
      worldQuaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
      );

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
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
      // The screen quads are ours, so they leave the scene with us.
      slot.mesh?.geometry.dispose();
      slot.mesh?.removeFromParent();
    }
    this.slots.clear();
  }
}
