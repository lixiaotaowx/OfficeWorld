// 小窗里那个"有人来看我了"的 3D 小舞台。
//
// 用户 2026-09-18：「当有人看我时，除了绿色，还要把那个看我的人从状态栏头像中跳出来，
// 站在状态栏上很大，做一个动作，动作就用下载的动作库里面找一个」。
//
// 所以：把**看我的那个人的角色**（不是我的）用真正的 3D 渲染出来，让他站在头像条上
// （画布下边缘正好贴着条子的上边缘，看起来就是站在任务栏上），从角色自带的动作库里挑
// 一条来演——默认 `Wave`（招手），就是"我来看你啦"。
//
// 这一段是**按需加载**的（dock.tsx 里 `import('./dockStage')`）：平时小窗页面还是几 KB，
// 只有真有人来看时才把 three.js 和角色模型拉下来。
import * as THREE from 'three';
import { loadCharacter, releaseCharacter } from './characterModel';
import { DEFAULT_APPEARANCE, resolveAppearance, type Appearance } from './look';
import { GREET_CANVAS, greetClip, greetMode, type GreetMode } from './dockRules';

export interface DockStage {
  /** 停掉渲染、释放 GPU 资源。 */
  dispose: () => void;
}

/** 画布尺寸（CSS 像素）：够大才叫"站在状态栏上很大"，宽度也够招手时不碰到边。 */
export const STAGE_WIDTH = GREET_CANVAS.call.width;
export const STAGE_HEIGHT = GREET_CANVAS.call.height;

/**
 * 在 `canvas` 上渲染 `characterId`。
 *
 * `size` 决定这是哪种场合（用户 2026-09-20）：`call` 是有人打电话过来，人物**照现在这么大**
 * 演一段招手；`peek` 只是鼠标停在头像上，画布小一半（人物也就小一倍）并且**不演动作**，
 * 站着待着就行。相机、灯光、站位两种场合完全一样，所以"小一倍"是同一套取景下的真实大小。
 *
 * 演完那一条就换成 idle 待着（舞台还没收起时不能僵在半空），`dispose()` 之后一切释放。
 */
export async function mountDockStage(canvas: HTMLCanvasElement, options: {
  /** 那个人的配色与配件；老客户端没带就按默认外观渲染。 */
  appearance?: Appearance;
  size?: GreetMode;
  /** 直接指定演哪条（不给就按 `size` 取：只有打电话过来才招手）。 */
  clip?: string;
}): Promise<DockStage> {
  const mode = greetMode(options.size);
  const width = GREET_CANVAS[mode].width, height = GREET_CANVAS[mode].height;
  canvas.width = width;
  canvas.height = height;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearAlpha(0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  // 相机把 1.72 米高的人框满（占画面八成以上，才叫"站在状态栏上很大"）：
  // 脚 = 画布下边缘 = 头像条上边缘。
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 30);
  camera.position.set(0, 1.0, 3.4);
  camera.lookAt(0, 0.92, 0);
  // 房间是暗的，这里自带一套灯，不然拉出来的角色是黑的。
  scene.add(new THREE.HemisphereLight(0xffffff, 0x51604f, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(1.8, 3.2, 2.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa6f0bd, 1.4);
  rim.position.set(-2.2, 2.4, -1.8);
  scene.add(rim);

  const loaded = await loadCharacter(options.appearance ?? DEFAULT_APPEARANCE).catch(error => {
    renderer.dispose();
    throw error;
  });
  // 尺子角色导出时就面朝 +Z（相机的方向），不要再转身——转过一次是"背对着你"。
  scene.add(loaded.model);
  // 脚下一小块接触阴影：看起来才是站在任务栏上，而不是飘着。
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 32),
    new THREE.MeshBasicMaterial({ color: 0x0b1a10, transparent: true, opacity: 0.34, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = loaded.groundY + 0.005;
  scene.add(shadow);

  // 演哪一条：调用方可以点名，缺省按场合取（peek 什么都不演，站着就好）。
  const requested = options.clip ?? greetClip(mode);
  const action = requested ? loaded.action(requested) : undefined;
  const idle = loaded.idle;
  idle.play();
  idle.setEffectiveWeight(1);
  let waving = false;
  if (action) {
    action.reset();
    action.setLoop(THREE.LoopRepeat, 2);
    action.clampWhenFinished = false;
    action.play();
    action.setEffectiveWeight(1);
    idle.setEffectiveWeight(0.25);
    waving = true;
    action.getMixer().addEventListener('finished', () => {
      waving = false;
      idle.setEffectiveWeight(1);
    });
  }

  const clock = new THREE.Clock();
  let raf = 0;
  let stopped = false;
  // 一小块探针，挂在画布上给测试和排查用：这一台上演的是哪一条、手到底动没动。
  // "所有角色都要适配打招呼的动作"（用户 2026-09-20）得真的量出来才算数——光查 GLB 里
  // 有没有 `Wave` 这个名字，是查不出"这条动作套在他身上根本不动"的。
  const probe = { mode, appearance: loaded.appearance, clip: requested || '', frames: 0, motion: 0 };
  (canvas as HTMLCanvasElement & { __dockStage?: typeof probe }).__dockStage = probe;
  // 手（招的那只）在动没动。**按名字找，不能写死 `Wrist.R`**：glTF 的节点名里有点号，
  // three.js 的 GLTFLoader 会把它去掉（实测叫 `WristR`/`WristL`），写死就一个都找不到。
  const wrists = [...loaded.bones.entries()]
    .filter(([name]) => /wrist|hand/i.test(name))
    .map(([, bone]) => bone);
  const point = new THREE.Vector3();
  const lastWristY = wrists.map(bone => bone.getWorldPosition(point).y);
  const tick = () => {
    if (stopped) return;
    raf = requestAnimationFrame(tick);
    const delta = Math.min(clock.getDelta(), 0.05);
    loaded.mixer.update(delta);
    // 招手的时候整个人轻轻起伏一下，看着更像"蹦出来打招呼"。
    loaded.model.position.y = loaded.groundY +
      (waving ? Math.abs(Math.sin(performance.now() / 260)) * 0.035 : 0);
    probe.frames++;
    wrists.forEach((bone, index) => {
      const y = bone.getWorldPosition(point).y;
      probe.motion += Math.abs(y - lastWristY[index]);
      lastWristY[index] = y;
    });
    renderer.render(scene, camera);
  };
  tick();

  return {
    dispose() {
      stopped = true;
      cancelAnimationFrame(raf);
      delete (canvas as HTMLCanvasElement & { __dockStage?: typeof probe }).__dockStage;
      releaseCharacter(loaded);
      shadow.geometry.dispose();
      shadow.material.dispose();
      renderer.dispose();
    },
  };
}
