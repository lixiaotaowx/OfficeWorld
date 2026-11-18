import * as THREE from "three";

/** 办公室里的猫：方块拼的橘猫，状态由服务器广播（position/pose/moving）。 */
export class OfficeCat {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly legs: THREE.Mesh[] = [];
  private target: { x: number; y: number; z: number; rot: number; pose: string; moving: boolean } | null = null;
  private readonly geometry = new THREE.BoxGeometry(1, 1, 1);
  private readonly staticGeometry: THREE.BufferGeometry[] = [];
  private readonly targetPosition = new THREE.Vector3();
  private readonly fur = new THREE.MeshStandardMaterial({ color: "#ce9261", roughness: .9 });
  private readonly dark = new THREE.MeshStandardMaterial({ color: "#342b2a", roughness: .9 });

  constructor(scene: THREE.Scene) {
    this.root.name = "office-cat";
    this.root.visible = false;
    this.root.add(this.body);
    scene.add(this.root);
    const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number,
      material: THREE.Material = this.fur) => {
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.scale.set(sx, sy, sz);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this.body.add(mesh);
      return mesh;
    };
    // 身体和头，耳朵与鼻子是深色的。
    box(.28, .25, .47, 0, .3, 0);
    box(.3, .27, .25, 0, .43, .25);
    for (const x of [-.1, .1]) {
      box(.08, .14, .1, x, .61, .24);
      box(.035, .04, .015, x, .46, .38, this.dark);
    }
    box(.045, .03, .02, 0, .4, .39, this.dark);
    // 四条腿：走路时前后摆。
    for (const x of [-.1, .1]) for (const z of [-.16, .15]) this.legs.push(box(.065, .2, .065, x, .1, z));
    // 尾巴翘起。
    const tail = box(.065, .065, .36, 0, .36, -.37);
    tail.rotation.x = -.4;
    // 静态部分合并（同材质的方块合一个网格），腿保持独立才能摆动。
    for (const material of [this.fur, this.dark]) {
      const parts = this.body.children.filter(mesh => mesh instanceof THREE.Mesh
        && mesh.material === material && !this.legs.includes(mesh));
      const merged = mergeBoxes(parts as THREE.Mesh[], this.geometry);
      if (!merged) continue;
      for (const mesh of parts) this.body.remove(mesh);
      const combined = new THREE.Mesh(merged, material);
      combined.castShadow = true;
      this.body.add(combined);
      this.staticGeometry.push(merged);
    }
  }

  /** 服务器广播的猫状态；第一次先直接落到目标位置，之后平滑跟随。 */
  set(state: { x: number; y: number; z: number; rot: number; seq: number; pose?: string; moving?: boolean }) {
    if (![state.x, state.y, state.z, state.rot, state.seq].every(Number.isFinite)) return;
    if (!this.target) this.root.position.set(state.x, state.y, state.z);
    this.target = state;
    this.root.visible = true;
  }

  /** 影子渲染只在猫真的在动（或理毛）时需要，空闲时省掉。 */
  get shadowMoving(): boolean {
    const state = this.target;
    if (!state) return false;
    return state.moving || state.pose === "groom"
      || Math.abs(this.root.position.x - state.x) > .001
      || Math.abs(this.root.position.y - state.y) > .001
      || Math.abs(this.root.position.z - state.z) > .001
      || Math.abs(Math.atan2(Math.sin(state.rot - this.root.rotation.y), Math.cos(state.rot - this.root.rotation.y))) > .001;
  }

  tick(delta: number, now: number) {
    const state = this.target;
    if (!state) return;
    this.root.position.lerp(this.targetPosition.set(state.x, state.y, state.z), 1 - Math.exp(-delta * 12));
    this.root.rotation.y += Math.atan2(Math.sin(state.rot - this.root.rotation.y), Math.cos(state.rot - this.root.rotation.y)) * (1 - Math.exp(-delta * 10));
    const lying = state.pose === "sleep" || state.pose === "lie";
    this.body.scale.y = lying ? .5 : state.pose === "sit" ? .8 : 1;
    this.body.rotation.z = state.pose === "groom" ? Math.sin(now / 220) * .12 : 0;
    this.legs.forEach((leg, index) => {
      leg.rotation.x = state.moving ? Math.sin(now / 90 + index * Math.PI) * .4 : 0;
    });
  }

  dispose() {
    this.root.removeFromParent();
    this.geometry.dispose();
    for (const geometry of this.staticGeometry) geometry.dispose();
    this.fur.dispose();
    this.dark.dispose();
  }
}

/** 把一组（已按位置/缩放摆好的）方块合并成一个网格。 */
function mergeBoxes(meshes: THREE.Mesh[], source: THREE.BoxGeometry): THREE.BufferGeometry | null {
  const geometries = meshes.map(mesh => {
    mesh.updateMatrix();
    return source.clone().applyMatrix4(mesh.matrix);
  });
  if (!geometries.length) return null;
  const merged = mergeBufferGeometries(geometries);
  for (const geometry of geometries) geometry.dispose();
  return merged;
}

/** 最小合并：位置 + 法线 + 索引拼接（three 的 BufferGeometryUtils 等价物）。 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const position: number[] = [], normal: number[] = [], index: number[] = [];
  let offset = 0;
  for (const geometry of geometries) {
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
    const nor = geometry.getAttribute('normal') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      position.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normal.push(nor.getX(i), nor.getY(i), nor.getZ(i));
    }
    const idx = geometry.getIndex();
    if (idx) for (let i = 0; i < idx.count; i++) index.push(idx.getX(i) + offset);
    offset += pos.count;
  }
  merged.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  merged.setIndex(index);
  return merged;
}
