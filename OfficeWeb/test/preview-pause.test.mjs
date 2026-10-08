// 离开电脑暂停采集 ≠ 停止广播：暂停期间客户端**什么都不发**，服务端保留最后一张画面，
// 所以别人屏幕上（和自己桌上那块屏）继续显示离开前的最后一张（用户 2026-09-18）。
//
// 对照组：真正停止（不采集/换屏/失败）时仍然发 ambient-sharing:false，这时才清空。
import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, wait } from './helpers.mjs';

const IMAGE = 'data:image/jpeg;base64,dGVzdA==';

test('暂停期间保持沉默：最后一张留着，不会被清空', () => withServer(async ({ connect }) => {
  const a = await connect('离开的人'), b = await connect('留在工位的人');
  const seen = [];
  b.on('preview', payload => seen.push(payload));
  await a.emitWithAck('seat', 0);
  a.emit('ambient-sharing', true);
  a.emit('preview', IMAGE);
  await wait(80);
  assert.equal(seen.at(-1).image, IMAGE, '先要有画面');

  // "人不在电脑前"：客户端只是不再发帧，别的什么都不说。
  await wait(700);
  assert.equal(seen.at(-1).image, IMAGE, '沉默 0.7 秒后最后一张仍在，屏幕不该变黑');

  // 真正停止广播时才清空（服务端既有约定，别改）。
  a.emit('ambient-sharing', false);
  await wait(80);
  assert.equal(seen.at(-1).image, null, '停止广播才清空');
}));
