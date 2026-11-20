/**
 * 形象 3D 实时预览（形象选择里那块画布，Dock 上也用它）。
 *
 * 职责：在容器里挂一个 WebGLRenderer，加载角色模型，按「身体」或「身体+配饰」
 * 的包围盒算出正交相机的取景范围，并在容器尺寸变化时重新取景后重绘。
 *
 * 失败处理：渲染器创建失败或模型加载失败都走同一个 fail 分支 ——
 * 前两次自动重试（间隔 500ms / 1000ms），第三次显示「形象预览暂时打不开」
 * 并给一个把重试计数清零的按钮。
 *
 * 对外只暴露一个组件，导出名保持 `L`（调用方按旧名引用）。
 */
import { r as React, j as jsx } from "./dockGreeting.js";
import {
  b as Box3,
  V as Vector3,
  O as OrthographicCamera,
  W as WebGLRenderer,
  S as SRGBColorSpace,
  a as Scene,
  p as createRendererHandle,
  l as loadCharacter,
  r as releaseCharacter,
  b0 as applyLookToCharacter,
} from "./portraitLighting.js";
import { a as lookSignature } from "./chatLocal.js";

// 打包器残留的空语句，保留只是为了让这个模块与原产物逐句对齐（无副作用）。
Promise.resolve();

/**
 * 只统计「身体」网格的包围盒。
 *
 * 跳过两类对象：配饰槽位（slots）里的节点、以及配饰本身（accessories）。
 * 材质名等于 bodyMaterial 的那个网格也算身体本体，不计入 union ——
 * 这样帽子、胡子之类的东西不会把取景范围撑大。
 */
function bodyBounds(character) {
  const bounds = new Box3();
  character.model.updateMatrixWorld(true);
  character.model.traverseVisible((node) => {
    const object = node;
    if (!object.isMesh) return;
    if (character.look.accessories.has(object.name)) return;
    if (character.look.slots.has(object.name)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (!materials.length) return;
    const isBodyMaterial = materials.some(
      (material) => (material == null ? void 0 : material.name) === character.look.bodyMaterial,
    );
    if (!isBodyMaterial) bounds.union(new Box3().setFromObject(object, true));
  });
  return bounds;
}

const BODY_MARGIN_SCALE = 1.55;
const FACE_FRAMING = {
  y: 1.16,
  half: 0.22,
};

/**
 * 默认取景：按身体包围盒给一个正交相机。
 * 测不到任何网格时退回固定的人脸比例（FACE_FRAMING）。
 */
function fallbackFrameCamera(character) {
  const bounds = bodyBounds(character);
  if (bounds.isEmpty()) {
    const camera = new OrthographicCamera(
      -0.22,
      FACE_FRAMING.half,
      FACE_FRAMING.half,
      -0.22,
      0.1,
      20,
    );
    camera.position.set(0, FACE_FRAMING.y, 3);
    camera.lookAt(0, FACE_FRAMING.y, 0);
    return camera;
  }
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const extent = Math.max(0.12, Math.max(size.x, size.y) * 0.5 * BODY_MARGIN_SCALE);
  const camera = new OrthographicCamera(-extent, extent, extent, -extent, 0.1, 20);
  camera.position.set(center.x + 0.26, center.y + 0.065, 3);
  camera.lookAt(center.x, center.y, 0);
  return camera;
}

/**
 * 配饰取景：把当前可见的眼镜/发型/胡子/帽子一起算进包围盒。
 * 只挑配饰时切到这个相机，画面不会因为换了配饰而跳动。
 */
function accessoryFrameCamera(character) {
  const bounds = bodyBounds(character);
  for (const accessory of character.look.accessories.values()) {
    if (accessory.visible) bounds.union(new Box3().setFromObject(accessory, true));
  }
  if (bounds.isEmpty()) return fallbackFrameCamera(character);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const extent = Math.max(0.27, size.x * 0.59, size.y * 0.59);
  const camera = new OrthographicCamera(-extent, extent, extent, -extent, 0.1, 20);
  camera.position.set(center.x + 0.26, center.y + 0.065, 3);
  camera.lookAt(center.x, center.y, 0);
  return camera;
}

function LiveLookPreview({ value, face = false }) {
  const containerRef = React.useRef(null);
  const valueRef = React.useRef(value);
  // 由 effect 装填的重绘函数：值/取景变化时从外部触发一次重绘
  const redrawRef = React.useRef(() => {});
  const [statusText, setStatusText] = React.useState("正在加载形象…");
  const [attempt, setAttempt] = React.useState(0);

  valueRef.current = value;
  const faceRef = React.useRef(face);
  faceRef.current = face;

  React.useEffect(() => {
    const container = containerRef.current;
    let disposed = false;
    let retryTimer;

    const fail = (error) => {
      if (disposed) return;
      console.warn("Character preview failed", error);
      if (attempt < 2) {
        setStatusText("正在重新加载…");
        retryTimer = setTimeout(() => setAttempt((count) => count + 1), 500 * (attempt + 1));
      } else {
        setStatusText("形象预览暂时打不开");
      }
    };

    let character;
    let renderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      fail(error);
      return () => {
        disposed = true;
        clearTimeout(retryTimer);
      };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const disposeHandle = createRendererHandle(renderer, scene);

    // 身体取景：容器宽高比变了就跟着改左右边界
    const bodyCamera = new OrthographicCamera(-0.85, 0.85, 1.06, -1.06, 0.1, 20);
    bodyCamera.position.set(0, 0.86, 3);
    bodyCamera.lookAt(0, 0.86, 0);

    const redraw = () => {
      if (disposed || !character) return;
      applyLookToCharacter(character, valueRef.current);
      renderer.setSize(container.clientWidth, container.clientHeight, false);

      bodyCamera.left = (-1.06 * container.clientWidth) / Math.max(1, container.clientHeight);
      bodyCamera.right = -bodyCamera.left;
      bodyCamera.updateProjectionMatrix();

      const camera = faceRef.current ? accessoryFrameCamera(character) : bodyCamera;
      if (faceRef.current) {
        camera.left = (-camera.top * container.clientWidth) / Math.max(1, container.clientHeight);
        camera.right = -camera.left;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
      // 把当前形象的指纹写到外层，CSS 可以用它做按形象变化的样式
      container.parentElement.dataset.look = lookSignature(valueRef.current);
    };
    redrawRef.current = redraw;

    const observer = new ResizeObserver(redraw);
    observer.observe(container);

    setStatusText("正在加载形象…");
    loadCharacter(valueRef.current)
      .then((loaded) => {
        if (disposed) {
          releaseCharacter(loaded);
          return;
        }
        character = loaded;
        loaded.idle.play();
        loaded.mixer.update(0.1);
        scene.add(loaded.model);
        redraw();
        setStatusText("");
      })
      .catch(fail);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      redrawRef.current = () => {};
      observer.disconnect();
      if (character) releaseCharacter(character);
      disposeHandle();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [attempt]);

  React.useEffect(() => redrawRef.current(), [value, face]);

  return jsx.jsxs("div", {
    className: "live-look",
    role: "img",
    "aria-label": "形象 3D 预览",
    children: [
      jsx.jsx("div", { className: "live-look-canvas", ref: containerRef }),
      statusText &&
        jsx.jsxs("div", {
          className: "look-loading",
          role: "status",
          children: [
            statusText,
            statusText.includes("打不开") &&
              jsx.jsx("button", { onClick: () => setAttempt(0), children: "重试" }),
          ],
        }),
    ],
  });
}

export { LiveLookPreview as L };
