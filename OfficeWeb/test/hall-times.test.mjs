import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { TIME_TABLE, DEFAULT_VIEW, autoTime, cycleTime, makeSkyTexture } =
  await import(await loadTs('hallTimes.ts'));

test('time table: three periods with the November values', () => {
  assert.deepEqual(Object.keys(TIME_TABLE).sort(), ['afternoon', 'morning', 'night']);
  assert.equal(TIME_TABLE.morning.exp, 1);
  assert.equal(TIME_TABLE.night.exp, 1.05, '夜里曝光略提');
  assert.equal(TIME_TABLE.afternoon.lamps, .1, '傍晚台灯微亮');
  assert.equal(TIME_TABLE.night.lamps, 1, '夜里台灯全开');
  assert.equal(TIME_TABLE.morning.lamps, 0, '白天台灯全关');
});

test('autoTime: 19:00 后与 6:00 前是夜里', () => {
  const at = hour => new Date(2026, 10, 19, hour, 0);
  assert.equal(autoTime(at(3)), 'night');
  assert.equal(autoTime(at(5)), 'night');
  assert.equal(autoTime(at(6)), 'morning');
  assert.equal(autoTime(at(11)), 'morning');
  assert.equal(autoTime(at(12)), 'afternoon');
  assert.equal(autoTime(at(18)), 'afternoon');
  assert.equal(autoTime(at(19)), 'night');
});

test('cycleTime: auto → morning → afternoon → night → auto', () => {
  assert.equal(cycleTime('auto'), 'morning');
  assert.equal(cycleTime('morning'), 'afternoon');
  assert.equal(cycleTime('afternoon'), 'night');
  assert.equal(cycleTime('night'), 'auto');
});

test('default view matches the November camera pose', () => {
  assert.equal(DEFAULT_VIEW.yaw, .72);
  assert.equal(DEFAULT_VIEW.pitch, .6);
  assert.equal(DEFAULT_VIEW.zoom, .6);
  assert.deepEqual(DEFAULT_VIEW.target.toArray(), [0, 1.5, 0]);
});

test('sky texture: 64 rows, sRGB, gradient from bottom to top', () => {
  const texture = makeSkyTexture('#121826', '#2c3b50');
  assert.equal(texture.image.width, 1);
  assert.equal(texture.image.height, 64);
  const data = texture.image.data;
  // 顶行是顶色，底行是底色（lerp 平滑，端点应接近原色）。
  // 第 0 行 = 底色，第 63 行 = 顶色；夜空顶色 #121826 比底色 #2c3b50 暗。
  const firstRow = [data[0], data[1], data[2]];
  const lastRow = [data[63 * 4], data[63 * 4 + 1], data[63 * 4 + 2]];
  assert.ok(firstRow[0] > lastRow[0], '渐变方向：底亮顶暗（颜色经过线性空间转换）');
  texture.dispose();
});
