// 「有人来看我了」的绿光层。
//
// 用户 2026-09-18：「当有人鼠标悬浮在自己头像上时，自己的所有屏幕的边缘都发绿光，面积很大，
// 就是简单叠一个覆盖层的显示即可……相当于说有人来看我了，提示我一下」。
//
// 每块屏幕一个透明、点不动、永远置顶的窗口，铺满整块屏幕，页面在四周画一大圈绿光；
// 有人看的时候亮起来（`flash()`，可以指定"用多久慢慢亮"），最后一次信号之后 `GLOW_MS`
// 毫秒自动收掉。同一时间好几个人在看也只是一直亮着，不会叠出好几个窗口。
//
// 几个必须守住的点：
//   * 屏幕可能不止一块 → 每块都要有（用户明确说"所有屏幕"）；
//   * 点不动（`setIgnoreMouseEvents(true)`，整窗穿透；这里不需要 forward：页面不接鼠标事件）；
//   * 永远置顶且能盖住独占全屏的应用（`screen-saver` 档）；
//   * **绝不能挡住正在共享的屏幕**（共享时上层不闪，见 desktop-bridge 的判断）；
//   * 分辨率/缩放/插拔屏幕之后要重新贴合。
const electron = require('electron');
const path = require('node:path');

/** 最后一次信号之后还亮多久。要长于页面里的 HOLD_MS + 淡出时间（3.6s + 0.5s）。 */
const GLOW_MS = 4300;
/** 一次都不给 `fade` 时就是立刻亮（托盘里的测试菜单走这条）。 */
const DEFAULT_FADE_MS = 0;
/** 亮起来最多给多久：页面那边的 CSS 过渡时长，别让调用方传出一个荒唐的数。 */
const MAX_FADE_MS = 10000;
const CHANNEL = 'office:preview-glow';

