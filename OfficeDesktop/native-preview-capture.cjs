function electronImage() {
  return require('electron').nativeImage;
}

const MAX_EDGE = 300;
const JPEG_QUALITY = 55;
const SRCCOPY = 0x00cc0020;
const CAPTUREBLT = 0x40000000;

function loadNative() {
  const k = require('koffi');
  const user = k.load('user32.dll');
  const gdi = k.load('gdi32.dll');
  return {
    getDC: user.func('uintptr_t __stdcall GetDC(uintptr_t)'),
    releaseDC: user.func('int __stdcall ReleaseDC(uintptr_t, uintptr_t)'),
    createDC: gdi.func('uintptr_t __stdcall CreateCompatibleDC(uintptr_t)'),
    deleteDC: gdi.func('int __stdcall DeleteDC(uintptr_t)'),
    createBitmap: gdi.func('uintptr_t __stdcall CreateCompatibleBitmap(uintptr_t, int, int)'),
    selectObject: gdi.func('uintptr_t __stdcall SelectObject(uintptr_t, uintptr_t)'),
    deleteObject: gdi.func('int __stdcall DeleteObject(uintptr_t)'),
    stretchMode: gdi.func('int __stdcall SetStretchBltMode(uintptr_t, int)'),
    stretch: gdi.func('int __stdcall StretchBlt(uintptr_t, int, int, int, int, uintptr_t, int, int, int, int, uint32_t)'),
    pixels: gdi.func('int __stdcall GetDIBits(uintptr_t, uintptr_t, uint32_t, uint32_t, void *, void *, uint32_t)'),
  };
}

function captureDisplay(display, api, imageApi = electronImage()) {
  const { bounds, scaleFactor = 1 } = display;
  const x = Math.round(display.nativeOrigin?.x ?? bounds.x * scaleFactor);
  const y = Math.round(display.nativeOrigin?.y ?? bounds.y * scaleFactor);
  const sourceWidth = Math.round(bounds.width * scaleFactor);
  const sourceHeight = Math.round(bounds.height * scaleFactor);
  if (sourceWidth < 1 || sourceHeight < 1) return null;
  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const dc = api.getDC(0);
  if (!dc) return null;
  let memoryDC = 0, bitmap = 0, previous = 0;
  try {
    memoryDC = api.createDC(dc);
    if (!memoryDC) return null;
    bitmap = api.createBitmap(dc, width, height);
    if (!bitmap) return null;
    previous = api.selectObject(memoryDC, bitmap);
    if (!previous) return null;
    api.stretchMode(memoryDC, 3);
    if (!api.stretch(memoryDC, 0, 0, width, height, dc, x, y,
      sourceWidth, sourceHeight, SRCCOPY | CAPTUREBLT)) return null;
    const header = Buffer.alloc(40);
    header.writeUInt32LE(40, 0);
    header.writeInt32LE(width, 4);
    header.writeInt32LE(-height, 8);
    header.writeUInt16LE(1, 12);
    header.writeUInt16LE(32, 14);
    const pixels = Buffer.alloc(width * height * 4);
    if (api.pixels(memoryDC, bitmap, 0, height, pixels, header, 0) !== height) return null;
    for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
    return `data:image/jpeg;base64,${imageApi.createFromBitmap(pixels, { width, height })
      .toJPEG(JPEG_QUALITY).toString('base64')}`;
  } finally {
    if (previous) api.selectObject(memoryDC, previous);
    if (bitmap) api.deleteObject(bitmap);
    if (memoryDC) api.deleteDC(memoryDC);
    api.releaseDC(0, dc);
  }
}

function createNativePreviewCapture({ platform = process.platform, load = loadNative, imageApi } = {}) {
  let active = null, api;
  return {
    async start(display) {
      if (platform !== 'win32' || !display?.bounds) throw Error('Native screen capture requires Windows display bounds');
      api ??= load();
      active = display;
      return true;
    },
    async frame() { return active ? captureDisplay(active, api, imageApi || electronImage()) : null; },
    async stop() { const wasActive = Boolean(active); active = null; return wasActive; },
    close() { active = null; },
    isSupported: () => platform === 'win32',
    attachedTo: () => active ? String(active.id) : '',
  };
}

module.exports = { createNativePreviewCapture, captureDisplay };
