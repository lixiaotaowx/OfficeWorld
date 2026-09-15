// Diagnostic: put a tray icon up and screenshot the notification area, so "the icon is
// blank" can be seen instead of inferred. Compares the legacy single-256 .ico against
// the multi-size one and against the 16px image the app now hands to Tray.
//
// Run: node_modules\electron\dist\electron.exe test\tray-icon-capture.cjs
const { app, Tray, nativeImage, desktopCapturer, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const appRoot = process.env.OFFICE_DESKTOP_TEST_APP || path.resolve(__dirname, '..');
const iconPath = path.join(appRoot, 'assets', 'icon.ico');
const masterPng = path.join(appRoot, 'assets', 'icon-256.png');
const output = path.resolve(__dirname, '../../Build/TrayIconCapture');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));
app.setAppUserModelId('com.officeworld.desktop');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function legacyIconPath() {
  const png = fs.readFileSync(masterPng);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 0; entry[1] = 0;
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
  const file = path.join(output, 'legacy.ico');
  fs.writeFileSync(file, Buffer.concat([header, entry, png]));
  return file;
}

/** Screenshot exactly the region Windows gave the tray icon, magnified 8x. */
async function shoot(label, rect) {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.size;
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } });
  const full = sources[0].thumbnail;
  const size = full.getSize();
  const sx = size.width / width, sy = size.height / height;
  const pad = 6;
  const crop = {
    x: Math.max(0, Math.round((rect.x - pad) * sx)),
    y: Math.max(0, Math.round((rect.y - pad) * sy)),
    width: Math.round((rect.width + pad * 2) * sx),
    height: Math.round((rect.height + pad * 2) * sy),
  };
  const shot = full.crop(crop);
  const big = shot.resize({ width: crop.width * 8, height: crop.height * 8, quality: 'nearest' });
  fs.writeFileSync(path.join(output, `${label}.png`), big.toPNG());
  return { crop, shotSize: shot.getSize() };
}

async function probe(label, image) {
  const source = nativeImage.createFromPath(image === 'legacy' ? legacyIconPath() : iconPath);
  const trayImage = image === 'legacy' ? nativeImage.createFromPath(legacyIconPath())
    : source.resize({ width: 16, height: 16, quality: 'best' });
  const tray = new Tray(trayImage);
  tray.setToolTip(`iruler dream · ${label}`);
  await wait(2500);
  const rect = tray.getBounds();
  const evidence = { label, decodedSize: source.getSize(), trayImageSize: trayImage.getSize(), trayBounds: rect };
  if (rect.width > 0) evidence.shot = await shoot(label, rect);
  // Wide strip: the whole right end of the taskbar, so "is it in the visible area or
  // hidden behind the chevron" is answerable by looking (Windows 10 hides new icons).
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.size;
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } });
  const full = sources[0].thumbnail;
  const size = full.getSize();
  const sx = size.width / width, sy = size.height / height;
  const strip = { x: Math.round(1200 * sx), y: Math.round((height - 60) * sy),
    width: Math.round(720 * sx), height: Math.round(60 * sy) };
  const cropped = full.crop(strip);
  fs.writeFileSync(path.join(output, `taskbar-${label}.png`),
    cropped.resize({ width: strip.width * 2, height: strip.height * 2, quality: 'best' }).toPNG());
  evidence.strip = strip;
  tray.destroy();
  await wait(800);
  return evidence;
}

app.whenReady().then(async () => {
  const results = [];
  results.push(await probe('legacy-256only', 'legacy'));
  results.push(await probe('fixed-multisize-16px', 'fixed'));
  fs.writeFileSync(path.join(output, 'tray-capture.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  app.exit(0);
}).catch(error => {
  fs.writeFileSync(path.join(output, 'failure.txt'), error.stack);
  app.exit(1);
});
setTimeout(() => app.exit(2), 60000).unref();
