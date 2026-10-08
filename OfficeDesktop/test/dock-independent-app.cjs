// Real dock-window + preload + IPC + built avatar page, isolated from user accounts.
const { app, BrowserWindow, session, ipcMain, screen, desktopCapturer } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const packaged = path.join(root, 'Build/OfficeDesktopRelease035/win-unpacked/resources/app.asar');
const { createDockWindow } = require(path.join(packaged, 'dock-window.cjs'));
const { installDockBridge } = require(path.join(packaged, 'dock-bridge.cjs'));
const { windowHandle } = require(path.join(packaged, 'dock-z-order.cjs'));
const k = require('koffi'), u = k.load('user32.dll');
const owner = u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)');
const style = u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)');
const wait = ms => new Promise(r => setTimeout(r, ms));
app.setPath('userData', path.join(root, 'Build/dock-independent-app-profile'));
app.whenReady().then(async () => {
  let dock, main;
  try {
    const ses = session.fromPartition('independent-dock-app');
    const dist = path.join(root, 'Build/OfficeWeb');
    await ses.protocol.handle('https', request => {
      const pathname = new URL(request.url).pathname;
      if (pathname === '/') return new Response('<title>isolated main</title>');
      const file = path.resolve(dist, '.' + pathname);
      if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) return new Response('', { status: 404 });
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
      return new Response(fs.readFileSync(file), { headers: { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' } });
    });
    ipcMain.handle('dream:resources', () => ({}));
    main = new BrowserWindow({ show: false, webPreferences: { session: ses,
      preload: path.join(packaged, 'desktop-preload.cjs'), sandbox: true, contextIsolation: true } });
    let systemHidden = false;
    dock = createDockWindow({ url: 'https://115.159.43.237/dock.html',
      session: { fromPartition: () => ses }, anchor: 'left',
      systemHidden: () => systemHidden });
    installDockBridge({ dock, getWindow: () => main });
    const win = dock.ensure();
    const loaded = new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    await main.loadURL('https://115.159.43.237/'); await loaded;
    await main.webContents.executeJavaScript(`window.officeDesktop.dockState({ people: [
      { id: 'qa', name: '验证头像', character: 'look:' + JSON.stringify({ color: 'kraft',
        accessories: {}, autoExpression: 'happy' }), atDesk: true, unread: 0, missed: false }
    ], sharing: false, missed: 0, hidden: false })`);
    for (let i = 0; i < 80; i++) {
      if (await win.webContents.executeJavaScript(`!!document.querySelector('.dock-avatar')?.style.backgroundImage.includes('data:image')`)) break;
      await wait(100);
    }
    assert.equal(await win.webContents.executeJavaScript(`document.querySelectorAll('.dock-avatar').length`), 1);
    for (let i = 0; i < 8; i++) {
      win.setAlwaysOnTop(false);
      await wait(350);
      assert.ok(Number(style(windowHandle(win), -20)) & 8);
      assert.equal(win.isVisible(), true);
      assert.equal(BigInt(owner(windowHandle(win), 4)), 0n);
    }
    systemHidden = true; dock.place(); await wait(400);
    assert.equal(win.isVisible(), false);
    systemHidden = false; dock.place(); await wait(400);
    assert.equal(win.isVisible(), true);
    const display = screen.getPrimaryDisplay(), bounds = win.getBounds();
    const sources = await desktopCapturer.getSources({ types: ['screen'],
      thumbnailSize: { width: display.size.width, height: display.size.height } });
    const source = sources.find(s => s.display_id === String(display.id));
    const crop = source.thumbnail.crop({ x: bounds.x - display.bounds.x, y: bounds.y - display.bounds.y,
      width: bounds.width, height: bounds.height });
    fs.writeFileSync(path.join(root, 'Build/dock-independent-avatar-screen.png'), crop.toPNG());
    const bitmap = crop.toBitmap(); let yellow = 0;
    for (let i = 0; i < bitmap.length; i += 4)
      if (bitmap[i + 2] > 170 && bitmap[i + 1] > 110 && bitmap[i] < 120) yellow++;
    assert.ok(yellow > 100, `real avatar is present on desktop: ${yellow}`);
    console.log('PASS real packaged dock/preload/IPC/avatar; 8 no-click recoveries; hide/restore; yellow pixels', yellow);
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { dock?.destroy(); main?.destroy(); app.exit(process.exitCode || 0); }
});
