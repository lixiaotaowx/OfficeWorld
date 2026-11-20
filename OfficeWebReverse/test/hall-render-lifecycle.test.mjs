import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HallRenderLifecycle, getHallFrameInterval, observeHallVisibility, shouldRefreshHallShadows } from '../src/app/hallRenderLifecycle.js';

test('a visibility event takes precedence over a stale desktop query', async () => {
  const document = Object.assign(new EventTarget(), { hidden: false });
  let reportDesktopVisibility;
  let resolveInitialQuery;
  const window = Object.assign(new EventTarget(), { officeDesktop: {
    onMainWindowVisibility(listener) {
      reportDesktopVisibility = listener;
      return () => { reportDesktopVisibility = undefined; };
    },
    mainWindowVisible: () => new Promise(resolve => { resolveInitialQuery = resolve; }),
  } });
  const observations = [];
  const stop = observeHallVisibility(document, window, visible => observations.push(visible));
  reportDesktopVisibility(false);
  resolveInitialQuery(true);
  await Promise.resolve();
  assert.deepEqual(observations, [true, false]);
  stop();
  document.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(observations, [true, false]);
  assert.equal(reportDesktopVisibility, undefined);
});

test('briefly hiding the hall pauses without releasing the renderer', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const events = [];
  const lifecycle = new HallRenderLifecycle(...['stop', 'start', 'release', 'restore'].map(event => () => events.push(event)), 50);
  lifecycle.setActive(false);
  t.mock.timers.tick(49);
  lifecycle.setActive(true);
  t.mock.timers.tick(10);
  assert.deepEqual(events, ['stop', 'start']);
  lifecycle.setActive(false);
  t.mock.timers.tick(50);
  lifecycle.setActive(true);
  lifecycle.restored();
  assert.deepEqual(events, ['stop', 'start', 'stop', 'release', 'restore', 'start']);
  lifecycle.dispose();
});

test('idle frame and shadow refresh thresholds match the hall policy', () => {
  assert.equal(getHallFrameInterval(40_000, 0, true, false, false), 0);
  assert.equal(getHallFrameInterval(9_999, 0, false, false, false), 31);
  assert.equal(getHallFrameInterval(10_000, 0, false, false, false), 100);
  assert.equal(getHallFrameInterval(30_000, 0, false, false, false), 200);
  assert.equal(getHallFrameInterval(30_000, 0, false, false, true), 31);
  assert.equal(shouldRefreshHallShadows(99, 0, true, true, false), false);
  assert.equal(shouldRefreshHallShadows(100, 0, true, true, false), true);
});
