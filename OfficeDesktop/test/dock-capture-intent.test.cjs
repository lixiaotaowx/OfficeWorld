const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCaptureIntents } = require('../dock-capture-intent.cjs');

test('dock capture intent is receiver-bound, expires, and is consumed once', () => {
  let now = 100;
  const intents = createCaptureIntents(() => now);
  const main = {}, other = {};
  assert.equal(intents.consume(main), false);
  intents.grant(main);
  assert.equal(intents.consume(other), false);
  assert.equal(intents.consume(main), true);
  assert.equal(intents.consume(main), false);
  intents.grant(main); now += 5000;
  assert.equal(intents.consume(main), false);
});