function createPreviewGlow(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || electron.BrowserWindow;
  const screenApi = overrides.screen || electron.screen;
  const preload = overrides.preload || path.join(__dirname, 'preview-glow-preload.cjs');
  const glowMs = overrides.glowMs ?? GLOW_MS;
  const setTimeoutFn = overrides.setTimeout || setTimeout;
  const clearTimeoutFn = overrides.clearTimeout || clearTimeout;
  /** displayId -> BrowserWindow */
  const layers = new Map();
  let timer;
  /** 上一次用的淡入时长：页面加载完补发那一次要用同一个（不然会突然闪一下）。 */
  let lastFade = DEFAULT_FADE_MS;

  /**
   * 通知一层的页面"亮起来"。
   *
   * 窗口是第一次亮的时候才建的，页面还在加载（`isLoading()`）时直接 send 会**丢掉**——
   * 监听还没挂上，用户看到的是一块什么都没有的透明窗口（2026-09-18 实测踩过）。
   *
   * `restart` 是"这次要从全透明重新亮起"。**必须由主进程判断**（这一层刚才是不是可见）：
   * 窗口一藏起来页面里的计时器就被节流甚至冻住，淡出那一步可能根本没跑，页面自己记的
   * "我还亮着"是错的——于是第二次悬停时它以为已经亮着，就不再淡入，用户看到的还是"啪一下
   * 就亮"（2026-09-20 实测量的就是这个）。
   */
  function notify(layer, fade, restart) {
    const contents = layer.webContents;
    const payload = { at: Date.now(), fade, restart: restart === true };
    const send = () => { try { contents.send(CHANNEL, payload); } catch { /* 窗口刚被销毁 */ } };
    if (typeof contents.isLoading === 'function' && contents.isLoading()) contents.once('did-finish-load', send);
    else send();
  }

  const displays = () => {
    try {
      const all = screenApi.getAllDisplays();
      return all.length ? all : [screenApi.getPrimaryDisplay()];
    } catch {
      return [];
    }
  };

  function create(display) {
    const layer = new BrowserWindow({
      ...display.bounds,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      // 纯粹是个光晕：不抢焦点、不进任务栏、不能拖动也不能调大小。
      focusable: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      enableLargerThanScreen: true,
      webPreferences: { preload, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    layer.setAlwaysOnTop(true, 'screen-saver');
    // 整窗穿透：鼠标、点击都从光晕下面穿过去，别挡着人家干活。
    layer.setIgnoreMouseEvents(true);
    layer.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    layer.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    layer.webContents.on('will-navigate', event => event.preventDefault());
    // 页面刚加载完时如果还亮着，补一次——第一次亮就是在建窗口，页面还没准备好。
    // 这一层刚加载，肯定是"从全透明开始"，所以 restart 为真。
    layer.webContents.on('did-finish-load', () => { if (timer) notify(layer, lastFade, true); });
    layer.on('closed', () => layers.delete(String(display.id)));
    void layer.loadFile(path.join(__dirname, 'preview-glow.html')).catch(() => {});
    layers.set(String(display.id), layer);
    return layer;
  }

  /** 按当前的屏幕重新摆一遍：新屏幕补一个窗口，拔掉的收掉，尺寸变的贴回去。 */
  function sync() {
    const current = displays();
    const wanted = new Set(current.map(display => String(display.id)));
    for (const [id, layer] of [...layers]) {
      if (wanted.has(id) || layer.isDestroyed()) continue;
      layer.destroy();
      layers.delete(id);
    }
    for (const display of current) {
      const id = String(display.id);
      let layer = layers.get(id);
      if (!layer || layer.isDestroyed()) layer = create(display);
      const bounds = layer.getBounds();
      const box = display.bounds;
      if (bounds.x !== box.x || bounds.y !== box.y || bounds.width !== box.width || bounds.height !== box.height) {
        layer.setBounds(box);
      }
    }
    return layers.size;
  }

  function hide() {
    timer = undefined;
    for (const layer of layers.values()) {
      if (!layer.isDestroyed() && layer.isVisible()) layer.hide();
    }
  }

  return {
    /**
     * 有人来看我了：所有屏幕亮起来；一直有人看就一直亮着。
     *
     * `fade` 是"亮起来用多久"（毫秒）：鼠标停一下那一路是慢慢亮（页面传 2000），
     * 有人打电话过来是立刻亮（页面传 150）；不给就立刻亮（用户 2026-09-20）。
     */
    flash(options = {}) {
      const fade = Math.max(0, Math.min(MAX_FADE_MS, Number(options?.fade) || DEFAULT_FADE_MS));
      lastFade = fade;
      sync();
      if (timer) clearTimeoutFn(timer);
      timer = setTimeoutFn(hide, glowMs);
      timer?.unref?.();
      for (const layer of layers.values()) {
        if (layer.isDestroyed()) continue;
        // 刚才不可见（第一次亮、或者上一次已经收掉了）：这一次要从全透明重新亮起。
        const restart = !layer.isVisible();
        if (restart) layer.showInactive();
        notify(layer, fade, restart);
      }
      return layers.size;
    },
    /** 立刻收掉（自己在共享屏幕、要退出时用）。 */
    hide() {
      if (timer) clearTimeoutFn(timer);
      timer = undefined;
      hide();
      return true;
    },
    /** 屏幕变了（插拔/改分辨率）：亮着的话顺手重贴一遍。 */
    sync,
    glowMs: () => glowMs,
    isVisible: () => [...layers.values()].some(layer => !layer.isDestroyed() && layer.isVisible()),
    /** 测试用：现在有几块屏幕的光晕。 */
    count: () => layers.size,
    layerFor: displayId => layers.get(String(displayId)),
    destroy() {
      if (timer) clearTimeoutFn(timer);
      timer = undefined;
      for (const layer of layers.values()) if (!layer.isDestroyed()) layer.destroy();
      layers.clear();
    },
  };
}

module.exports = { createPreviewGlow, GLOW_MS, CHANNEL };
