// One display selection drives both the low-resolution preview and HD sharing:
// pick it once and every later share uses it without asking again.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDisplayStore } = require('../display-store.cjs');

const SOURCES = ['1', '2'].map((id) => ({ id: 'screen:' + id, display_id: id, name: 'Screen ' + id }));
const capturer = { getSources: async () => SOURCES };
const screenApi = {
  getAllDisplays: () => SOURCES.map((source) => ({ id: source.display_id, size: { width: 1920, height: 1080 } })),
  getPrimaryDisplay: () => ({ id: '1' }),
};

function scratch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'office-display-'));
  return { file: path.join(dir, 'preview-display.json'), dir };
}

test('未选择时用主屏，选择后跟随选择并可跨实例恢复', async () => {
  const { file, dir } = scratch();
  try {
    const store = createDisplayStore(file);
    assert.equal(store.id(), '');
    assert.equal((await store.source(capturer, screenApi)).display_id, '1', '默认主屏');
    assert.equal(store.select('2'), '2');
    assert.equal((await store.source(capturer, screenApi)).display_id, '2', '共享必须用已选屏');
    // 新进程（重启 EXE）读回同一选择。
    assert.equal(createDisplayStore(file).id(), '2');
    const list = await createDisplayStore(file).list(capturer, screenApi);
    assert.deepEqual(list.map((row) => row.selected), [false, true]);
    assert.match(list[0].name, /主屏幕/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('选择的屏幕断开时回退主屏，没有屏幕时返回 undefined', async () => {
  const { file, dir } = scratch();
  try {
    const store = createDisplayStore(file);
    store.select('9');
    assert.equal((await store.source(capturer, screenApi)).display_id, '1', '断开的屏幕不能卡死共享');
    const empty = { getSources: async () => [] };
    assert.equal(await store.source(empty, screenApi), undefined);
    assert.deepEqual(await store.list(empty, screenApi), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
