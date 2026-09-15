// Does the tray icon really get drawn?
//
// The shipped .ico carried one 256x256 entry, and the notification area needs a native
// small size, so the slot came out blank. No unit test can see that, so this runs real
// Electron, adds the tray to the real notification area, and records where Windows put
// it — comparing the old single-entry icon against the multi-size one plus a 16px tray
// image, which is the pair that was actually broken.
const { app, Tray, nativeImage } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const appRoot = process.env.OFFICE_DESKTOP_TEST_APP || path.resolve(__dirname, '..');
const { TRAY_ICON_PX } = require(path.join(appRoot, 'tray.cjs'));
const iconPath = path.join(appRoot, 'assets', 'icon.ico');
const masterPng = path.join(appRoot, 'assets', 'icon-256.png');
const output = path.resolve(__dirname, '../../Build/DesktopTrayIconQA');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));
app.setAppUserModelId('com.officeworld.desktop');

/** Rebuild the shape that shipped before: one 256px PNG entry and nothing else. */
function legacyIconPath() {
  const png = fs.readFileSync(masterPng);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 0; entry[1] = 0;                       // 0 means 256 in an ICO directory
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
  const file = path.join(output, 'legacy-single-256.ico');
  fs.writeFileSync(file, Buffer.concat([header, entry, png]));
  return file;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const evidence = { checks: [] };

async function boundsOf(image) {
  const tray = new Tray(image);
  tray.setToolTip('iruler dream · tray icon check');
  await wait(1200);
  const bounds = tray.getBounds();
  tray.destroy();
  await wait(300);
  return bounds;
}

app.whenReady().then(async () => {
  const source = nativeImage.createFromPath(iconPath);
  const trayImage = source.resize({ width: TRAY_ICON_PX, height: TRAY_ICON_PX, quality: 'best' });
  evidence.checks.push({ decoded: !source.isEmpty(), sourceSize: source.getSize(), traySize: trayImage.getSize() });
  assert.equal(source.isEmpty(), false, 'assets/icon.ico 必须能解码');
  assert.deepEqual(trayImage.getSize(), { width: TRAY_ICON_PX, height: TRAY_ICON_PX });

  const legacy = nativeImage.createFromPath(legacyIconPath());
  evidence.checks.push({ legacySize: legacy.isEmpty() ? null : legacy.getSize() });

  // Both are asked for a slot; the sizes Windows hands back are the evidence.
  evidence.checks.push({ legacyBounds: await boundsOf(legacy) });
  evidence.checks.push({ fixedBounds: await boundsOf(trayImage) });

  fs.writeFileSync(path.join(output, 'tray-icon.json'), JSON.stringify(evidence, null, 2));
  const fixed = evidence.checks.find(check => check.fixedBounds).fixedBounds;
  assert.ok(fixed.width > 0 && fixed.height > 0,
    `修好后的托盘图标仍没拿到位置：${JSON.stringify(fixed)}`);
  app.exit(0);
}).catch(error => {
  evidence.error = error.stack;
  fs.writeFileSync(path.join(output, 'tray-icon.json'), JSON.stringify(evidence, null, 2));
  app.exit(1);
});
setTimeout(() => app.exit(2), 40000).unref();
