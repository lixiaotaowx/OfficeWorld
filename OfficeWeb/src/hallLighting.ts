import * as THREE from "three";

/** 大厅照明：三盏吊顶灯 + 发光条 + 冷色补光（影子由补光投）。 */
export class HallLighting {
  readonly group = new THREE.Group();
  private readonly panels: THREE.SpotLight[] = [];
  private readonly glow: THREE.MeshStandardMaterial;
  private readonly strip: THREE.BoxGeometry;
  private readonly rim: THREE.DirectionalLight;

  constructor(scene: THREE.Scene) {
    this.glow = new THREE.MeshStandardMaterial({
      color: "#fff0d5", emissive: "#ffc985", emissiveIntensity: 1.4, roughness: .55,
    });
    this.strip = new THREE.BoxGeometry(2.4, .015, .065);
    this.rim = new THREE.DirectionalLight("#b9d8ff", .4);
    this.group.name = "hall-lighting";
    this.rim.position.set(-8, 6, -4);
    this.rim.castShadow = true;
    this.rim.shadow.mapSize.set(1024, 1024);
    Object.assign(this.rim.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 50 });
    this.rim.shadow.camera.updateProjectionMatrix();
    this.rim.shadow.bias = -8e-5;
    this.rim.shadow.normalBias = .04;
    this.rim.shadow.radius = 1;
    this.group.add(this.rim, this.rim.target);
    for (const x of [.1, 3.2, 6.1]) {
      const panel = new THREE.SpotLight("#ffd7a4", 2, 2.4, .6);
      panel.position.set(x, 2.46, -3.5);
      panel.lookAt(x, 0, -3.5);
      panel.userData.ceilingLight = true;
      this.panels.push(panel);
      this.group.add(panel);
      const strip = new THREE.Mesh(this.strip, this.glow);
      strip.position.set(x, 2.465, -3.5);
      strip.userData.nohit = true;
      strip.userData.ceilingLight = true;
      this.group.add(strip);
    }
    scene.add(this.group);
  }

  setQuality(quality: string) {
    this.rim.castShadow = quality === "high";
    if (!this.rim.castShadow) this.rim.shadow.map?.dispose(), (this.rim.shadow.map = null);
  }

  /** 时段照明：白天全亮，傍晚暖光调低，夜里只留灯条。 */
  setTime(day: boolean, evening: boolean) {
    for (const panel of this.panels) panel.intensity = day ? 5 : evening ? 2.8 : 1.8;
    this.glow.emissiveIntensity = day ? 3 : 1.4;
    this.rim.intensity = day ? .25 : .18;
  }

  dispose() {
    this.group.removeFromParent();
    this.rim.shadow.dispose();
    this.strip.dispose();
    this.glow.dispose();
  }
}
