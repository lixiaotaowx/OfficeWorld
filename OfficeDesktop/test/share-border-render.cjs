// electron test/share-border-render.cjs：直接加载本地源码，窗口全程隐藏，不触碰正在运行的客户端。
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createShareBorder } = require('../share-border.cjs');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'share-border-render-'));
app.setPath('userData', profile);
app.disableHardwareAcceleration();
const output = path.resolve(__dirname, '../../Build/share-border-render.png');
const report = path.resolve(__dirname, '../../Build/share-border-render.json');
let border;
const timeout = setTimeout(() => {
  fs.writeFileSync(report, JSON.stringify({ ok: false, error: 'Render timeout' }));
  app.exit(1);
}, 20000);

app.whenReady().then(async () => {
  const windows = [], loaded = [];
  class HiddenWindow extends BrowserWindow {
    constructor(options) {
      super({ ...options, webPreferences: { ...options.webPreferences, offscreen: true } });
      windows.push(this);
      loaded.push(new Promise((resolve, reject) => {
        this.webContents.once('did-finish-load', resolve);
        this.webContents.once('did-fail-load', (_event, code, description) => reject(Error(`${code}: ${description}`)));
      }));
    }
    showInactive() {} // 自检只读渲染缓冲，不把测试边框真的放到用户桌面上。
  }
  try {
    border = createShareBorder({ BrowserWindow: HiddenWindow, screen: {
      getAllDisplays: () => [{ id: 7, bounds: { x: 0, y: 0, width: 1280, height: 720 } }],
    } });
    border.captured('7'); border.show(['7']);
    await Promise.all(loaded);
    const win = windows[0];
    const style = await win.webContents.executeJavaScript(`(() => {
      const element = document.querySelector('.share-border');
      const s = getComputedStyle(element), r = element.getBoundingClientRect();
      return { width:r.width, height:r.height, border:s.borderTopWidth,
        color:s.borderTopColor, pointer:s.pointerEvents, background:getComputedStyle(document.body).backgroundColor };
    })()`);
    assert.equal(style.width, 1280); assert.equal(style.height, 720);
    assert.equal(style.border, '3px'); assert.equal(style.color, 'rgb(39, 196, 106)');
    assert.equal(style.pointer, 'none'); assert.equal(style.background, 'rgba(0, 0, 0, 0)');
    const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1280, height: 720 });
    assert.equal(image.isEmpty(), false);
    const size = image.getSize(), bitmap = image.toBitmap();
    const alpha = (x, y) => bitmap[(y * size.width + x) * 4 + 3];
    assert.equal(alpha(Math.floor(size.width / 2), Math.floor(size.height / 2)), 0,
      '中央必须真正透明，不能用黑色大窗口遮住桌面');
    assert.equal(alpha(1, 1), 255, '四周细框实绘');
    fs.writeFileSync(output, image.toPNG());
    assert.equal(win.isVisible(), false, '自检不允许把窗口显示到真实桌面');
    border.show([]);
    assert.equal(win.isDestroyed(), true);
    fs.writeFileSync(report, JSON.stringify({ ok: true, style, screenshot: output }, null, 2));
  } catch (error) {
    fs.writeFileSync(report, JSON.stringify({ ok: false, error: String(error), stack: error.stack }, null, 2));
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout); border?.destroy(); app.exit(process.exitCode || 0);
  }
});
