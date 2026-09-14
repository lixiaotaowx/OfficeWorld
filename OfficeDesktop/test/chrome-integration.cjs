const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const appRoot = process.env.OFFICE_DESKTOP_TEST_APP || path.resolve(__dirname, '..');
const { installChrome } = require(path.join(appRoot, 'chrome.cjs'));
const output = path.resolve(__dirname, '../../Build/DesktopDesignQA');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));
const calls = [];
shell.openExternal = async uri => { calls.push(uri); };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 940, frame: false, show: false,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false,
      preload: path.join(appRoot, 'desktop-preload.cjs') } });
  installChrome(win);
  await win.loadURL('https://115.159.43.237/');
  for (let i = 0; i < 60; i++) {
    if (await win.webContents.executeJavaScript('!!document.querySelector("#iruler-desktop-chrome")')) break;
    await wait(200);
  }
  await wait(1500);
  const status = await win.webContents.executeJavaScript(`({
    chrome:!!document.querySelector('#iruler-desktop-chrome'),
    theme:document.documentElement.classList.contains('iruler-desktop'),
    accountBrand:document.querySelector('.account-brand')?.textContent,
    bounds:{width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth}
  })`);
  assert.equal(status.chrome, true); assert.equal(status.theme, true);
  assert.equal(win.getTitle(), 'iruler dream');
  assert.ok(status.accountBrand.includes('iruler dream'));
  fs.writeFileSync(path.join(output, 'login.png'), (await win.webContents.capturePage()).toPNG());
  await win.webContents.executeJavaScript(`document.querySelector('#iruler-desktop-chrome').shadowRoot.querySelectorAll('[aria-haspopup]')[2].click()`);
  await wait(200);
  fs.writeFileSync(path.join(output, 'sound-menu.png'), (await win.webContents.capturePage()).toPNG());
  await win.webContents.executeJavaScript(`document.querySelector('#iruler-desktop-chrome').shadowRoot.querySelector('[data-action=devices]').click()`);
  await wait(100);
  assert.deepEqual(calls, ['ms-settings:sound']);
  win.setSize(900, 700);
  await wait(250);
  fs.writeFileSync(path.join(output, 'compact.png'), (await win.webContents.capturePage()).toPNG());
  const compact = await win.webContents.executeJavaScript('({width:innerWidth,scroll:document.documentElement.scrollWidth})');
  assert.ok(compact.scroll <= compact.width);
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({status,calls,compact},null,2));
  app.exit(0);
}).catch(error => { fs.writeFileSync(path.join(output, 'failure.txt'), error.stack); app.exit(1); });
setTimeout(() => app.exit(2), 45000).unref();
