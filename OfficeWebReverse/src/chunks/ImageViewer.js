// 全屏图片查看器（动态 chunk）。
//
// 生产包里这个文件被压成了 `K / G / $ / A` 这类名字，这里按职责还原成可读源码。
// 两个对外符号保持与生产完全一致的导出名：`ImageViewer`（React 组件）、
// `openImageViewer`（命令式打开，负责挂载/卸载与 object URL 生命周期）。
//
// 依赖来自共享 vendor chunk（dockGreeting.js）：React、jsx-runtime、react-dom/client。
import '../styles/ImageViewer.css';
import {
  r as React,
  j as jsxRuntime,
  f as createRoot
} from './dockGreeting.js';
import './chatLocal.js';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 64;
const FIT_PADDING = 48;
const ZOOM_STEP = 1.25;
const WHEEL_SENSITIVITY = 0.002;
const WHEEL_DELTA_LIMIT = 200;

/**
 * 计算「适应窗口」的缩放比：图片在视口内留出 FIT_PADDING 边距后能完整显示。
 * 边长未知（0）时按 1 处理。
 */
function fitScale(imageWidth, imageHeight, viewportWidth, viewportHeight) {
  if (!(imageWidth > 0) || !(imageHeight > 0)) return 1;
  return Math.min(
    1,
    Math.max(1, viewportWidth - FIT_PADDING) / imageWidth,
    Math.max(1, viewportHeight - FIT_PADDING) / imageHeight
  );
}

/**
 * 以 (centerX, centerY) 为锚点把缩放改成 zoom，并让该点在视图里保持不动。
 * 入参是旧的 zoom/x/y，返回新的三者。
 */
function zoomAround(view, zoom, centerX = 0, centerY = 0) {
  const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const ratio = nextZoom / view.zoom;
  return {
    zoom: nextZoom,
    x: centerX - (centerX - view.x) * ratio,
    y: centerY - (centerY - view.y) * ratio
  };
}

// 同一时刻只允许存在一个查看器实例
let openedViewer;

/**
 * 命令式打开：把 blob 变成一个 object URL，挂到一个临时 div 上渲染，
 * 关闭时（组件调用 onClose）卸载、移除节点并回收 URL。
 */
function openImageViewer(blob, name) {
  if (openedViewer) {
    openedViewer.root.unmount();
    openedViewer.node.remove();
    URL.revokeObjectURL(openedViewer.url);
  }

  const node = document.createElement('div');
  document.body.append(node);

  const root = createRoot(node);
  const url = URL.createObjectURL(blob);
  const session = { root, node, url };
  openedViewer = session;

  const close = () => {
    if (openedViewer !== session) return;
    openedViewer = undefined;
    root.unmount();
    node.remove();
    URL.revokeObjectURL(url);
  };

  root.render(jsxRuntime.jsx(ImageViewer, { url, name, onClose: close }));
}

