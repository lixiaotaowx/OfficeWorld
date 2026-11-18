import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { pixelRatioFor } = await import(await loadTs('hallRendering.ts'));

test('pixel ratio caps at 2 for high and 1.5 for low quality', () => {
  assert.equal(pixelRatioFor(1280, 800, 3, 'high'), 2, 'high 档上限 2');
  assert.equal(pixelRatioFor(1280, 800, 3, 'low'), 1.5, 'low 档上限 1.5');
  assert.equal(pixelRatioFor(1280, 800, 1, 'high'), 1, '设备比低就照用');
});
