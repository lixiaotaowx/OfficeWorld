const test = require('node:test');
const assert = require('node:assert/strict');
const { foregroundFullscreen, coversMonitor } = require('../dock-desktop-state.cjs');

function fixture() {
  const monitor = { left: -2560, top: -120, right: 0, bottom: 1320 };
  return { foreground: () => 30, visible: () => true, minimized: () => false,
    cloaked: () => false, className: () => 'Chrome_WidgetWin_1', find: () => 20,
    monitorRect: () => monitor, frame: () => ({ ...monitor }) };
}

test('physical monitor bounds detect browser/video fullscreen with negative origin and scaling', () => {
  const native = fixture();
  assert.equal(foregroundFullscreen(native, 10), true);
  native.frame = () => ({ left: -2560, top: -120, right: 0, bottom: 1260 });
  assert.equal(foregroundFullscreen(native, 10), false, 'maximized work area leaves taskbar visible');
  native.frame = () => ({ left: 0, top: 0, right: 1920, bottom: 1080 });
  assert.equal(foregroundFullscreen(native, 10), false, 'fullscreen on other screen');
});

test('ignore desktop, taskbar, dock, minimized and cloaked windows', () => {
  for (const overrides of [{ foreground: () => 0 }, { foreground: () => 10 },
    { visible: () => false }, { minimized: () => true }, { cloaked: () => true },
    ...['Progman', 'WorkerW', 'Shell_TrayWnd', 'Shell_SecondaryTrayWnd'].map(name => ({ className: () => name }))]) {
    assert.equal(foregroundFullscreen({ ...fixture(), ...overrides }, 10), false);
  }
  assert.equal(coversMonitor(null, fixture().monitorRect()), false);
  assert.equal(coversMonitor(fixture().frame(), { left: 0, right: NaN, top: 0, bottom: 1 }), false);
});
