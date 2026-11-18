import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/** 渲染质量档位：窗口宽高 + 设备内存决定（低配走 standard，无后处理）。 */
export function detectQuality(): "high" | "low" {
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory
    ?? (navigator as unknown as { deviceMemory: number }).deviceMemory ?? 4;
  return memory >= 4 && window.innerWidth * window.innerHeight <= 2560 * 1440 ? "high" : "low";
}

/** 像素比上限随质量档位走：high 全速，low 限 1.5 省 GPU。 */
export function pixelRatioFor(width: number, height: number, devicePixelRatio: number, quality: string): number {
  return Math.min(devicePixelRatio, quality === 'high' ? 2 : 1.5);
}

/** 大厅渲染管线：环境烘焙 + GTAO + Bloom，低配直出。 */
export class HallRendering {
  private composer: EffectComposer | null = null;
  private ao: GTAOPass | null = null;
  private bloom: UnrealBloomPass | null = null;
  private environment: THREE.PMREMGenerator | null = null;
  private envTexture: THREE.Texture | null = null;
  readonly quality: string;

  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private camera: THREE.Camera) {
    this.quality = detectQuality();
  }

  prepare() {
    if (this.composer || this.quality === "standard") return;
    // 环境贴图：一间极简房间烘一张，强度压得很低（0.035）只补漫反射。
    const room = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    try {
      this.envTexture = pmrem.fromScene(room, .04).texture;
      this.scene.environment = this.envTexture;
      (this.scene as unknown as { environmentIntensity: number }).environmentIntensity = .035;
    } finally {
      room.dispose();
      pmrem.dispose();
    }
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 0 });
    const composer = new EffectComposer(this.renderer, target);
    this.composer = composer;
    composer.addPass(new RenderPass(this.scene, this.camera));
    this.ao = new GTAOPass(this.scene, this.camera);
    this.ao.updateGtaoMaterial({ radius: .3, thickness: .2, samples: 16, scale: 1 });
    this.ao.blendIntensity = .65;
    composer.addPass(this.ao);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .06, .35, 1.5);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
  }

  resize(width: number, height: number) {
    const ratio = pixelRatioFor(width, height, window.devicePixelRatio, this.quality);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    this.composer?.setPixelRatio(ratio);
    this.composer?.setSize(Math.max(1, width), Math.max(1, height));
  }

  /** 静止时关掉 AO/Bloom 只刷影子；动起来全开。 */
  render(active: boolean, shadows = true) {
    this.renderer.shadowMap.autoUpdate = false;
    if (shadows) this.renderer.shadowMap.needsUpdate = true;
    if (this.ao) this.ao.enabled = !active;
    if (this.bloom) this.bloom.enabled = !active;
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    for (const pass of this.composer?.passes ?? []) pass.dispose?.();
    this.composer?.dispose();
    this.composer = null;
    this.ao = null;
    this.bloom = null;
    this.scene.environment = null;
    this.envTexture?.dispose();
    this.envTexture = null;
  }
}
