import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { SolidWorld, CELL, BODY_RADIUS, STEP_HEIGHT, JUMP_HEIGHT } = await import(await loadTs('solidWorld.ts'));

const FLOOR = { x0: -10, x1: 10, y0: -1, y1: 0, z0: -10, z1: 10 };
const BOX = (x, z, top = 1) => ({ x0: x - .5, x1: x + .5, y0: 0, y1: top, z0: z - .5, z1: z + .5 });

test('solids: ground height reads the tallest box under the feet', () => {
  const world = new SolidWorld();
  world.set([FLOOR, BOX(2, 2, .5)]);
  assert.equal(world.groundAt(0, 0, 3), 0, '空地 0');
  assert.equal(world.groundAt(2, 2, 3), .5, '箱子上 .5');
  assert.equal(world.groundAt(2, 2, .2), 0, '脚低于箱顶时站地面');
});

test('solids: buckets only return boxes in range', () => {
  const world = new SolidWorld();
  world.set([FLOOR, BOX(2, 2), BOX(30, 30)]);
  const near = world.near(1, 1, 3, 3, 0, 2);
  assert.equal(near.length, 2, '地面 + 近处箱子');
  assert.equal(world.near(100, 100, 101, 101, 0, 2).length, 0, '远处没有');
});

test('solids: a body inside a box is blocked upward', () => {
  const world = new SolidWorld();
  world.set([FLOOR, BOX(2, 2, 3)]);
  assert.equal(world.blocksAt(2, 2, 0), true, '箱子里被挡');
  assert.equal(world.blocksAt(0, 0, 0), false, '空地不挡');
});

test('solids: water is swimmable, not standable', () => {
  const world = new SolidWorld();
  world.set([FLOOR, { x0: 1, x1: 3, y0: -1, y1: .3, z0: 1, z1: 3, water: true }]);
  assert.equal(world.waterAt(2, 2, 0), true, '水面');
  assert.equal(world.groundAt(2, 2, 1), null, '水面不当地面');
});

test('solids: jumps only clear heights above a step and below reach', () => {
  const world = new SolidWorld();
  const from = { x: 0, y: 0, z: 0 };
  // 台阶高以内是走上去的，不算跳。
  world.set([FLOOR, BOX(2, 2, .3)]);
  assert.equal(world.canJump(from, 2, 2), null, '30cm 台阶是走上去的');
  // 一步高以上、跳跃高度以内可以跳上去。
  world.set([FLOOR, BOX(2, 2, .9)]);
  assert.equal(world.canJump(from, 2, 2), .9, '90cm 平台能跳上去');
  world.set([FLOOR, BOX(2, 2, 5)]);
  assert.equal(world.canJump(from, 2, 2), null, '5m 跳不上去');
  world.set([FLOOR, BOX(2, 2, -.5)]);
  assert.equal(world.canJump(from, 2, 2), null, '往下不算跳');
});

test('solids: constants match the November chunk', () => {
  assert.equal(CELL, 4);
  assert.equal(BODY_RADIUS, .22);
  assert.equal(STEP_HEIGHT, .42);
  assert.equal(JUMP_HEIGHT, 1.7);
});
