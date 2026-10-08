// 工位小预览的缩略图循环：300px、6 秒一张、JPEG 0.55（2026-09-14 用户指定）。
// 这一段是从 media.ts 里拆出来的，测试守住它拆出来之后行为没变。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/screenThumbnails.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } },
).outputText;
const { startScreenThumbnails, THUMBNAIL_MAX_EDGE, THUMBNAIL_INTERVAL_MS } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

function sandbox() {
  const videos = [], canvases = [], timers = [], cleared = [];
  let seq = 0;
  globalThis.document = { createElement: tag => {
    if (tag === 'video') {
      const video = { tag, muted: false, srcObject: null, readyState: 2,
        videoWidth: 1920, videoHeight: 1080, played: 0, play: async () => { video.played += 1; } };
      videos.push(video);
      return video;
    }
    const canvas = { tag, width: 0, height: 0, drawn: [],
      getContext: () => ({ drawImage: (...args) => canvas.drawn.push(args) }),
      toDataURL: (type, quality) => `${type}:${canvas.width}x${canvas.height}:${quality}` };
    canvases.push(canvas);
    return canvas;
  } };
  globalThis.setInterval = (fn, ms) => { const id = ++seq; timers.push({ id, fn, ms }); return id; };
  globalThis.clearInterval = id => { cleared.push(id); };
  return { videos, canvases, timers, cleared,
    fire: () => { for (const timer of timers) timer.fn(); } };
}

test('默认 6 秒一张、最长边 300、JPEG 0.55', async () => {
  const box = sandbox();
  assert.equal(THUMBNAIL_INTERVAL_MS, 6_000);
  assert.equal(THUMBNAIL_MAX_EDGE, 300);
  const published = [];
  const thumbnails = await startScreenThumbnails({
    stream: { id: 'capture' }, current: () => true, publicPreview: true,
    publish: image => published.push(image),
  });
  assert.equal(box.timers.length, 1);
  assert.equal(box.timers[0].ms, 6_000);
  assert.equal(box.videos[0].played, 1, '要真的播起来才能抓帧');
  assert.equal(thumbnails.video, box.videos[0]);
  box.fire();
  assert.deepEqual(published, ['image/jpeg:300x169:0.55']);
  assert.equal(box.canvases[0].drawn.length, 1, '要真的把画面画进画布');
  // 画面还没解码好时不要发一张黑图。
  box.videos[0].readyState = 1;
  box.fire();
  assert.equal(published.length, 1);
  thumbnails.stop();
  assert.deepEqual(box.cleared, box.timers.map(timer => timer.id));
  assert.equal(box.videos[0].srcObject, null);
});

test('竖屏保持比例，不被拉成 16:9', async () => {
  const box = sandbox();
  const published = [];
  await startScreenThumbnails({ stream: {}, current: () => true, publicPreview: true,
    publish: image => published.push(image), intervalMs: 100 });
  box.videos[0].videoWidth = 1080; box.videos[0].videoHeight = 1920;
  box.fire();
  assert.deepEqual(published, ['image/jpeg:169x300:0.55']);
});

test('关闭了对外预览：照常抓帧，但不发出去', async () => {
  const box = sandbox();
  const published = [];
  await startScreenThumbnails({ stream: {}, current: () => true, publicPreview: false,
    publish: image => published.push(image) });
  box.fire();
  assert.deepEqual(published, []);
});

test('采集已经不是当前那条：不建循环、也不留播放中的视频', async () => {
  const box = sandbox();
  const thumbnails = await startScreenThumbnails({ stream: {}, current: () => false,
    publicPreview: true, publish: () => { throw Error('不该发布'); } });
  assert.equal(thumbnails.video, null);
  assert.equal(box.timers.length, 0);
  assert.equal(box.videos[0].srcObject, null);
});