function ImageViewer({ url, name, onClose }) {
  // 对话框根节点 / 画布节点
  const dialogRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // 原图尺寸、画布尺寸、缩放平移状态
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = React.useState({ width: 1, height: 1 });
  const [view, setView] = React.useState({ zoom: 1, x: 0, y: 0 });

  // 加载错误文案、全屏降级提示、拖拽中标记
  const [loadError, setLoadError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [dragging, setDragging] = React.useState(false);

  const dragOrigin = React.useRef();

  const scale = fitScale(imageSize.width, imageSize.height, viewportSize.width, viewportSize.height);
  const imageReady = imageSize.width > 0 && !loadError;

  const resetView = () => setView({ zoom: 1, x: 0, y: 0 });
  const zoomBy = (factor) => setView((current) => zoomAround(current, current.zoom * factor));

  // 跟随画布尺寸变化，滚轮按光标位置缩放
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(() => {
      setViewportSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    });
    observer.observe(canvas);

    const onWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const lineHeight = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
      const delta = event.deltaY * lineHeight;
      const clamped = Math.max(-WHEEL_DELTA_LIMIT, Math.min(WHEEL_DELTA_LIMIT, delta));
      setView((current) =>
        zoomAround(
          current,
          current.zoom * Math.exp(-clamped * WHEEL_SENSITIVITY),
          event.clientX - rect.left - rect.width / 2,
          event.clientY - rect.top - rect.height / 2
        )
      );
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 全屏接管、焦点管理、Esc 关闭、Tab 焦点陷阱
  React.useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const desktop = window.officeDesktop;
    const alreadyFullscreen = document.documentElement.classList.contains('officeworld-fullscreen');
    let unmounted = false;
    let enteredFullscreen = false;

    if (desktop?.setFullscreen) {
      desktop.focusWindow?.();
      if (!alreadyFullscreen) {
        desktop
          .setFullscreen(true)
          .then((entered) => {
            enteredFullscreen = entered;
            if (unmounted && entered) desktop.setFullscreen?.(false);
            else if (!entered) setNotice('未能进入系统全屏，仍可在当前窗口查看');
          })
          .catch(() => {
            if (!unmounted) setNotice('全屏暂不可用，仍可缩放查看');
          });
      }
    } else {
      dialogRef.current?.requestFullscreen?.().catch(() => {
        setNotice('已放大到窗口，浏览器未允许系统全屏');
      });
    }

    const unsubscribeFullscreen = desktop?.onFullscreenChange?.((isFullscreen) => {
      if (!isFullscreen && enteredFullscreen && !unmounted) onClose();
    });

    let sawNativeFullscreen = false;
    const onNativeFullscreenChange = () => {
      if (document.fullscreenElement === dialogRef.current) sawNativeFullscreen = true;
      else if (sawNativeFullscreen) onClose();
    };
    document.addEventListener('fullscreenchange', onNativeFullscreenChange);

    const onKeyDown = (event) => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href]')];
      const first = focusables[0];
      const last = focusables.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      unmounted = true;
      unsubscribeFullscreen?.();
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('fullscreenchange', onNativeFullscreenChange);
      if (!alreadyFullscreen && enteredFullscreen) desktop?.setFullscreen?.(false);
      if (document.fullscreenElement === dialogRef.current) document.exitFullscreen().catch(() => {});
      previousFocus?.focus();
    };
  }, [onClose]);

  return jsxRuntime.jsxs('section', {
    className: 'image-viewer',
    ref: dialogRef,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': '全屏图片查看器',
    tabIndex: -1,
    children: [
      jsxRuntime.jsxs('header', {
        children: [
          jsxRuntime.jsx('strong', { children: '图片预览' }),
          jsxRuntime.jsx('span', { className: 'image-viewer-hint', children: '滚轮缩放 · 拖动查看 · Esc 关闭' }),
          jsxRuntime.jsx('a', { href: url, download: name, children: '下载原图' }),
          jsxRuntime.jsx('button', {
            type: 'button',
            'aria-label': '关闭全屏观看',
            onClick: onClose,
            children: '关闭 ×'
          })
        ]
      }),
      jsxRuntime.jsxs('div', {
        className: 'image-viewer-canvas' + (dragging ? ' is-dragging' : ''),
        ref: canvasRef,
        onDoubleClick: () =>
          view.zoom === 1
            ? setView({ zoom: Math.min(MAX_ZOOM, 1 / scale), x: 0, y: 0 })
            : resetView(),
        onPointerDown: (event) => {
          if (event.button !== 0 || !imageReady) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragOrigin.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          setDragging(true);
        },
        onPointerMove: (event) => {
          const origin = dragOrigin.current;
          if (!origin || origin.id !== event.pointerId) return;
          const dx = event.clientX - origin.x;
          const dy = event.clientY - origin.y;
          origin.x = event.clientX;
          origin.y = event.clientY;
          setView((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
        },
        onPointerUp: (event) => {
          dragOrigin.current = undefined;
          setDragging(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        },
        onPointerCancel: () => {
          dragOrigin.current = undefined;
          setDragging(false);
        },
        onLostPointerCapture: () => {
          dragOrigin.current = undefined;
          setDragging(false);
        },
        children: [
          !imageReady &&
            jsxRuntime.jsx('p', { role: 'status', children: loadError || '正在加载原图…' }),
          jsxRuntime.jsx('img', {
            src: url,
            alt: '图片预览',
            draggable: false,
            onLoad: (event) => {
              setLoadError('');
              setImageSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight
              });
            },
            onError: () => setLoadError('图片无法显示，可以下载原图查看'),
            style: {
              visibility: imageReady ? 'visible' : 'hidden',
              width: imageSize.width * scale,
              height: imageSize.height * scale,
              transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.zoom})`
            }
          })
        ]
      }),
      notice && jsxRuntime.jsx('div', { className: 'image-viewer-notice', role: 'status', children: notice }),
      jsxRuntime.jsxs('footer', {
        children: [
          jsxRuntime.jsx('button', {
            type: 'button',
            disabled: !imageReady || view.zoom <= MIN_ZOOM,
            'aria-label': '缩小图片',
            onClick: () => zoomBy(1 / ZOOM_STEP),
            children: '−'
          }),
          jsxRuntime.jsx('output', {
            'aria-label': '缩放比例',
            children: imageReady ? `${Math.round(scale * view.zoom * 100)}%` : '—'
          }),
          jsxRuntime.jsx('button', {
            type: 'button',
            disabled: !imageReady || view.zoom >= MAX_ZOOM,
            'aria-label': '放大图片',
            onClick: () => zoomBy(ZOOM_STEP),
            children: '＋'
          }),
          jsxRuntime.jsx('button', {
            type: 'button',
            disabled: !imageReady,
            onClick: resetView,
            children: '适应窗口'
          }),
          jsxRuntime.jsx('button', {
            type: 'button',
            disabled: !imageReady,
            onClick: () => setView({ zoom: Math.min(MAX_ZOOM, 1 / scale), x: 0, y: 0 }),
            children: '原始大小'
          })
        ]
      })
    ]
  });
}

export { ImageViewer, openImageViewer };
