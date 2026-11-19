import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { enlargedScreenSize } = await import(await loadTs('dockLayout.ts'));

test('enlarged screen: half the available width, clamped to sane bounds', () => {
  const size = enlargedScreenSize(1366, 768);
  assert.equal(size.width, 683, '半宽');
  assert.equal(size.height, 640, '高度 688 被 640 封顶');
  assert.equal(size.pictureHeight, 476, '画面区 = 高 − 164 控件条');
});

test('enlarged screen: clamps tiny and huge displays', () => {
  const tiny = enlargedScreenSize(400, 300);
  assert.equal(tiny.width, 280, '最小 280');
  assert.equal(tiny.height, 220, '高度 220 高于下限，保留');
  const huge = enlargedScreenSize(8000, 2000);
  assert.equal(huge.width, 4000, '半宽 4000，未到 4080 上限');
  assert.equal(huge.height, 640, '最大 640');
});

test('enlarged screen: defaults when the sizes are unavailable', () => {
  const size = enlargedScreenSize(0, 0);
  assert.equal(size.width, 683, '默认按 1366 算半宽');
  assert.equal(size.height, 640, '默认高 688 被 640 封顶');
});
