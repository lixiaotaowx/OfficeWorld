import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, wait } from './helpers.mjs';

test('原生预览需要工位，广播给自己；高清停止不清空原生预览', () => withServer(async ({ connect }) => {
  const a = await connect('原生预览测试'), b = await connect('旁观测试');
  const own = [], remote = [];
  a.on('preview', value => own.push(value));
  b.on('preview', value => remote.push(value));
  const image = 'data:image/jpeg;base64,dGVzdA==';
  a.emit('ambient-sharing', true); a.emit('preview', image);
  await wait(50);
  assert.equal(own.filter(x => x.image).length, 0);
  await a.emitWithAck('seat', 0);
  a.emit('ambient-sharing', true); a.emit('preview', image);
  await wait(50);
  assert.equal(own.at(-1).image, image);
  assert.equal(remote.at(-1).image, image);
  a.emit('sharing', false); await wait(50);
  assert.equal(own.at(-1).image, image);
  a.emit('ambient-sharing', false); await wait(50);
  assert.equal(own.at(-1).image, null);
  a.emit('preview-allowed', false); a.emit('ambient-sharing', true);
  await wait(450); a.emit('preview', image); await wait(50);
  assert.equal(own.at(-1).image, image);
  assert.equal(remote.at(-1).image, image);
}));

test('没有别人能接收时服务端直接说“不用采集”', () => withServer(async ({ connect }) => {
  const a = await connect('甲'), b = await connect('乙');
  const wanted = [], forB = [];
  a.on('ambient', value => wanted.push(value.wanted));
  b.on('ambient', value => forB.push(value.wanted));
  // A seat claim publishes, which is when the answer is sent.
  await a.emitWithAck('seat', 0);
  await wait(60);
  assert.equal(wanted.at(-1), true, '有人能接收时应继续采集');
  // B stops receiving: nobody can watch A, so A may stop capturing.
  b.emit('preview-allowed', false);
  await wait(60);
  assert.equal(wanted.at(-1), false, '没有人在接收就该停下来');
  // B turns it back on: capture resumes.
  b.emit('preview-allowed', true);
  await wait(60);
  assert.equal(wanted.at(-1), true);
  // A switching its OWN reception off must not stop A's upload while B watches.
  a.emit('preview-allowed', false);
  await wait(60);
  assert.equal(wanted.at(-1), true, '只要还有别人能看，A 仍要上传');
  assert.equal(forB.at(-1), false, 'B 侧此时无人可看');
  // Nobody receives anything: both stop capturing.
  b.emit('preview-allowed', false);
  await wait(60);
  assert.equal(wanted.at(-1), false);
  assert.equal(forB.at(-1), false);
}));

test('关闭接收仍上传和看自己，恢复后接收下一帧', () => withServer(async ({ connect }) => {
  const a = await connect('甲'), b = await connect('乙');
  await a.emitWithAck('seat', 0);
  await b.emitWithAck('seat', 1);
  const receivedA = [], receivedB = [];
  a.on('preview', value => receivedA.push(value));
  b.on('preview', value => receivedB.push(value));
  a.emit('ambient-sharing', true);
  b.emit('ambient-sharing', true);
  a.emit('preview-allowed', false);
  await wait(60);
  const image = 'data:image/jpeg;base64,dGVzdA==';
  a.emit('preview', image);
  b.emit('preview', image);
  await wait(100);
  assert.deepEqual(receivedA.map(x => x.id), [a.id]);
  assert.equal(receivedB.filter(x => x.image).length, 2);
  b.emit('ambient-sharing', false);
  await wait(60);
  assert.equal(receivedA.length, 1, '关闭者也不接收他人停止广播');
  a.emit('preview-allowed', true);
  b.emit('ambient-sharing', true);
  await wait(450);
  b.emit('preview', image);
  await wait(100);
  assert.equal(receivedA.at(-1).id, b.id);
  assert.equal(receivedA.at(-1).image, image);
}));
